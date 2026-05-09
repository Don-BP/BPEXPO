import 'dotenv/config';
import Exa from 'exa-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PineconeActivityRecord, ACTIVITIES_KNOWLEDGE } from './activities-knowledge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Paths ──────────────────────────────────────────────────────────
const CACHE_PATH = path.join(__dirname, '.scrape-cache.json');
const FAILURES_PATH = path.join(__dirname, '..', 'scrape-failures.log');
const OUTPUT_PATH = path.join(__dirname, 'scraped-activities-kb.ts');

const GEMINI_MODEL = 'gemini-3.1-flash-lite';

// ── SDK clients ────────────────────────────────────────────────────
const exa = new Exa(process.env.SPARKS_EXA_API_KEY!);

// ── Source configs ─────────────────────────────────────────────────
const EXA_SOURCES = [
  { slug: 'altopedia', query: 'site:altopedia.com esl activity game english', maxUrls: 10 },
  { slug: 'englipedia', query: 'site:englipedia.com activity game english japan', maxUrls: 10 },
  { slug: 'iteslj', query: 'site:iteslj.org/games game activity esl', maxUrls: 10 },
  { slug: 'busyteacher', query: 'site:busyteacher.org esl game classroom activity', maxUrls: 10 },
];

const CRAWL_SOURCES = [
  { slug: 'miyagi-jets', url: 'https://miyagijets.wordpress.com/work/alt-resources/' },
  { slug: 'tokyo-shoseki', url: 'https://ten.tokyo-shoseki.co.jp/support/shou/tm/eigo/' },
  { slug: 'akita-jet', url: 'https://akitajet.com/wiki/Teaching_resources' },
  { slug: 'mext', url: 'https://www.mext.go.jp/en/policy/education/elsec/1373870.html' },
  { slug: 'twinkl-jp', url: 'https://www.twinkl.jp/blog/teaching-resources-for-alts-teaching-english-in-japan' },
  { slug: 'miyazaki-ajet', url: 'https://miyazakiajet.org/new-home-page/the-jet-portal/majet-teaching-materials-collection/' },
  { slug: 'altopedia-net', url: 'https://www.altopedia.net/' },
  { slug: 'kobe-jet', url: 'https://www.kobejet.com/en/lessons' },
];

const PDF_SOURCE = {
  slug: 'altcir-handbook',
  url: 'https://jetprogramme.org/wp-content/MAIN-PAGE/current/publications/altcirseahandbook/7all.pdf',
};

// ── Cache ──────────────────────────────────────────────────────────
interface CacheData {
  completedSources: string[];
  urlQueue: Array<{ url: string; source: string }>;
  pdfChunks: Array<{ text: string; source: string }>;
  extractedRecords: Partial<PineconeActivityRecord>[];
  processedUrls: string[];
}

function loadCache(): CacheData {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return { completedSources: [], urlQueue: [], pdfChunks: [], extractedRecords: [], processedUrls: [] };
  }
}

function saveCache(cache: CacheData): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// ── Rate limiting ──────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Utilities ──────────────────────────────────────────────────────
function logFailure(url: string, error: string): void {
  fs.appendFileSync(FAILURES_PATH, `${new Date().toISOString()} ${url} — ${error}\n`);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toKebab(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Jina Reader ────────────────────────────────────────────────────
async function jinaFetch(url: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { 'Accept': 'text/plain', 'X-Return-Format': 'markdown' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Jina error ${res.status}`);
  return res.text();
}

function extractLinksFromMarkdown(markdown: string): string[] {
  const found = new Set<string>();
  for (const m of markdown.matchAll(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g)) {
    found.add(m[2].trim());
  }
  for (const m of markdown.matchAll(/(?<![(\[])(https?:\/\/[^\s<>"',;)\]]+)/g)) {
    found.add(m[1].replace(/[.,;)]+$/, ''));
  }
  return [...found].filter(u => u.startsWith('http'));
}

// ── Extraction schema ──────────────────────────────────────────────
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

// ── Stage 1A: Exa search discovery ────────────────────────────────
async function discoverViaExa(
  source: typeof EXA_SOURCES[0],
  cache: CacheData
): Promise<Array<{ url: string; source: string }>> {
  if (cache.completedSources.includes(`exa-${source.slug}`)) {
    console.log(`  [${source.slug}] Skipping (cached)`);
    return [];
  }
  console.log(`  [${source.slug}] Searching Exa: "${source.query}"`);
  try {
    const results = await exa.search(source.query, { numResults: source.maxUrls, type: 'keyword' });
    const urls = results.results.map(r => ({ url: r.url, source: source.slug }));
    console.log(`  [${source.slug}] Found ${urls.length} URLs`);
    cache.completedSources.push(`exa-${source.slug}`);
    saveCache(cache);
    await sleep(1000);
    return urls;
  } catch (err: any) {
    console.warn(`  [${source.slug}] Exa search failed: ${err.message}`);
    return [];
  }
}

// ── Stage 1B: Jina link discovery ─────────────────────────────────
async function discoverViaJina(
  source: typeof CRAWL_SOURCES[0],
  cache: CacheData
): Promise<Array<{ url: string; source: string }>> {
  if (cache.completedSources.includes(`crawl-${source.slug}`)) {
    console.log(`  [${source.slug}] Skipping (cached)`);
    return [];
  }
  console.log(`  [${source.slug}] Fetching links via Jina: ${source.url}`);
  try {
    const markdown = await jinaFetch(source.url);
    const links = extractLinksFromMarkdown(markdown);
    const urls = [...new Set(links)].map(u => ({ url: u, source: source.slug }));
    console.log(`  [${source.slug}] Found ${urls.length} linked URLs`);
    cache.completedSources.push(`crawl-${source.slug}`);
    saveCache(cache);
    await sleep(3000);
    return urls;
  } catch (err: any) {
    console.warn(`  [${source.slug}] Jina fetch failed: ${err.message}`);
    return [];
  }
}

// ── Stage 1C: PDF extraction via Jina ─────────────────────────────
async function extractPdfChunks(cache: CacheData): Promise<Array<{ text: string; source: string }>> {
  if (cache.completedSources.includes(`pdf-${PDF_SOURCE.slug}`)) {
    console.log(`  [${PDF_SOURCE.slug}] Skipping (cached)`);
    return cache.pdfChunks.filter(c => c.source === PDF_SOURCE.slug);
  }
  console.log(`  [${PDF_SOURCE.slug}] Fetching PDF via Jina...`);
  try {
    const markdown = await jinaFetch(PDF_SOURCE.url);
    if (!markdown || markdown.length < 100) throw new Error('No content returned');
    const chunks = markdown
      .split(/\n(?=#{1,3}\s+[A-Z]|\n\d+\.\s+[A-Z])/g)
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 100);
    const mapped = chunks.map((text: string) => ({ text, source: PDF_SOURCE.slug }));
    console.log(`  [${PDF_SOURCE.slug}] Split into ${mapped.length} chunks`);
    cache.completedSources.push(`pdf-${PDF_SOURCE.slug}`);
    cache.pdfChunks.push(...mapped);
    saveCache(cache);
    return mapped;
  } catch (err: any) {
    console.warn(`  [${PDF_SOURCE.slug}] PDF extraction failed: ${err.message}`);
    return [];
  }
}

// ── Stage 2: Jina fetch → Gemini extraction per URL ───────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Missing GOOGLE_AI_API_KEY');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  const data: any = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function extractFromUrl(
  entry: { url: string; source: string }
): Promise<Partial<PineconeActivityRecord> | null> {
  try {
    const markdown = await jinaFetch(entry.url);
    if (!markdown || markdown.length < 100) return null;
    const prompt = EXTRACTION_PROMPT + '\n\nContent to extract from:\n' + markdown.slice(0, 8000) + '\n\nReturn ONLY valid JSON. No markdown fences, no commentary.';
    const raw = await callGemini(prompt);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    if (!clean || clean === 'null') return null;
    const rec = JSON.parse(clean) as Partial<PineconeActivityRecord>;
    (rec as any).__source = entry.source;
    return { ...rec, content_type: 'activity' };
  } catch (err: any) {
    logFailure(entry.url, err.message);
    return null;
  }
}

async function extractFromPdfChunk(
  chunk: { text: string; source: string }
): Promise<Partial<PineconeActivityRecord> | null> {
  try {
    const prompt = EXTRACTION_PROMPT + '\n\nContent to extract from:\n' + chunk.text + '\n\nReturn ONLY valid JSON. No markdown fences, no commentary.';
    const raw = await callGemini(prompt);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    if (!clean) return null;
    const rec = JSON.parse(clean) as Partial<PineconeActivityRecord>;
    (rec as any).__source = chunk.source;
    return { ...rec, content_type: 'activity' };
  } catch (err: any) {
    logFailure(`pdf-chunk:${chunk.source}`, err.message);
    return null;
  }
}

// ── Stage 3: Validation ────────────────────────────────────────────
const VALID_ACTIVITY_TYPES = new Set(['Warm-up', 'Main Game', 'Production', 'Review', 'Filler']);
const VALID_SKILLS = new Set(['Speaking', 'Listening', 'Reading', 'Writing', 'Mixed']);
const VALID_INTERACTIONS = new Set(['Whole class', 'Pairs', 'Groups', 'Individual']);

function clampInt(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function validateRecord(raw: Partial<PineconeActivityRecord>): PineconeActivityRecord | null {
  if (!raw.name?.trim()) return null;
  if (!raw.text || raw.text.length < 50) return null;
  if (!VALID_ACTIVITY_TYPES.has(raw.activity_type as string)) return null;
  if (!VALID_SKILLS.has(raw.skill as string)) raw.skill = 'Mixed';
  if (!VALID_INTERACTIONS.has(raw.interaction as string)) raw.interaction = 'Whole class';

  let minG = typeof raw.min_grade_numeric === 'number' ? clampInt(raw.min_grade_numeric, 3, 9) : null;
  let maxG = typeof raw.max_grade_numeric === 'number' ? clampInt(raw.max_grade_numeric, 3, 9) : null;
  if (minG === null || maxG === null) return null;
  if (maxG < minG) maxG = minG;

  const dur = typeof raw.duration_minutes === 'number' && raw.duration_minutes > 0
    ? Math.round(raw.duration_minutes) : 10;
  const complexity = typeof raw.complexity_max === 'number'
    ? clampInt(raw.complexity_max, 1, 5) : 3;

  return {
    id: '',
    text: raw.text.trim(),
    content_type: 'activity',
    name: raw.name.trim(),
    activity_type: raw.activity_type as PineconeActivityRecord['activity_type'],
    skill: raw.skill as PineconeActivityRecord['skill'],
    duration_minutes: dur,
    min_grade_numeric: minG,
    max_grade_numeric: maxG,
    complexity_max: complexity,
    interaction: raw.interaction as PineconeActivityRecord['interaction'],
    materials: Array.isArray(raw.materials) ? raw.materials.map(String) : [],
    topic_tags: Array.isArray(raw.topic_tags) ? raw.topic_tags.map(String) : [],
  };
}

// ── Stage 3: Deduplication ─────────────────────────────────────────
function isDuplicate(name: string, existing: string[]): boolean {
  const norm = normalise(name);
  return existing.some(e => levenshtein(norm, normalise(e)) <= 1);
}

// ── Stage 3: Output file ───────────────────────────────────────────
function writeOutputFile(records: PineconeActivityRecord[]): void {
  const lines = records.map(r => '  ' + JSON.stringify(r)).join(',\n');
  const content = `import { PineconeActivityRecord } from './activities-knowledge';\n\nexport const SCRAPED_ACTIVITIES: PineconeActivityRecord[] = [\n${lines}\n];\n`;
  fs.writeFileSync(OUTPUT_PATH, content, 'utf-8');
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  if (!process.env.SPARKS_EXA_API_KEY) { console.error('Missing SPARKS_EXA_API_KEY'); process.exit(1); }
  if (!process.env.GOOGLE_AI_API_KEY) { console.error('Missing GOOGLE_AI_API_KEY'); process.exit(1); }

  const cache = loadCache();
  console.log(`Cache: ${cache.completedSources.length} completed sources, ${cache.urlQueue.length} queued URLs`);

  // Stage 1A: Exa search
  console.log('\nStage 1A: Exa search discovery...');
  for (const source of EXA_SOURCES) {
    const urls = await discoverViaExa(source, cache);
    cache.urlQueue.push(...urls);
    saveCache(cache);
  }

  // Stage 1B: Jina link discovery
  console.log('\nStage 1B: Jina link discovery from aggregators...');
  for (const source of CRAWL_SOURCES) {
    const urls = await discoverViaJina(source, cache);
    cache.urlQueue.push(...urls);
    saveCache(cache);
  }

  // Stage 1C: PDF
  console.log('\nStage 1C: PDF extraction via Jina...');
  const pdfChunks = await extractPdfChunks(cache);

  console.log(`\nDiscovery complete: ${cache.urlQueue.length} URLs + ${pdfChunks.length} PDF chunks`);

  // Stage 2: Extract
  console.log('\nStage 2: Extracting activity records via Gemini 3.1 Flash Lite...');
  let extracted = 0, failed = 0;

  const processedSet = new Set(cache.processedUrls ?? []);
  const totalUrls = cache.urlQueue.length;
  for (const entry of cache.urlQueue) {
    if (processedSet.has(entry.url)) continue;
    const r = await extractFromUrl(entry);
    if (r) { cache.extractedRecords.push(r); extracted++; }
    else failed++;
    processedSet.add(entry.url);
    cache.processedUrls = [...processedSet];
    saveCache(cache);
    const done = processedSet.size;
    console.log(`  [URLs] ${done}/${totalUrls} processed — ${extracted} extracted, ${failed} failed`);
    await sleep(1000);
  }

  const totalChunks = pdfChunks.length;
  for (let i = 0; i < totalChunks; i++) {
    const r = await extractFromPdfChunk(pdfChunks[i]);
    if (r) { cache.extractedRecords.push(r); extracted++; }
    else failed++;
    saveCache(cache);
    if ((i + 1) % 10 === 0 || i === totalChunks - 1) {
      console.log(`  [PDF] ${i + 1}/${totalChunks} chunks — ${extracted} extracted total`);
    }
    await sleep(500);
  }

  // Stage 3: Validate + deduplicate + write
  console.log('\nStage 3: Validating and writing output...');
  const existingNames = ACTIVITIES_KNOWLEDGE.map(a => a.name);
  const accepted: PineconeActivityRecord[] = [];
  let validFailed = 0, dupeCount = 0;
  const counters: Record<string, number> = {};

  for (const raw of cache.extractedRecords) {
    const validated = validateRecord(raw);
    if (!validated) { validFailed++; continue; }
    if (isDuplicate(validated.name, [...existingNames, ...accepted.map(a => a.name)])) {
      dupeCount++; continue;
    }
    const source = (raw as any).__source ?? 'unknown';
    counters[source] = (counters[source] ?? 0) + 1;
    const idx = String(counters[source]).padStart(3, '0');
    validated.id = `scraped-${source}-${toKebab(validated.name)}-${idx}`;
    accepted.push(validated);
  }

  writeOutputFile(accepted);
  console.log(`\nDone! Written to scripts/scraped-activities-kb.ts`);
  console.log(`  Extracted: ${extracted}`);
  console.log(`  Validation failed: ${validFailed}`);
  console.log(`  Duplicates skipped: ${dupeCount}`);
  console.log(`  Accepted: ${accepted.length}`);
  console.log(`  Failures logged to: scrape-failures.log`);
}

main().catch(err => { console.error(err); process.exit(1); });
