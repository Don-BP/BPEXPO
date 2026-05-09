import vocabulary from '../modules/tango/data/pronunciation_vocab.js';
import { getAllFlashcardSets, getAllTangoCardMetadata, FlashCard, FlashcardDecks } from './db';

interface TangoVocabItem {
  id: string;
  word: string;
  image: string;
  category: string;
  grade: number;
}

interface TangoSavedSet {
  id: unknown;
  name: string;
  wordIds: unknown[];
}

function toCard(v: TangoVocabItem, muted: boolean): FlashCard {
  return { text: v.word, image: v.image, tangoId: v.id, muted };
}

export function getTangoDecks(mutedMap: Record<string, boolean> = {}): FlashcardDecks {
  const vocab = vocabulary as TangoVocabItem[];
  const result: FlashcardDecks = {};

  // Vocabulary categories
  for (const v of vocab) {
    const key = `Tango: ${v.category}`;
    if (!result[key]) result[key] = [];
    result[key].push(toCard(v, mutedMap[v.id] ?? false));
  }

  // User-created sets from localStorage (written by Tango app)
  try {
    const raw = localStorage.getItem('bp_tango_saved_sets');
    if (raw) {
      const sets: TangoSavedSet[] = JSON.parse(raw);
      const vocabMap = new Map(vocab.map(v => [String(v.id), v]));
      for (const set of sets) {
        const cards = set.wordIds
          .map(id => vocabMap.get(String(id)))
          .filter((v): v is TangoVocabItem => !!v)
          .map(v => toCard(v, mutedMap[v.id] ?? false));
        if (cards.length > 0) result[`Tango: ${set.name}`] = cards;
      }
    }
  } catch {
    // localStorage unavailable or corrupted
  }

  return result;
}

export async function getAllDecks(): Promise<FlashcardDecks> {
  const [customSets, mutedMap] = await Promise.all([
    getAllFlashcardSets(),
    getAllTangoCardMetadata(),
  ]);
  const tangoDecks = getTangoDecks(mutedMap);
  return { ...tangoDecks, ...customSets };
}
