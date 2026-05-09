import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL = 'gemini-2.0-flash';

const PLATFORM_SPECS = `
instagram: 150-char caption + 5 hashtags + visual hook opener
facebook: 80-250 chars, conversational, question or story hook
tiktok: 60-150 chars, hook must be line 1, trending casual language
pinterest: 100-300 chars, keyword-rich, value/outcome focused
twitter_x: ≤280 chars, single punchy idea, no filler
linkedin: 150-300 chars, professional but human, insight-led opener
youtube_shorts: title ≤60 chars + description ≤100 chars, curiosity gap title
email: subject ≤50 chars (line 1: "Subject: ..."), then 3-4 sentence body`;

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

    let body: { source_text: string; source_type: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: CORS });
    }

    const prompt = `You are a content repurposing specialist.

Source type: ${body.source_type}
Source content:
"""
${body.source_text}
"""

Extract the core message, insights, and value. Then adapt it for each of these 8 platforms, following their specific requirements and style:

${PLATFORM_SPECS}

Rules for each adaptation:
- Grade 3-4 reading level
- Write to "you" (one person)
- Sell the click — create curiosity, don't over-explain
- Platform-native voice and format

Return ONLY a valid JSON array of 8 objects:
[
  {
    "platform": "instagram",
    "content": "...",
    "char_count": 142,
    "virality_score": 7
  }
]`;

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
