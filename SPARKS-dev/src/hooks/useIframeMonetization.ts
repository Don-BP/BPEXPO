import { useEffect, useState, useRef, useCallback } from 'react';
import { useWallet } from './useWallet';

interface UnlockRequest {
    featureId: string;
    featureName: string;
    requestId: string;
}

export const useIframeMonetization = (iframeRef: React.RefObject<HTMLIFrameElement | null>) => {
    // Use centralized wallet hook
    const { isPro, isUnlocked, unlockFeature } = useWallet();

    // We still keep adRequest local because the AdModal is local to this view
    // (though global AdModal is also an option, local is fine for iframes)
    const [adRequest, setAdRequest] = useState<UnlockRequest | null>(null);

    // Send state update to iframe whenever unlocking changes
    const sendState = useCallback(() => {
        if (!iframeRef.current?.contentWindow) return;

        const state = {
            type: 'UNLOCK_STATE',
            isPro,
        };

        iframeRef.current.contentWindow.postMessage(state, '*');
    }, [isPro, iframeRef]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // In production, check origin!
            // if (event.origin !== window.origin) return;

            const { type, featureId, featureName, requestId } = event.data;

            if (type === 'REQUEST_UNLOCK_STATE') {
                sendState();
            }

            if (type === 'REQUEST_UNLOCK') {
                const alreadyUnlocked = isPro || isUnlocked(featureId);

                if (alreadyUnlocked) {
                    grantUnlock(featureId, requestId, Date.now() + 7200000);
                } else {
                    // Trigger Ad
                    setAdRequest({ featureId, featureName, requestId });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isPro, isUnlocked, sendState]);

    // Resend state when global unlocks change
    useEffect(() => {
        sendState();
    }, [sendState]);

    const handleAdComplete = () => {
        if (!adRequest) return;

        // 1. Update Global State (Persisted)
        unlockFeature(adRequest.featureId);

        // 2. Notify Iframe
        // We calculate expiry same as useWallet default (2h)
        const expiresAt = Date.now() + 7200000;
        grantUnlock(adRequest.featureId, adRequest.requestId, expiresAt);

        setAdRequest(null);
    };

    const grantUnlock = (featureId: string, requestId?: string, expiresAt?: number) => {
        if (!iframeRef.current?.contentWindow) return;

        iframeRef.current.contentWindow.postMessage({
            type: 'UNLOCK_GRANTED',
            featureId,
            requestId,
            expiresAt
        }, '*');
    };

    const handleAdCancel = () => {
        setAdRequest(null);
    };

    return {
        adRequest,
        handleAdComplete,
        handleAdCancel,
        sendState
    };
};
