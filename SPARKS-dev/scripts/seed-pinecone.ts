import 'dotenv/config';
import { TEXTBOOK_UNITS_KNOWLEDGE, PineconeTextbookRecord } from './textbook-knowledge';
import { ACTIVITIES_KNOWLEDGE, PineconeActivityRecord } from './activities-knowledge';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST!;
const PINECONE_INFERENCE_URL = 'https://api.pinecone.io/embed';
const PINECONE_API_VERSION = '2024-10';
const EMBED_MODEL = 'llama-text-embed-v2';

if (!PINECONE_API_KEY || !PINECONE_INDEX_HOST) {
  console.error('Missing PINECONE_API_KEY or PINECONE_INDEX_HOST in environment');
  process.exit(1);
}

type AnyRecord = PineconeTextbookRecord | PineconeActivityRecord;

/** Call Pinecone Inference API to embed a batch of texts. */
async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await fetch(PINECONE_INFERENCE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': PINECONE_API_KEY,
      'X-Pinecone-API-Version': PINECONE_API_VERSION,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      inputs: texts.map(t => ({ text: t })),
      parameters: { input_type: 'passage', truncate: 'END' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinecone embed failed (${response.status}): ${error}`);
  }

  const data = await response.json() as { data: { values: number[] }[] };
  return data.data.map(d => d.values);
}

/** Upsert pre-computed vectors into the index. */
async function upsertVectors(
  namespace: string,
  vectors: { id: string; values: number[]; metadata: Record<string, unknown> }[]
): Promise<void> {
  const response = await fetch(`${PINECONE_INDEX_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': PINECONE_API_KEY,
    },
    body: JSON.stringify({ namespace, vectors }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinecone upsert failed (${response.status}): ${error}`);
  }
}

/** Embed then upsert a batch of knowledge records. */
async function seedBatch(namespace: string, records: AnyRecord[]): Promise<void> {
  const EMBED_BATCH = 50;   // max texts per embed call
  const UPSERT_BATCH = 100; // max vectors per upsert call

  for (let i = 0; i < records.length; i += EMBED_BATCH) {
    const chunk = records.slice(i, i + EMBED_BATCH);
    const texts = chunk.map(r => r.text);

    // Step 1: embed
    const embeddings = await embedTexts(texts);

    // Step 2: build vector objects (metadata = all fields except text)
    const vectors = chunk.map((record, idx) => {
      const { text, ...rest } = record as AnyRecord & { text: string };
      return {
        id: record.id,
        values: embeddings[idx],
        metadata: { text, ...rest } as Record<string, unknown>,
      };
    });

    // Step 3: upsert (split further if needed)
    for (let j = 0; j < vectors.length; j += UPSERT_BATCH) {
      await upsertVectors(namespace, vectors.slice(j, j + UPSERT_BATCH));
    }

    const batchEnd = Math.min(i + EMBED_BATCH, records.length);
    console.log(`  Embedded & upserted records ${i + 1}–${batchEnd} of ${records.length}`);

    // Rate-limit courtesy pause between embed batches
    if (i + EMBED_BATCH < records.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

async function main() {
  console.log('Pinecone index:', PINECONE_INDEX_HOST);
  console.log('Embed model:  ', EMBED_MODEL);

  let scrapedRecords: PineconeActivityRecord[] = [];
  try {
    const mod = await import('./scraped-activities-kb.js');
    scrapedRecords = mod.SCRAPED_ACTIVITIES;
    console.log(`Loaded ${scrapedRecords.length} scraped activity records.`);
  } catch {
    console.log('No scraped-activities-kb.ts found — seeding hand-authored records only.');
  }
  const allActivities = [...ACTIVITIES_KNOWLEDGE, ...scrapedRecords];

  console.log(`\nSeeding ${TEXTBOOK_UNITS_KNOWLEDGE.length} textbook unit records → namespace "textbook-units"...`);
  await seedBatch('textbook-units', TEXTBOOK_UNITS_KNOWLEDGE);
  console.log('Textbook units complete.');

  console.log(`\nSeeding ${allActivities.length} activity records → namespace "activities"...`);
  await seedBatch('activities', allActivities);
  console.log('Activities complete.');

  console.log('\nPinecone seeding complete!');
  console.log(`  textbook-units : ${TEXTBOOK_UNITS_KNOWLEDGE.length} records`);
  console.log(`  activities     : ${allActivities.length} records (${ACTIVITIES_KNOWLEDGE.length} hand-authored + ${scrapedRecords.length} scraped)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
