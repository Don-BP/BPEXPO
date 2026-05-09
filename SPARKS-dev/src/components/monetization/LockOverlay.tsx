import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import AdComponent from './AdComponent';
import { useWallet } from '../../hooks/useWallet';

interface LockOverlayProps {
    featureId: string;
    featureName?: string;
    children?: React.ReactNode;
    blurAmount?: 'sm' | 'md' | 'lg' | 'none';
    darkness?: 'light' | 'medium' | 'dark';
}

const LockOverlay: React.FC<LockOverlayProps> = ({
    featureId,
    featureName = 'Feature',
    children,
    blurAmount = 'sm',
    darkness = 'light'
}) => {
    // We access global state via hook
    // But typically this component is used conditionally by the parent *if locked*
    // However, it can also self-manage if we want

    // Let's assume parent checks `isUnlocked` before rendering children vs overlay,
    // OR parent renders this AS an overlay on top of content.

    // Ideally: This component WRAPS content and handles the logic.
    const { isUnlocked, isPro, unlockFeature } = useWallet();
    const [showAd, setShowAd] = useState(false);

    // If unlocked, just render children
    const unlocked = isPro || isUnlocked(featureId);

    if (unlocked) {
        return <>{children}</>;
    }

    const handleUnlockClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowAd(true);
    };

    const handleAdComplete = () => {
        unlockFeature(featureId);
        setShowAd(false);
    };

    const getBlurClass = () => {
        switch (blurAmount) {
            case 'sm': return 'backdrop-blur-sm';
            case 'md': return 'backdrop-blur-md';
            case 'lg': return 'backdrop-blur-lg';
            default: return '';
        }
    };

    const getBgClass = () => {
        switch (darkness) {
            case 'dark': return 'bg-slate-900/80';
            case 'medium': return 'bg-slate-900/50';
            default: return 'bg-white/60';
        }
    };

    return (
        <div className="relative w-full h-full min-h-[100px] overflow-hidden group">
            {/* Background Content (Blurred) */}
            <div className={`w-full h-full filter ${blurAmount !== 'none' ? 'blur-[2px]' : ''} pointer-events-none select-none opacity-50`}>
                {children}
            </div>

            {/* Overlay */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center ${getBgClass()} ${getBlurClass()} p-4 text-center transition-all hover:bg-opacity-70`}>

                <div className="bg-white rounded-full p-3 shadow-lg mb-3 transform group-hover:scale-110 transition-transform duration-200">
                    <Lock size={24} className="text-slate-700" />
                </div>

                {featureName && (
                    <h3 className="font-bold text-slate-800 mb-2 drop-shadow-sm">{featureName}</h3>
                )}

                <button
                    onClick={handleUnlockClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-md transition-colors flex items-center gap-2"
                >
                    <span>▶</span> Watch Ad to Unlock
                </button>
            </div>

            {showAd && (
                <AdComponent
                    placement={`unlock_${featureId}`}
                    onComplete={handleAdComplete}
                    onCancel={() => setShowAd(false)}
                />
            )}
        </div>
    );
};

export default LockOverlay;
