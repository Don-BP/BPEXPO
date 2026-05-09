/**
 * Monetization Adapter for Classroom Games
 * Initializes bridge and exposes global state for React
 */

// Graceful degradation
if (window.iframeBridge && window.iframeBridge.isEmbedded) {
    const bridge = window.iframeBridge;
    bridge.init();

    // 1. Expose to React via Window
    window.monetization = {
        isPro: bridge.isPro,
        isUnlocked: (gameId) => bridge.isUnlocked(`game_${gameId}`),
        requestUnlock: (gameId, gameName) => bridge.requestUnlock(`game_${gameId}`, gameName)
    };

    // 2. Dispatch event for React useEffect
    // We delay slightly to ensure React has mounted listeners if loading race occurs
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('monetizationReady', {
            detail: window.monetization
        }));
    }, 100);

    // 3. Listen for state updates from bridge
    bridge.onStateChange((state) => {
        // Update global
        window.monetization.isPro = state.isPro;

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('monetizationUpdate', {
            detail: window.monetization
        }));
    });

    // 4. Banner Ad (Game Selection Menu Only)
    // We'll let React handle this via a component, or inject here if React structure allows.
    // React is better for positioning.
} else {
    console.log('[CG Monetization] Standalone or bridge missing.');
}
