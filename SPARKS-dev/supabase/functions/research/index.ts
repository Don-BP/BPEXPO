import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY')!;
const EXA_API_KEY = Deno.env.get('SPARKS_EXA_API_KEY')!;
const FIRECRAWL_API_KEY = Deno.env.get('SPARKS_FIRECRAWL_API_KEY')!;
const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY')!;
const PINECONE_INDEX_HOST = Deno.env.get('PINECONE_INDEX_HOST')!;

const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const VALID_CATEGORIES = ['opportunities', 'competitors', 'market_signals'] as const;
type Category = typeof VALID_CATEGORIES[number];

interface ResultItem {
    title: string;
    url: string;
    summary: string;
    source: 'exa' | 'firecrawl' | 'gemini';
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

    let query: string;
    let category: Category;
    try {
        const body = await req.json();
        query = (body.query ?? '').trim();
        category = body.category;
    } catch {
        return jsonResponse({ ok: false, error: 'Invalid request body' });
    }

    if (!query) return jsonResponse({ ok: false, error: 'query is required' });
    if (!(VALID_CATEGORIES as readonly string[]).includes(category)) {
        return jsonResponse({ ok: false, error: 'Invalid category' });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1. Exa search
    let exaResults: Array<{ title: string; url: string; text: string }> = [];
    try {
        const exaResp = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': EXA_API_KEY },
            body: JSON.stringify({
                query,
                numResults: 5,
                useAutoprompt: true,
                contents: { text: true },
            }),
        });
        if (!exaResp.ok) throw new Error(`Exa ${exaResp.status}: ${await exaResp.text()}`);
        const exaData = await exaResp.json();
        exaResults = (exaData.results ?? []).map((r: Record<string, unknown>) => ({
            title: String(r.title ?? ''),
            url: String(r.url ?? ''),
            text: String(r.text ?? ''),
        }));
    } catch (e) {
        return jsonResponse({ ok: false, error: `Exa error: ${(e as Error).message}` });
    }

    // 2. Firecrawl scrape top 2 URLs (best-effort)
    const topUrls = exaResults.slice(0, 2).map((r) => r.url);
    const scraped: Record<string, string> = {};
    await Promise.allSettled(topUrls.map(async (url) => {
        try {
            const fcResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                },
                body: JSON.stringify({ url, formats: ['markdown'] }),
            });
            if (fcResp.ok) {
                const fcData = await fcResp.json();
                scraped[url] = fcData.data?.markdown ?? '';
            }
        } catch { /* best-effort */ }
    }));

    // 3. Gemini summarize
    const systemPrompt = `You are a research assistant for SPARKS, an EFL teacher app in the Philippines.
Given web search results and scraped page content, extract the most relevant findings.

Return ONLY a JSON array of up to 5 objects:
[{ "title": string, "url": string, "summary": string, "source": "firecrawl" | "exa" | "gemini" }]

Use "firecrawl" if the URL was deeply scraped, "exa" for search-snippet-only items, "gemini" for synthesized insights (use url="" for these).
Summaries: 2-4 sentences, specific and actionable for an EdTech business in the Philippines.`;

    const inputPayload = JSON.stringify({
        query,
        category,
        exa_results: exaResults,
        scraped_content: scraped,
    });

    let results: ResultItem[] = [];
    try {
        const geminiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GOOGLE_AI_API_KEY,
                },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: inputPayload }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
            }
        );
        if (!geminiResp.ok) throw new Error(`Gemini ${geminiResp.status}: ${await geminiResp.text()}`);
        const geminiData = await geminiResp.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (!rawText) throw new Error('Gemini returned empty content');
        results = JSON.parse(rawText);
        if (!Array.isArray(results)) throw new Error('Gemini response is not an array');
    } catch (e) {
        return jsonResponse({ ok: false, error: `Gemini error: ${(e as Error).message}` });
    }

    // 4. Insert into Supabase
    const toInsert = results.map((r) => ({
        category,
        query,
        title: r.title,
        url: r.url ?? '',
        summary: r.summary,
        source: r.source,
    }));

    const { data: inserted, error: insertErr } = await supabase
        .from('research_results')
        .insert(toInsert)
        .select();

    if (insertErr) return jsonResponse({ ok: false, error: `DB insert error: ${insertErr.message}` });

    // 5. Embed + upsert to Pinecone (best-effort — failures don't block the response)
    await Promise.allSettled((inserted ?? []).map(async (row) => {
        try {
            const text = `${row.title} ${row.summary}`;
            const embedResp = await fetch('https://api.pinecone.io/embed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': PINECONE_API_KEY,
                    'X-Pinecone-API-Version': '2024-10',
                },
                body: JSON.stringify({
                    model: 'llama-text-embed-v2',
                    inputs: [{ text }],
                    parameters: { input_type: 'passage', truncate: 'END' },
                }),
            });
            if (!embedResp.ok) return;
            const embedData = await embedResp.json();
            const values: number[] = embedData.data?.[0]?.values ?? [];
            if (values.length === 0) return;

            await fetch(`${PINECONE_INDEX_HOST}/vectors/upsert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': PINECONE_API_KEY,
                },
                body: JSON.stringify({
                    namespace: 'research',
                    vectors: [{
                        id: row.id,
                        values,
                        metadata: {
                            category: row.category,
                            query: row.query,
                            title: row.title,
                            url: row.url,
                            summary: row.summary,
                            searched_at: row.searched_at,
                        },
                    }],
                }),
            });
        } catch { /* best-effort */ }
    }));

    return jsonResponse({ ok: true, results: inserted ?? [] });
});

function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
    });
}
