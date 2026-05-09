// js/tango-data-bridge.js
// Shared data layer for accessing Tango vocabulary without duplication

console.log('[Tango Bridge] Module loaded');

/**
 * Fetches the Tango vocabulary data from the bp-tango-dev app
 * This assumes both apps are served from the same origin or can access shared localStorage
 * @returns {Promise<Array>} Array of vocabulary objects
 */
export async function getTangoVocabulary() {
    try {
        // Fetch the pronunciation_vocab.js file from shared-data directory
        const response = await fetch('../shared-data/pronunciation_vocab.js');
        const text = await response.text();

        // Extract the vocabulary array using regex
        // Match: const vocabulary = [...];
        const match = text.match(/const vocabulary = (\[[\s\S]*?\]);/);
        if (!match) {
            console.error('Could not parse vocabulary data from Tango');
            return [];
        }

        // Safely evaluate the array (using Function constructor instead of eval)
        const vocabulary = new Function('return ' + match[1])();
        return vocabulary;
    } catch (error) {
        console.error('Error fetching Tango vocabulary:', error);
        return [];
    }
}

/**
 * Gets unique categories from Tango vocabulary
 * @returns {Promise<Array<string>>} Array of unique category names
 */
export async function getTangoCategories() {
    const vocabulary = await getTangoVocabulary();
    const categories = [...new Set(vocabulary.map(card => card.category))];
    return categories.sort();
}

/**
 * Gets all cards for a specific category
 * @param {string} categoryName - The category to filter by
 * @returns {Promise<Array>} Array of card objects in that category
 */
export async function getTangoCardsByCategory(categoryName) {
    const vocabulary = await getTangoVocabulary();
    return vocabulary.filter(card => card.category === categoryName);
}

/**
 * Retrieves user-created sets from Tango's localStorage
 * @returns {Array} Array of saved sets
 */
export function getUserCreatedSets() {
    try {
        const savedSets = localStorage.getItem('bp_tango_saved_sets');
        if (!savedSets) return [];
        return JSON.parse(savedSets);
    } catch (error) {
        console.error('Error reading user-created Tango sets:', error);
        return [];
    }
}

/**
 * Resolves an array of word IDs to full card objects
 * @param {Array<string>} wordIds - Array of vocabulary IDs (e.g., ['g1_happy', 'g2_school'])
 * @returns {Promise<Array>} Array of full card objects
 */
export async function resolveWordIds(wordIds) {
    const vocabulary = await getTangoVocabulary();
    const vocabMap = new Map(vocabulary.map(card => [card.id, card]));

    return wordIds
        .map(id => vocabMap.get(id))
        .filter(card => card !== undefined); // Filter out any missing cards
}

/**
 * Transforms Tango card format to Teacher Tools format
 * @param {Array} tangoCards - Array of Tango vocabulary objects
 * @returns {Array} Array of cards in Teacher Tools format
 */
export function transformToTeacherToolsFormat(tangoCards) {
    return tangoCards.map(card => ({
        text: card.word,
        image: card.image,
        category: card.category,
        tangoId: card.id,
        muted: false, // Default to not muted; will be overridden by metadata
        // Preserve additional Tango data for reference
        _tango: {
            grade: card.grade,
            katakana: card.katakana,
            hiragana: card.hiragana,
            kanji: card.kanji
        }
    }));
}

/**
 * Gets vocabulary for a user-created set
 * @param {number|string} setId - The ID of the user-created set
 * @returns {Promise<Array>} Array of cards in Teacher Tools format
 */
export async function getUserSetCards(setId) {
    const userSets = getUserCreatedSets();
    const set = userSets.find(s => s.id === setId);

    if (!set) {
        console.error(`User set with ID ${setId} not found`);
        return [];
    }

    const cards = await resolveWordIds(set.wordIds);
    return transformToTeacherToolsFormat(cards);
}

/**
 * Gets vocabulary for a Tango category
 * @param {string} categoryName - The category name
 * @returns {Promise<Array>} Array of cards in Teacher Tools format
 */
export async function getCategoryCards(categoryName) {
    const cards = await getTangoCardsByCategory(categoryName);
    return transformToTeacherToolsFormat(cards);
}
