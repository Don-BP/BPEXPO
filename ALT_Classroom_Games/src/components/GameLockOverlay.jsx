import React from 'react';

const GameLockOverlay = ({ gameName, onUnlock }) => {
    return (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl transition-colors hover:bg-white/40 cursor-pointer group"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnlock();
            }}>
            <div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 transform group-hover:-translate-y-1 transition-transform">
                <span className="text-2xl">🔒</span>
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm">{gameName}</span>
                    <span className="text-xs text-blue-600 font-semibold">Watch Ad to Unlock (2h)</span>
                </div>
            </div>
        </div>
    );
};

export default GameLockOverlay;
