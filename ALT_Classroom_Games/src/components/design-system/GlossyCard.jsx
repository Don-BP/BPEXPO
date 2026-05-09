import React from 'react';

/**
 * GlossyCard Component
 * 
 * A container meant to look like a game UI panel (wood/paper/beige style).
 * 
 * @param {string} children - Content
 * @param {string} className - Additional classes
 * @param {string} variant - 'default' (beige), 'dark' (wood)
 */
const GlossyCard = ({ children, className = '', contentClassName = '', variant = 'default' }) => {

    const variants = {
        default: {
            bg: 'bg-[#FFF8E1]', // Light cream
            border: 'border-[#D4A068]', // Light wood border
            shadow: 'shadow-[0_6px_0_#B68A58,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        wood: {
            bg: 'bg-[#8D6E63]',
            border: 'border-[#5D4037]',
            shadow: 'shadow-[0_6px_0_#3E2723,0_10px_10px_rgba(0,0,0,0.3)]'
        },
        // Color variants
        red: {
            bg: 'bg-red-500',
            border: 'border-red-700',
            shadow: 'shadow-[0_6px_0_#991B1B,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        blue: {
            bg: 'bg-blue-500',
            border: 'border-blue-700',
            shadow: 'shadow-[0_6px_0_#1E40AF,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        green: {
            bg: 'bg-green-500',
            border: 'border-green-700',
            shadow: 'shadow-[0_6px_0_#166534,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        yellow: {
            bg: 'bg-yellow-400',
            border: 'border-yellow-600',
            shadow: 'shadow-[0_6px_0_#CA8A04,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        orange: {
            bg: 'bg-orange-500',
            border: 'border-orange-700',
            shadow: 'shadow-[0_6px_0_#9A3412,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        pink: {
            bg: 'bg-pink-500',
            border: 'border-pink-700',
            shadow: 'shadow-[0_6px_0_#BE185D,0_10px_10px_rgba(0,0,0,0.2)]'
        },
        purple: {
            bg: 'bg-purple-500',
            border: 'border-purple-700',
            shadow: 'shadow-[0_6px_0_#6B21A8,0_10px_10px_rgba(0,0,0,0.2)]'
        }
    };

    const style = variants[variant];

    // Wood grain pattern via repeating linear gradient (subtle)
    const woodGrain = variant === 'wood'
        ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]'
        : '';

    return (
        <div className={`relative p-1 rounded-3xl ${style.bg} ${style.border} border-4 ${style.shadow} ${className}`}>
            {/* Inner Border Layer (Simulates the "Inset" look of the panel) */}
            <div className={`
            relative w-full h-full rounded-[20px] 
            border-2 border-[#EAD1A8]/50 
            overflow-hidden
            ${woodGrain}
        `}>
                {/* Main Content Area */}
                <div className={`relative z-10 h-full ${contentClassName || 'p-6'}`}>
                    {children}
                </div>

                {/* Inner "Paper" Glow */}
                {variant === 'default' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                )}
            </div>
        </div>
    );
};

export default GlossyCard;
