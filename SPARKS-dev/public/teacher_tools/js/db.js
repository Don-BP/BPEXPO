// js/db.js

const DB_NAME = 'DonDB';
const FLASHCARD_STORE_NAME = 'flashcardSets';
const JEOPARDY_STORE_NAME = 'jeopardyGames';
const LESSON_MENU_STORE_NAME = 'lessonMenus';
const SOUND_BOARD_STORE_NAME = 'soundBoards';
const TANGO_CARD_METADATA_STORE_NAME = 'tangoCardMetadata'; // Stores muted state for Tango cards
const DB_VERSION = 5; // Incremented to add Tango card metadata store
let db;

/**
 * Initializes the IndexedDB database.
 * This function must be called and awaited before any other DB operations.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject("Database error");
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(FLASHCARD_STORE_NAME)) {
                dbInstance.createObjectStore(FLASHCARD_STORE_NAME);
            }
            if (!dbInstance.objectStoreNames.contains(JEOPARDY_STORE_NAME)) {
                dbInstance.createObjectStore(JEOPARDY_STORE_NAME);
            }
            if (!dbInstance.objectStoreNames.contains(LESSON_MENU_STORE_NAME)) {
                dbInstance.createObjectStore(LESSON_MENU_STORE_NAME);
            }
            if (!dbInstance.objectStoreNames.contains(SOUND_BOARD_STORE_NAME)) {
                dbInstance.createObjectStore(SOUND_BOARD_STORE_NAME);
            }
            // Add the new store for Tango card metadata (muted state, etc.)
            if (!dbInstance.objectStoreNames.contains(TANGO_CARD_METADATA_STORE_NAME)) {
                const metadataStore = dbInstance.createObjectStore(TANGO_CARD_METADATA_STORE_NAME, { keyPath: 'tangoId' });
                metadataStore.createIndex('mutedIndex', 'muted', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

// --- ORIGINAL FLASHCARD FUNCTIONS (Unchanged) ---
export function saveSet(setName, cards) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([FLASHCARD_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FLASHCARD_STORE_NAME);
        const request = store.put(cards, setName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => { console.error("Error saving set:", event.target.error); reject(event.target.error); };
    });
}
export function getAllSets() {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([FLASHCARD_STORE_NAME], 'readonly');
        const store = transaction.objectStore(FLASHCARD_STORE_NAME);
        const keyRequest = store.getAllKeys();
        const valueRequest = store.getAll();
        let keys, values;
        keyRequest.onsuccess = () => { keys = keyRequest.result; if (values) complete(); };
        valueRequest.onsuccess = () => { values = valueRequest.result; if (keys) complete(); };
        keyRequest.onerror = valueRequest.onerror = (event) => { console.error("Error getting all sets:", event.target.error); reject(event.target.error); };
        function complete() { const allDecks = {}; keys.forEach((key, index) => { allDecks[key] = values[index]; }); resolve(allDecks); }
    });
}
export function deleteSet(setName) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([FLASHCARD_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FLASHCARD_STORE_NAME);
        const request = store.delete(setName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => { console.error("Error deleting set:", event.target.error); reject(event.target.error); };
    });
}
export function importDecks(decks) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([FLASHCARD_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FLASHCARD_STORE_NAME);
        const promises = Object.entries(decks).map(([setName, cards]) => { return new Promise((resolvePut, rejectPut) => { const request = store.put(cards, setName); request.onsuccess = () => resolvePut(); request.onerror = () => rejectPut(request.error); }); });
        Promise.all(promises).then(() => resolve()).catch(error => { console.error("Error during bulk import:", error); transaction.abort(); reject(error); });
    });
}

// --- JEOPARDY GAME FUNCTIONS (Unchanged) ---
export function saveJeopardyGame(gameName, gameData) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([JEOPARDY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(JEOPARDY_STORE_NAME);
        const request = store.put(gameData, gameName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}
export function getAllJeopardyGames() {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([JEOPARDY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(JEOPARDY_STORE_NAME);
        const keyRequest = store.getAllKeys();
        const valueRequest = store.getAll();
        let keys, values;
        keyRequest.onerror = valueRequest.onerror = (event) => reject(event.target.error);
        keyRequest.onsuccess = () => { keys = keyRequest.result; if (values !== undefined) complete(); };
        valueRequest.onsuccess = () => { values = valueRequest.result; if (keys !== undefined) complete(); };
        function complete() { const allGames = {}; keys.forEach((key, index) => { allGames[key] = values[index]; }); resolve(allGames); }
    });
}
export function deleteJeopardyGame(gameName) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([JEOPARDY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(JEOPARDY_STORE_NAME);
        const request = store.delete(gameName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}
export function importJeopardyGames(games) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([JEOPARDY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(JEOPARDY_STORE_NAME);
        const promises = Object.entries(games).map(([gameName, gameData]) => { return new Promise((res, rej) => { const request = store.put(gameData, gameName); request.onsuccess = () => res(); request.onerror = () => rej(request.error); }); });
        Promise.all(promises).then(() => resolve()).catch(error => { transaction.abort(); reject(error); });
    });
}

// --- NEW LESSON MENU FUNCTIONS ---

export function saveLessonMenu(menuName, menuData) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([LESSON_MENU_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(LESSON_MENU_STORE_NAME);
        const request = store.put(menuData, menuName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export function getAllLessonMenus() {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([LESSON_MENU_STORE_NAME], 'readonly');
        const store = transaction.objectStore(LESSON_MENU_STORE_NAME);
        const keyRequest = store.getAllKeys();
        const valueRequest = store.getAll();
        let keys, values;
        keyRequest.onerror = valueRequest.onerror = (event) => reject(event.target.error);
        keyRequest.onsuccess = () => {
            keys = keyRequest.result;
            if (values !== undefined) complete();
        };
        valueRequest.onsuccess = () => {
            values = valueRequest.result;
            if (keys !== undefined) complete();
        };
        function complete() {
            const allMenus = {};
            keys.forEach((key, index) => { allMenus[key] = values[index]; });
            resolve(allMenus);
        }
    });
}

export function deleteLessonMenu(menuName) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([LESSON_MENU_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(LESSON_MENU_STORE_NAME);
        const request = store.delete(menuName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export function importLessonMenus(menus) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([LESSON_MENU_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(LESSON_MENU_STORE_NAME);
        const promises = Object.entries(menus).map(([menuName, menuData]) => {
            return new Promise((res, rej) => {
                const request = store.put(menuData, menuName);
                request.onsuccess = () => res();
                request.onerror = () => rej(request.error);
            });
        });
        Promise.all(promises).then(() => resolve()).catch(error => {
            transaction.abort();
            reject(error);
        });
    });
}

// --- NEW SOUND BOARD FUNCTIONS ---

export function saveSoundBoard(boardName, boardData) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([SOUND_BOARD_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SOUND_BOARD_STORE_NAME);
        const request = store.put(boardData, boardName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export function getAllSoundBoards() {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([SOUND_BOARD_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SOUND_BOARD_STORE_NAME);
        const keyRequest = store.getAllKeys();
        const valueRequest = store.getAll();
        let keys, values;
        keyRequest.onerror = valueRequest.onerror = (event) => reject(event.target.error);
        keyRequest.onsuccess = () => {
            keys = keyRequest.result;
            if (values !== undefined) complete();
        };
        valueRequest.onsuccess = () => {
            values = valueRequest.result;
            if (keys !== undefined) complete();
        };
        function complete() {
            const allBoards = {};
            keys.forEach((key, index) => { allBoards[key] = values[index]; });
            resolve(allBoards);
        }
    });
}

export function deleteSoundBoard(boardName) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([SOUND_BOARD_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SOUND_BOARD_STORE_NAME);
        const request = store.delete(boardName);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export function importSoundBoards(boards) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([SOUND_BOARD_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SOUND_BOARD_STORE_NAME);
        const promises = Object.entries(boards).map(([boardName, boardData]) => {
            return new Promise((res, rej) => {
                const request = store.put(boardData, boardName);
                request.onsuccess = () => res();
                request.onerror = () => rej(request.error);
            });
        });
        Promise.all(promises).then(() => resolve()).catch(error => {
            transaction.abort();
            reject(error);
        });
    });
}

// --- TANGO CARD METADATA FUNCTIONS ---

/**
 * Saves or updates the muted state for a Tango card
 * @param {string} tangoId - The Tango card ID (e.g., 'g1_happy')
 * @param {boolean} muted - Whether the card is muted
 * @returns {Promise<void>}
 */
export function saveTangoCardMutedState(tangoId, muted) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([TANGO_CARD_METADATA_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TANGO_CARD_METADATA_STORE_NAME);
        const metadata = {
            tangoId,
            muted,
            timestamp: Date.now()
        };
        const request = store.put(metadata);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Gets the muted state for a specific Tango card
 * @param {string} tangoId - The Tango card ID
 * @returns {Promise<boolean>} Whether the card is muted (defaults to false)
 */
export function getTangoCardMutedState(tangoId) {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([TANGO_CARD_METADATA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TANGO_CARD_METADATA_STORE_NAME);
        const request = store.get(tangoId);
        request.onsuccess = () => {
            const metadata = request.result;
            resolve(metadata ? metadata.muted : false);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 *Gets all Tango card metadata
 * @returns {Promise<Object>} Map of tangoId to metadata object
 */
export function getAllTangoCardMetadata() {
    return new Promise(async (resolve, reject) => {
        await initDB();
        const transaction = db.transaction([TANGO_CARD_METADATA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TANGO_CARD_METADATA_STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            const metadataArray = request.result;
            const metadataMap = {};
            metadataArray.forEach(item => {
                metadataMap[item.tangoId] = item;
            });
            resolve(metadataMap);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}