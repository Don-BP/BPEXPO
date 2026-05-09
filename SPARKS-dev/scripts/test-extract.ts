/**
 * Quick extraction test — runs 3 URLs through fetch+Gemini and prints results.
 * Run: tsx --env-file=supabase/.env scripts/test-extract.ts
 */

const TEST_URLS = [
  'https://akitajet.com/wiki/Phonics',
  'https://akitajet.com/wiki/Animals',
  'https://m.busyteacher.org/21269-last-minute-class-8-great-games.html',
];

const EXTRACTION_PROMPT = `Extract this ESL/EFL teaching activity as a JSON record for Japanese public school ALTs.
Return ONLY a JSON object with EXACTLY these field names (no other keys):
{
  "name": "short activity name",
  "text": "200-400 word prose describing how the activity works step by step, what language skills it targets, suitable grade levels, materials needed, and classroom tips",
  "activity_type": "one of exactly: Warm-up | Main Game | Production | Review | Filler",
  "skill": "one of exactly: Speaking | Listening | Reading | Writing | Mixed",
  "duration_minutes": 15,
  "min_grade_numeric": 5,
  "max_grade_numeric": 7,
  "complexity_max": 2,
  "interaction": "one of exactly: Whole class | Pairs | Groups | Individual",
  "materials": ["item1", "item2"],
  "topic_tags": ["tag1", "tag2"]
}
Grade numerics: 3=Elementary Grade3, 4=Grade4, 5=Grade5, 6=Grade6, 7=JH Year1, 8=JH Year2, 9=JH Year3.
If the content does not describe a classroom activity, return null.`;

async function htmlToText(html: string): Promise<string> {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function testUrl(url: string) {
  const apiKey = process.env.GOOGLE_AI_API_KEY!;
  console.log(`\n─── ${url}`);

  try {
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ActivityScraper/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!pageRes.ok) { console.log(`  ✗ HTTP ${pageRes.status}`); return; }
    const html = await pageRes.text();
    const pageText = await htmlToText(html);
    console.log(`  ✓ Fetched ${pageText.length} chars of text`);

    const prompt = EXTRACTION_PROMPT + '\n\nContent to extract from:\n' + pageText.slice(0, 8000) + '\n\nReturn ONLY valid JSON. No markdown fences, no commentary.';
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    if (!geminiRes.ok) { console.log(`  ✗ Gemini ${geminiRes.status}`); return; }
    const data: any = await geminiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    if (!clean || clean === 'null') { console.log('  ✗ Gemini returned null (not an activity page)'); return; }

    const rec = JSON.parse(clean);
    console.log('  ✓ Extracted:', JSON.stringify(rec, null, 4));
  } catch (err: any) {
    console.log(`  ✗ Error: ${err.message}`);
  }
}

async function main() {
  if (!process.env.GOOGLE_AI_API_KEY) { console.error('Missing GOOGLE_AI_API_KEY'); process.exit(1); }
  for (const url of TEST_URLS) {
    await testUrl(url);
  }
  console.log('\nTest complete.');
}

main().catch(console.error);
