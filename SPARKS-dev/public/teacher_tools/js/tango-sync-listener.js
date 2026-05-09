// js/tango-sync-listener.js
// Automatic synchronization listener for Tango set changes

import { updateAllFlashcardCategorySelects } from './utils.js';

/**
 * Initialize the Tango sync listener
 * Listens for localStorage changes from Tango app and updates dropdowns accordingly
 */
export function initTangoSyncListener() {
    // Listen for storage events (triggered when localStorage changes in another tab/iframe)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bp_tango_saved_sets') {
            console.log('[Tango Sync] Detected changes to Tango saved sets - refreshing dropdowns');
            updateAllFlashcardCategorySelects();
        }
    });

    // Also ensure dropdowns are populated on initial load
    window.addEventListener('load', () => {
        console.log('[Tango Sync] Initializing - populating dropdowns with Tango sets');
        updateAllFlashcardCategorySelects();
    });

    console.log('[Tango Sync] Listener initialized');
}
