/**
 * Monetization Adapter for Teacher Tools
 * Wraps existing tools with unlock gates and ad banners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Graceful degradation: if bridge missing or not embedded, do nothing
    if (!window.iframeBridge || !window.iframeBridge.isLocked) {
        // NOTE: isLocked doesn't exist on bridge, we use isEmbedded check
        // but let's re-read the bridge code. 
        // Ah, bridge has isEmbedded.
    }

    const bridge = window.iframeBridge;
    if (!bridge || !bridge.isEmbedded) {
        console.log('[Monetization] Running standalone, skip gating');
        return;
    }

    bridge.init();

    // Core Free Tools (Never locked)
    // ID Mapping: CSS ID -> Feature ID
    // e.g. "name-picker-tool" -> "name_picker"
    const FREE_TOOLS = [
        'name_picker',
        'whats_missing',
        'bingo',
        'timer',                // Classroom Timer
        'flashcards_card_id',   // Flashcards (ID: flashcards-tool-card-id)
        'flashcard_manager'     // Flashcard Manager
    ];

    const toolCards = document.querySelectorAll('.tool-card');

    /**
     * Parse tool ID from DOM element ID
     * e.g., "name-picker-tool" -> "name_picker"
     */
    function getToolId(elementId) {
        return elementId.replace('-tool', '').replace(/-/g, '_');
    }

    // 1. Lock Overlay Logic
    function applyLocks(state) {
        const { isPro, unlocks } = state;

        toolCards.forEach(card => {
            const domId = card.id;
            if (!domId) return;

            const toolId = getToolId(domId);

            // Skip free tools
            if (FREE_TOOLS.includes(toolId)) return;

            // Check unlock status
            // Use bridge helper which handles isPro check too
            if (bridge.isUnlocked(`tool_${toolId}`)) {
                unlockCard(card);
            } else {
                lockCard(card, toolId);
            }
        });
    }

    function lockCard(card, toolId) {
        if (card.classList.contains('is-locked')) return; // Already locked

        card.classList.add('is-locked');

        // Add lock icon overlay
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'lock-overlay';
        lockOverlay.innerHTML = `
            <div class="lock-content">
                <span class="lock-icon">🔒</span>
                <span class="lock-text">Watch Ad to Unlock (2h)</span>
            </div>
        `;

        // Intercept clicks
        lockOverlay.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();

            const title = card.querySelector('h2')?.textContent || toolId;
            const unlocked = await bridge.requestUnlock(`tool_${toolId}`, title);

            if (unlocked) {
                unlockCard(card);
            }
        });

        card.style.position = 'relative';
        card.appendChild(lockOverlay);
    }

    function unlockCard(card) {
        card.classList.remove('is-locked');
        const overlay = card.querySelector('.lock-overlay');
        if (overlay) overlay.remove();
    }

    // 2. Banner Ad Logic (Setup Phase Only)
    // We only show banner if User is FREE
    function handleBanner(state) {
        // PER REQUEST: Removed visible banner ads for now to avoid showing them to students.
        // Original logic preserved in comments if needed later.

        const existingBanner = document.getElementById('tt-banner-ad');
        if (existingBanner) existingBanner.remove();

        /*
        if (state.isPro) {
            if (existingBanner) existingBanner.remove();
            return;
        }

        if (!existingBanner) {
            insertBannerAd();
        }
        */
    }

    function insertBannerAd() {
        const banner = document.createElement('div');
        banner.id = 'tt-banner-ad';
        banner.className = 'banner-ad-placeholder';
        banner.textContent = 'AD PLACEMENT';

        // Insert at very top
        document.body.prepend(banner);
        document.body.classList.add('has-banner');
    }

    // Listen for state changes
    bridge.onStateChange((state) => {
        applyLocks(state);
        handleBanner(state);
    });
});
