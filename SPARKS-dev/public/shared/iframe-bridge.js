/**
 * IframeBridge - Shared communication library for legacy apps
 * Handles unlock coordination between iframe apps and Super App parent
 */
class IframeBridge {
    constructor() {
        this.isEmbedded = window.parent !== window;
        this.isPro = false;
        this.unlocks = new Map(); // featureId -> expiryTimestamp
        this.listeners = new Set();
        this.pendingRequests = new Map(); // requestId -> resolve function
    }

    /**
     * Initialize the bridge
     * - Parse URL params for initial state
     * - Set up message listeners
     * - Request authoritative state from parent
     */
    init() {
        console.log('[IframeBridge] Initializing...');

        // 1. Initial state from URL (UI hint only, not secure)
        const urlParams = new URLSearchParams(window.location.search);
        this.isPro = urlParams.get('isPro') === 'true';

        if (!this.isEmbedded) {
            console.log('[IframeBridge] Running standalone. All features unlocked by default.');
            return;
        }

        // 2. Listen for messages from parent
        window.addEventListener('message', this._handleMessage.bind(this));

        // 3. Request authoritative state
        this._postMessage({ type: 'REQUEST_UNLOCK_STATE' });
    }

    /**
     * Check if a feature is unlocked
     * @param {string} featureId - The unique ID of the feature (e.g., 'tool_dice', 'game_tornado')
     * @returns {boolean} True if unlocked
     */
    isUnlocked(featureId) {
        if (!this.isEmbedded) return true; // Standalone always unlocked
        if (this.isPro) return true;       // Pro users always unlocked

        // Check temporary unlocks
        const expiry = this.unlocks.get(featureId);
        if (!expiry) return false;

        const now = Date.now();
        const isValid = now < expiry;

        if (!isValid) {
            this.unlocks.delete(featureId); // Cleanup expired
        }

        return isValid;
    }

    /**
     * Request execution of an unlock action (show ad)
     * @param {string} featureId - Feature ID to unlock
     * @param {string} featureName - Readable name for the UI
     * @returns {Promise<boolean>} Resolves true if unlocked, false if cancelled/failed
     */
    requestUnlock(featureId, featureName) {
        if (!this.isEmbedded) return Promise.resolve(true);
        if (this.isUnlocked(featureId)) return Promise.resolve(true);

        return new Promise((resolve) => {
            // Store pending request to resolve later
            const requestId = `${featureId}_${Date.now()}`;
            this.pendingRequests.set(featureId, resolve);

            this._postMessage({
                type: 'REQUEST_UNLOCK',
                featureId,
                featureName,
                requestId
            });
        });
    }

    /**
     * Register a callback for state changes
     * @param {Function} callback - Called with { isPro, unlocks }
     */
    onStateChange(callback) {
        this.listeners.add(callback);
        // Fire immediately with current state
        callback({ isPro: this.isPro, unlocks: this.unlocks });
    }

    // Private methods ----------------------------------------------------------

    _handleMessage(event) {
        // In production, you might want to check event.origin here
        // const TRUSTED_ORIGINS = ['https://your-domain.com'];
        // if (!TRUSTED_ORIGINS.includes(event.origin)) return;

        const { type, payload } = event.data;

        switch (type) {
            case 'UNLOCK_STATE':
                this._updateState(event.data);
                break;

            case 'UNLOCK_GRANTED':
                this._handleUnlockGranted(event.data);
                break;
        }
    }

    _updateState(data) {
        if (typeof data.isPro === 'boolean') {
            this.isPro = data.isPro;
        }

        if (data.unlocks) {
            // unexpected format handling could go here
            Object.entries(data.unlocks).forEach(([id, expiry]) => {
                if (typeof expiry === 'number') {
                    this.unlocks.set(id, expiry);
                }
            });
        }

        this._notifyListeners();
    }

    _handleUnlockGranted(data) {
        const { featureId, expiresAt } = data;
        if (featureId && expiresAt) {
            this.unlocks.set(featureId, expiresAt);
            this._notifyListeners();

            // Resolve pending promise if any
            const resolve = this.pendingRequests.get(featureId);
            if (resolve) {
                resolve(true);
                this.pendingRequests.delete(featureId);
            }
        }
    }

    _notifyListeners() {
        const state = {
            isPro: this.isPro,
            unlocks: Object.fromEntries(this.unlocks) // Convert Map to Obj for consumers
        };

        this.listeners.forEach(listener => {
            try {
                listener(state);
            } catch (e) {
                console.error('[IframeBridge] Listener error:', e);
            }
        });
    }

    _postMessage(message) {
        if (window.parent) {
            window.parent.postMessage(message, '*');
        }
    }
}

// Singleton export
window.iframeBridge = new IframeBridge();
