import React from 'react';
import { Heart, Zap, Diamond } from 'lucide-react';

const FruitProgressBar = ({
    value = 50,
    max = 100,
    variant = 'pink', // pink, green, blue
    icon = 'heart', // heart, energy, gem
    showText = true,
    className = ''
}) => {

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Configuration for variants (Fill Colors)
    const variants = {
        pink: {
            trackBg: 'bg-[#560027]', // Deep wine color
            fillFrom: 'from-[#EC407A]',
            fillTo: 'to-[#C2185B]',
            border: 'border-[#FDD835]' // Gold
        },
        green: {
            trackBg: 'bg-[#1B5E20]', // Deep green
            fillFrom: 'from-[#7CB342]',
            fillTo: 'to-[#33691E]',
            border: 'border-[#FDD835]' // Gold
        },
        blue: {
            trackBg: 'bg-[#0D47A1]',
            fillFrom: 'from-[#42A5F5]',
            fillTo: 'to-[#1565C0]',
            border: 'border-[#FDD835]'
        }
    };

    const theme = variants[variant] || variants.pink;

    // Icon Rendering
    const renderIcon = () => {
        const commonClass = "text-white drop-shadow-md";
        if (icon === 'heart') return <Heart className={`${commonClass} fill-[#E91E63]`} size={24} />;
        if (icon === 'energy') return <Zap className={`${commonClass} fill-[#FFEB3B]`} size={24} />;
        if (icon === 'gem') return <Diamond className={`${commonClass} fill-[#29B6F6]`} size={24} />;
        return null;
    };

    return (
        <div className={`relative flex items-center ${className}`}>

            {/* Icon Badge (Overlapping Left) */}
            <div className={`
        relative z-20 
        w-12 h-12 
        rounded-xl 
        ${theme.border} border-2 
        bg-gradient-to-br from-orange-400 to-orange-600 
        shadow-[0_4px_0_#BF360C]
        flex items-center justify-center
        transform -mr-4
      `}>
                {renderIcon()}
            </div>

            {/* Progress Track */}
            <div className={`
        flex-grow h-8 
        rounded-full 
        ${theme.trackBg} 
        border-[3px] ${theme.border}
        shadow-[0_4px_0_rgba(0,0,0,0.3)]
        relative
        overflow-hidden
        z-10
      `}>
                {/* Fill */}
                <div
                    className={`
            h-full rounded-l-full
            bg-gradient-to-b ${theme.fillFrom} ${theme.fillTo}
            flex items-center justify-end px-3
            transition-all duration-500 ease-out
          `}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Diagonal Stripes Pattern (SVG Overlay) */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20"
                        style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}
                    />

                    {/* Shine Top Half */}
                    <div className="absolute top-0 left-0 w-full h-[40%] bg-white/40 rounded-full" />
                </div>
            </div>

            {/* Optional Side Decoration or '+' button in ref */}
            {showText && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-white font-black text-sm drop-shadow-md">
                    {value}/{max}
                </div>
            )}

        </div>
    );
};

export default FruitProgressBar;
