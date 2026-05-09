import React from 'react';

/**
 * GlossyCard Component Template
 * 
 * Usage:
 * <GlossyCard variant="default">Content</GlossyCard>
 */
const GlossyCard = ({ children, className = '', variant = 'default' }) => {

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
        }
    };

    const style = variants[variant] || variants.default;

    // Wood grain pattern via repeating linear gradient (subtle)
    const woodGrain = variant === 'wood'
        ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]'
        : '';

    return (
        <div className={`relative p-1 rounded-3xl \${style.bg} \${style.border} border-4 \${style.shadow} \${className}`}>
            {/* Inner Border Layer (Simulates the "Inset" look of the panel) */}
            <div className={`
            relative w-full h-full rounded-[20px] 
            border-2 border-[#EAD1A8]/50 
            overflow-hidden
            \${woodGrain}
        `}>
                {/* Main Content Area */}
                <div className="relative z-10 p-6">
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
