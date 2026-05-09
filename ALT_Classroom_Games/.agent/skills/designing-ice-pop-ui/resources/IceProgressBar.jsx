import React from 'react';
import { Sparkles, Zap, Heart } from 'lucide-react';

const IceProgressBar = ({
    value = 50,
    max = 100,
    color = 'blue',
    icon = null, // 'energy', 'heart', or component
    showLabel = true,
    className = ''
}) => {

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const themes = {
        blue: {
            track: 'bg-blue-900/20',
            fillFrom: 'from-cyan-300',
            fillTo: 'to-blue-500',
            border: 'border-blue-200',
            shadow: 'shadow-[0_4px_0_#0288D1]'
        },
        orange: {
            track: 'bg-orange-900/20',
            fillFrom: 'from-amber-300',
            fillTo: 'to-orange-500',
            border: 'border-orange-200',
            shadow: 'shadow-[0_4px_0_#E65100]'
        },
        pink: {
            track: 'bg-pink-900/20',
            fillFrom: 'from-pink-300',
            fillTo: 'to-rose-500',
            border: 'border-pink-200',
            shadow: 'shadow-[0_4px_0_#C2185B]'
        }
    };

    const theme = themes[color] || themes.blue;

    // Icon Helper
    const getIcon = () => {
        const iconClass = "text-white drop-shadow-md";
        if (React.isValidElement(icon)) return icon;
        if (icon === 'energy') return <Zap className={`${iconClass} fill-yellow-300`} size={20} />;
        if (icon === 'heart') return <Heart className={`${iconClass} fill-pink-500`} size={20} />;
        return <Sparkles className={`${iconClass} fill-white`} size={20} />;
    };

    return (
        <div className={`relative flex items-center gap-2 ${className}`}>

            {/* Icon Badge */}
            <div className={`
        flex-shrink-0 w-10 h-10 
        rounded-full 
        bg-gradient-to-b ${theme.fillFrom} ${theme.fillTo}
        border-2 border-white
        shadow-md
        flex items-center justify-center
        z-10
      `}>
                {getIcon()}
            </div>

            {/* Bar Container */}
            <div className={`
        flex-grow h-6 
        rounded-full 
        ${theme.track} 
        border-2 border-white/50
        relative
        overflow-hidden
      `}>
                {/* Fill */}
                <div
                    className={`
            h-full rounded-full 
            bg-gradient-to-b ${theme.fillFrom} ${theme.fillTo}
            flex items-center justify-end px-2
            transition-all duration-500 ease-out
          `}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Shine on Fill */}
                    <div className="absolute top-0 left-0 w-full h-[40%] bg-white/50 rounded-full" />
                </div>
            </div>

            {/* Label (Optional) */}
            {showLabel && (
                <span className="font-bold text-white drop-shadow-md min-w-[3ch]">
                    {value}
                </span>
            )}
        </div>
    );
};

export default IceProgressBar;
