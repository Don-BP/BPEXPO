const DB_NAME = 'DonDB';
const DB_VERSION = 5;
const STORE = 'soundBoards';

export interface SfxItem {
  id: string;
  name: string;
  soundData: string | null;
  color?: string;
}

export interface StoredBoard {
  sfx: SfxItem[];
  music: { name: string; data: string }[];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      for (const name of ['flashcardSets', 'jeopardyGames', 'lessonMenus', 'soundBoards']) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
      if (!db.objectStoreNames.contains('tangoCardMetadata')) {
        const s = db.createObjectStore('tangoCardMetadata', { keyPath: 'tangoId' });
        s.createIndex('mutedIndex', 'muted', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function getAllSoundBoards(): Promise<Record<string, StoredBoard>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const keyReq = store.getAllKeys();
    const valReq = store.getAll();
    let keys: IDBValidKey[], values: StoredBoard[];
    keyReq.onsuccess = () => { keys = keyReq.result; if (values) done(); };
    valReq.onsuccess = () => { values = valReq.result; if (keys) done(); };
    keyReq.onerror = valReq.onerror = () => reject(keyReq.error ?? valReq.error);
    function done() {
      const result: Record<string, StoredBoard> = {};
      keys.forEach((k, i) => { result[k as string] = values[i]; });
      resolve(result);
    }
  });
}

export async function saveSoundBoard(name: string, data: StoredBoard): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(data, name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSoundBoard(name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function importSoundBoards(boards: Record<string, StoredBoard>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const promises = Object.entries(boards).map(([name, data]) =>
      new Promise<void>((res, rej) => {
        const req = store.put(data, name);
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error);
      })
    );
    Promise.all(promises).then(() => resolve()).catch(err => { tx.abort(); reject(err); });
  });
}
