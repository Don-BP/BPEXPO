import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL = 'gemini-2.0-flash';

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

    let body: { topic: string; format: 'short' | 'long'; platform: string; reference_url?: string };
    try { body = await req.json(); } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS });
    }

    const isShort = body.format === 'short';
    const prompt = `You are a viral content scriptwriter applying the YouTube Viral Vector Formula.

Topic: ${body.topic}
Format: ${isShort ? 'Short-form (60-180 seconds)' : 'Long-form (5-15 minutes)'}
Platform: ${body.platform}
${body.reference_url ? `Reference URL context: ${body.reference_url}` : ''}

${isShort
    ? `Write a short-form script with:
- hook: one killer opening line (curiosity gap or unexpected modifier)
- beats: 3-5 body points (each 1-3 sentences, short punchy lines)
- cta: one clear call-to-action`
    : `Write a long-form script outline with:
- intro: hook + context (30-60 seconds)
- sections: 4-6 sections, each with a title and 3-5 paragraph-length script`
}

Also generate 5 title variants applying the viral vector formula.

Return ONLY a JSON object:
{
  "title_variants": [
    { "title": "...", "formula": "unexpected_modifier" },
    { "title": "...", "formula": "curiosity_gap" },
    { "title": "...", "formula": "number" },
    { "title": "...", "formula": "contrast" },
    { "title": "...", "formula": "question" }
  ],
  "estimated_duration_seconds": 90,
  "virality_score": 8,
  "script": "Full script text here..."
}`;

    const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
            }),
        }
    );

    if (!resp.ok) {
        const err = await resp.text();
        return new Response(JSON.stringify({ error: err }), { status: 500, headers: CORS });
    }

    const data = await resp.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return new Response(rawText, { headers: { ...CORS, 'Content-Type': 'application/json' } });
});
