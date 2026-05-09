import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXA_API_KEY         = Deno.env.get('SPARKS_EXA_API_KEY')!;
const FIRECRAWL_API_KEY   = Deno.env.get('SPARKS_FIRECRAWL_API_KEY')!;
const GOOGLE_AI_API_KEY   = Deno.env.get('GOOGLE_AI_API_KEY')!;
const PINECONE_API_KEY    = Deno.env.get('PINECONE_API_KEY')!;
const PINECONE_INDEX_HOST = Deno.env.get('PINECONE_INDEX_HOST')!;

const GEMINI_MODEL = 'gemini-2.0-flash-lite';

function getNativeLanguage(country: string): string {
  const c = country.toLowerCase();
  if (c.includes('japan'))                                                   return 'Japanese';
  if (c.includes('korea'))                                                   return 'Korean';
  if (c.includes('china') || c.includes('taiwan'))                          return 'Mandarin Chinese';
  if (c.includes('germany') || c.includes('austria'))                       return 'German';
  if (c.includes('france') || c.includes('belgium'))                        return 'French';
  if (c.includes('spain') || c.includes('mexico') || c.includes('colombia') ||
      c.includes('argentina') || c.includes('chile') || c.includes('peru')) return 'Spanish';
  if (c.includes('brazil') || c.includes('portugal'))                       return 'Portuguese';
  if (c.includes('italy'))                                                   return 'Italian';
  if (c.includes('russia'))                                                  return 'Russian';
  if (c.includes('thailand'))                                                return 'Thai';
  if (c.includes('vietnam'))                                                 return 'Vietnamese';
  if (c.includes('indonesia'))                                               return 'Indonesian';
  if (c.includes('turkey'))                                                  return 'Turkish';
  if (c.includes('poland'))                                                  return 'Polish';
  if (c.includes('netherlands') || c.includes('dutch'))                     return 'Dutch';
  return 'English';
}

async function callGemini(prompt: string, jsonMode = false): Promise<string> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE_AI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: jsonMode
          ? { responseMimeType: 'application/json' }
          : { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    }
  );
  if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let mode: string, campaign_id: string;
  let query: string | undefined;
  let prospect_ids: string[] | undefined;

  try {
    const body = await req.json();
    mode = body.mode;
    campaign_id = body.campaign_id;
    query = body.query;
    prospect_ids = body.prospect_ids;
  } catch {
    return json({ ok: false, error: 'Invalid request body' });
  }

  if (!['discover', 'enrich', 'draft'].includes(mode)) {
    return json({ ok: false, error: 'mode must be discover | enrich | draft' });
  }
  if (!campaign_id) return json({ ok: false, error: 'campaign_id is required' });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // ── DISCOVER ──────────────────────────────────────────────────────────────
  if (mode === 'discover') {
    if (!query?.trim()) return json({ ok: false, error: 'query required for discover' });

    let exaResults: unknown[] = [];
    try {
      const resp = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': EXA_API_KEY },
        body: JSON.stringify({
          query: `${query} teacher educator email contact`,
          numResults: 20,
          useAutoprompt: true,
          contents: { text: true },
        }),
      });
      if (!resp.ok) throw new Error(`Exa ${resp.status}: ${await resp.text()}`);
      exaResults = (await resp.json()).results ?? [];
    } catch (e) {
      return json({ ok: false, error: `Exa error: ${(e as Error).message}` });
    }

    const extractPrompt = `From these web search results about teachers/educators, extract prospect contact information.
Return ONLY a JSON array (up to 20 objects):
[{ "name": string, "email": string, "website": string, "country": string, "role": string }]
- name: full name (empty string if unknown)
- email: email address (empty string if not found in results)
- website: school/org/personal site URL
- country: country name in English
- role: e.g. "ESL Teacher", "School Principal", "Curriculum Coordinator"
Only include prospects where email OR website is non-empty.

Search results:
${JSON.stringify(exaResults.slice(0, 10))}`;

    let prospects: Array<{ name: string; email: string; website: string; country: string; role: string }> = [];
    try {
      const raw = await callGemini(extractPrompt, true);
      const parsed = JSON.parse(raw);
      prospects = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return json({ ok: false, error: `Extract error: ${(e as Error).message}` });
    }

    const toInsert = prospects
      .filter(p => p.email || p.website)
      .map(p => ({
        campaign_id,
        name: p.name ?? '',
        email: p.email ?? '',
        website: p.website ?? '',
        country: p.country ?? '',
        role: p.role ?? '',
        send_status: 'pending',
      }));

    if (!toInsert.length) return json({ ok: true, inserted: 0 });

    const { error } = await supabase.from('email_prospects').insert(toInsert);
    if (error) return json({ ok: false, error: `DB insert: ${error.message}` });
    return json({ ok: true, inserted: toInsert.length });
  }

  // ── ENRICH ────────────────────────────────────────────────────────────────
  if (mode === 'enrich') {
    let q = supabase
      .from('email_prospects')
      .select('id, campaign_id, name, email, website, country, role')
      .eq('campaign_id', campaign_id)
      .eq('send_status', 'pending');

    if (prospect_ids?.length) q = q.in('id', prospect_ids);

    const { data: prospects, error } = await q;
    if (error) return json({ ok: false, error: error.message });
    if (!prospects?.length) return json({ ok: true, enriched: 0 });

    let enriched = 0;
    await Promise.allSettled(
      prospects.map(async (p) => {
        let scraped_context = '';
        if (p.website) {
          try {
            const fcResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
              body: JSON.stringify({ url: p.website, formats: ['markdown'] }),
            });
            if (fcResp.ok) {
              const fcData = await fcResp.json();
              scraped_context = String(fcData.data?.markdown ?? '').slice(0, 3000);
            }
          } catch { /* best-effort */ }
        }
        await supabase.from('email_prospects')
          .update({ scraped_context, send_status: 'enriched' })
          .eq('id', p.id);
        enriched++;

        // Pinecone — embed + upsert (best-effort, non-blocking)
        if (scraped_context) {
          try {
            const text = [p.name, p.role, p.country, scraped_context.slice(0, 1000)].filter(Boolean).join(' ');
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
            if (embedResp.ok) {
              const embedData = await embedResp.json();
              const values: number[] = embedData.data?.[0]?.values ?? [];
              if (values.length > 0) {
                await fetch(`${PINECONE_INDEX_HOST}/vectors/upsert`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
                  body: JSON.stringify({
                    namespace: 'prospects',
                    vectors: [{
                      id: p.id,
                      values,
                      metadata: {
                        campaign_id: p.campaign_id,
                        name: p.name,
                        email: p.email,
                        country: p.country,
                        role: p.role,
                        website: p.website,
                      },
                    }],
                  }),
                });
              }
            }
          } catch { /* best-effort */ }
        }
      })
    );

    return json({ ok: true, enriched });
  }

  // ── DRAFT ─────────────────────────────────────────────────────────────────
  if (mode === 'draft') {
    const { data: campaign } = await supabase
      .from('email_campaigns').select('goal').eq('id', campaign_id).single();
    const campaignGoal = campaign?.goal ?? '';

    // Fetch cold_email strategy for injection
    let coldEmailStrategy = '';
    try {
      const { data: stratRow } = await supabase
        .from('active_strategies')
        .select('strategy')
        .eq('module', 'cold_email')
        .single();
      coldEmailStrategy = stratRow?.strategy && !stratRow.strategy.startsWith('No strategy')
        ? `\nCurrent strategy context (apply these learnings):\n${stratRow.strategy}\n`
        : '';
    } catch { /* no strategy yet — fine */ }

    let q = supabase
      .from('email_prospects')
      .select('id, name, email, country, role, scraped_context')
      .eq('campaign_id', campaign_id)
      .eq('send_status', 'enriched');

    if (prospect_ids?.length) q = q.in('id', prospect_ids);

    const { data: prospects, error } = await q;
    if (error) return json({ ok: false, error: error.message });
    if (!prospects?.length) return json({ ok: true, drafted: 0 });

    let drafted = 0;
    await Promise.allSettled(
      prospects.map(async (p) => {
        const nativeLang = getNativeLanguage(p.country);
        const isEnglishOnly = nativeLang === 'English';

        const prompt = `You are an expert cold email writer for SPARKS, an educational teaching app that helps teachers create engaging lessons with AI-powered tools. SPARKS is for all teachers globally.

Prospect details:
- Name: ${p.name || 'Educator'}
- Role: ${p.role || 'Teacher'}
- Country: ${p.country || 'Unknown'}
- Website/context: ${p.scraped_context ? p.scraped_context.slice(0, 1500) : 'No website data available'}

Campaign goal: ${campaignGoal}
${coldEmailStrategy}

Requirements:
1. Identify their most likely teaching pain point from the context above.
2. Write a compelling, personalized email connecting SPARKS to that specific pain point.
3. Concise: subject line + 3-4 paragraph body. Sign off as "The SPARKS Team". No placeholder text.
${isEnglishOnly
  ? `4. English only.\nFormat exactly:\nSubject: [subject line]\n[email body]`
  : `4. Write TWICE: first in ${nativeLang}, then in English, separated by "---".\nFormat exactly:\nSubject: [subject in ${nativeLang}]\n[body in ${nativeLang}]\n---\nSubject: [subject in English]\n[body in English]`
}`;

        try {
          const raw = await callGemini(prompt, false);
          if (!raw) return;

          const lines = raw.split('\n');
          const subjectIdx = lines.findIndex(l => /^subject:/i.test(l));
          const subject = subjectIdx >= 0
            ? lines[subjectIdx].replace(/^subject:\s*/i, '').trim()
            : '';
          const body = subjectIdx >= 0
            ? lines.slice(subjectIdx + 1).join('\n').trim()
            : raw.trim();

          await supabase.from('email_prospects').update({
            draft_subject: subject,
            draft_body: body,
            send_status: 'drafted',
          }).eq('id', p.id);
          drafted++;
        } catch { /* best-effort — keep as enriched */ }
      })
    );

    return json({ ok: true, drafted });
  }

  return json({ ok: false, error: 'Unknown mode' });
});

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
