// Shared IndexedDB utility — same DB as the HTML Teacher Tools (DonDB v5)
// Opening at the same version keeps both the iframe and React components in sync.

const DB_NAME = 'DonDB';
const DB_VERSION = 5;

let _db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      ['flashcardSets', 'jeopardyGames', 'lessonMenus', 'soundBoards'].forEach(s => {
        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
      });
      if (!db.objectStoreNames.contains('tangoCardMetadata')) {
        const ms = db.createObjectStore('tangoCardMetadata', { keyPath: 'tangoId' });
        ms.createIndex('mutedIndex', 'muted', { unique: false });
      }
    };
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };
  });
}

// --- Lesson Menu ---

export interface MenuItem {
  text: string;
  time: string | null;
  notes: string | null;
  cleared: boolean;
  isNew?: boolean;
}

export type SavedMenus = Record<string, MenuItem[]>;

const LM_STORE = 'lessonMenus';

export async function saveLessonMenu(name: string, items: Omit<MenuItem, 'isNew'>[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction([LM_STORE], 'readwrite').objectStore(LM_STORE).put(items, name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllLessonMenus(): Promise<SavedMenus> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([LM_STORE], 'readonly');
    const store = tx.objectStore(LM_STORE);
    const keyReq = store.getAllKeys();
    const valReq = store.getAll();
    let keys: IDBValidKey[] | undefined;
    let values: MenuItem[][] | undefined;
    const done = () => {
      if (!keys || !values) return;
      const result: SavedMenus = {};
      keys.forEach((k, i) => { result[k as string] = values![i]; });
      resolve(result);
    };
    keyReq.onsuccess = () => { keys = keyReq.result; done(); };
    valReq.onsuccess = () => { values = valReq.result; done(); };
    keyReq.onerror = valReq.onerror = () => reject('DB error');
  });
}

export async function deleteLessonMenu(name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction([LM_STORE], 'readwrite').objectStore(LM_STORE).delete(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function importLessonMenus(menus: SavedMenus): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([LM_STORE], 'readwrite');
    const store = tx.objectStore(LM_STORE);
    Promise.all(
      Object.entries(menus).map(([name, data]) =>
        new Promise<void>((res, rej) => {
          const req = store.put(data, name);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      )
    ).then(() => resolve()).catch(err => { tx.abort(); reject(err); });
  });
}

// --- Flashcard Sets ---

export interface FlashCard {
  text?: string;
  image?: string;
  muted?: boolean;
  tangoId?: string;
}

export type FlashcardDecks = Record<string, FlashCard[]>;

const FC_STORE = 'flashcardSets';

// Live (unsaved) set — reflects in-progress edits from FlashcardManager
let _liveSet: { name: string; cards: FlashCard[] } | null = null;

export function setLiveFlashcardSet(name: string, cards: FlashCard[]): void {
  _liveSet = name.trim() ? { name: name.trim(), cards: JSON.parse(JSON.stringify(cards)) } : null;
}

export async function getAllFlashcardSets(): Promise<FlashcardDecks> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FC_STORE], 'readonly');
    const store = tx.objectStore(FC_STORE);
    const keyReq = store.getAllKeys();
    const valReq = store.getAll();
    let keys: IDBValidKey[] | undefined;
    let values: FlashCard[][] | undefined;
    const done = () => {
      if (!keys || !values) return;
      const result: FlashcardDecks = {};
      keys.forEach((k, i) => { result[k as string] = values![i]; });
      // Overlay unsaved in-progress edits so other tools see live changes
      if (_liveSet) result[_liveSet.name] = _liveSet.cards;
      resolve(result);
    };
    keyReq.onsuccess = () => { keys = keyReq.result; done(); };
    valReq.onsuccess = () => { values = valReq.result; done(); };
    keyReq.onerror = valReq.onerror = () => reject('DB error');
  });
}

export async function saveFlashcardSet(name: string, cards: FlashCard[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction([FC_STORE], 'readwrite').objectStore(FC_STORE).put(cards, name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFlashcardSet(name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction([FC_STORE], 'readwrite').objectStore(FC_STORE).delete(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function importFlashcardDecks(data: FlashcardDecks): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FC_STORE], 'readwrite');
    const store = tx.objectStore(FC_STORE);
    Promise.all(
      Object.entries(data).map(([name, cards]) =>
        new Promise<void>((res, rej) => {
          const req = store.put(cards, name);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      )
    ).then(() => resolve()).catch(err => { tx.abort(); reject(err); });
  });
}

// --- Jeopardy Games ---

export interface JeopardyClue {
  points: number;
  answer: string;
  question: string;
  image: string | null;
  revealed: boolean;
}

export interface JeopardyCategory {
  title: string;
  clues: JeopardyClue[];
}

export interface JeopardyGame {
  title: string;
  categories: JeopardyCategory[];
}

export type JeopardyGames = Record<string, JeopardyGame>;

const JG_STORE = 'jeopardyGames';

export async function getAllJeopardyGames(): Promise<JeopardyGames> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([JG_STORE], 'readonly');
    const store = tx.objectStore(JG_STORE);
    const keyReq = store.getAllKeys();
    const valReq = store.getAll();
    let keys: IDBValidKey[] | undefined;
    let values: JeopardyGame[] | undefined;
    const done = () => {
      if (!keys || !values) return;
      const result: JeopardyGames = {};
      keys.forEach((k, i) => { result[k as string] = values![i]; });
      resolve(result);
    };
    keyReq.onsuccess = () => { keys = keyReq.result; done(); };
    valReq.onsuccess = () => { values = valReq.result; done(); };
    keyReq.onerror = valReq.onerror = () => reject('DB error');
  });
}

export async function saveJeopardyGame(title: string, game: JeopardyGame): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction([JG_STORE], 'readwrite').objectStore(JG_STORE).put(game, title);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteJeopardyGame(title: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction([JG_STORE], 'readwrite').objectStore(JG_STORE).delete(title);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function importJeopardyGames(games: JeopardyGames): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([JG_STORE], 'readwrite');
    const store = tx.objectStore(JG_STORE);
    Promise.all(
      Object.entries(games).map(([title, game]) =>
        new Promise<void>((res, rej) => {
          const req = store.put(game, title);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      )
    ).then(() => resolve()).catch(err => { tx.abort(); reject(err); });
  });
}

export async function saveTangoCardMutedState(tangoId: string, muted: boolean): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(['tangoCardMetadata'], 'readwrite')
      .objectStore('tangoCardMetadata').put({ tangoId, muted });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllTangoCardMetadata(): Promise<Record<string, boolean>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(['tangoCardMetadata'], 'readonly')
      .objectStore('tangoCardMetadata').getAll();
    req.onsuccess = () => {
      const map: Record<string, boolean> = {};
      (req.result as { tangoId: string; muted: boolean }[]).forEach(r => { map[r.tangoId] = r.muted; });
      resolve(map);
    };
    req.onerror = () => reject(req.error);
  });
}
