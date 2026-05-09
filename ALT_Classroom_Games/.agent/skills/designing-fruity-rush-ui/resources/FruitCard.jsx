import React from 'react';

const FruitCard = ({
    children,
    variant = 'pink',
    title = null,
    stars = 0, // 0, 1, 2, 3
    className = ''
}) => {

    const variants = {
        pink: {
            bg: 'bg-[#C2185B]', // Dark pink/magenta base
            gradient: 'bg-gradient-to-b from-[#E91E63] to-[#880E4F]',
            border: 'border-[#FFC107]', // Amber/Gold border
            innerShadow: 'shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)]'
        },
        green: {
            bg: 'bg-[#558B2F]',
            gradient: 'bg-gradient-to-b from-[#7CB342] to-[#33691E]',
            border: 'border-[#FFC107]', // Amber/Gold border
            innerShadow: 'shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)]'
        }
    };

    const theme = variants[variant] || variants.pink;

    return (
        <div className={`relative ${className} pt-12`}> {/* Padding top for header/stars */}

            {/* Main Container */}
            <div className={`
        relative 
        rounded-[36px] 
        border-[8px] ${theme.border} 
        ${theme.gradient}
        shadow-[0_10px_0_rgba(0,0,0,0.2)]
        overflow-visible
        p-1
      `}>
                {/* Inner Bevel/Container */}
                <div className={`
          w-full h-full 
          rounded-[28px] 
          bg-black/10 
          ${theme.innerShadow}
          p-6
        `}>
                    {children}
                </div>

                {/* Gloss Overlay */}
                <div className="absolute top-0 right-0 w-full h-full rounded-[28px] overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50" />
                </div>
            </div>

            {/* Banner / Title Ribbon (Blue Ribbon Style as seen in ref) */}
            {title && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20 w-64 flex flex-col items-center">
                    {/* The Ribbon Path (Simplified) */}
                    <div className="relative bg-gradient-to-r from-[#1976D2] via-[#2196F3] to-[#1976D2] text-white py-3 px-10 rounded-lg shadow-lg border-2 border-[#64B5F6]">
                        <h2 className="text-2xl font-black uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] tracking-wider">
                            {title}
                        </h2>
                        {/* Ribbon Ends (Pseudo-folding) */}
                        <div className="absolute top-2 -left-4 w-6 h-10 bg-[#0D47A1] -z-10 skew-y-12 rounded-bl-lg" />
                        <div className="absolute top-2 -right-4 w-6 h-10 bg-[#0D47A1] -z-10 -skew-y-12 rounded-br-lg" />
                    </div>
                </div>
            )}

            {/* Stars (Optional) */}
            {stars > 0 && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`transform transition-all duration-500 ${i === 2 ? '-mt-4' : ''}`}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill={i <= stars ? "#FDD835" : "#455A64"} className="drop-shadow-lg filter">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#F57F17" strokeWidth="2" strokeLinejoin="round" />
                            </svg>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default FruitCard;
