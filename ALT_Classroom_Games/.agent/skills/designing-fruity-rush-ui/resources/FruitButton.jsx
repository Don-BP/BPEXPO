import React from 'react';

const FruitButton = ({
    children,
    onClick,
    variant = 'green',
    size = 'md',
    className = '',
    width = 'auto',
    icon = null
}) => {

    // Color Definitions
    // The style features a strong golden/yellow border for almost all variants
    const colors = {
        green: {
            from: 'from-[#8BC34A]', // Light Lime
            to: 'to-[#33691E]',     // Deep Green
            border: 'border-[#FDD835]', // Gold border
            textOutline: 'text-stroke-green', // Custom class concept, we'll use drop shadow instead
            shadow: 'shadow-[0_4px_0_#1B5E20]' // Deep Green Shadow
        },
        pink: {
            from: 'from-[#EC407A]',
            to: 'to-[#880E4F]',
            border: 'border-[#FDD835]', // Gold border
            shadow: 'shadow-[0_4px_0_#880E4F]'
        },
        blue: {
            from: 'from-[#42A5F5]',
            to: 'to-[#0D47A1]',
            border: 'border-[#FDD835]', // Gold border
            shadow: 'shadow-[0_4px_0_#0D47A1]'
        },
        orange: { // "Next" button style
            from: 'from-[#FFA726]',
            to: 'to-[#E65100]',
            border: 'border-[#FFEB3B]',
            shadow: 'shadow-[0_4px_0_#E65100]'
        },
        gold: { // Menu/Options style sometimes
            from: 'from-[#FFEE58]',
            to: 'to-[#F9A825]',
            border: 'border-[#FFF9C4]',
            shadow: 'shadow-[0_4px_0_#EF6C00]'
        }
    };

    const theme = colors[variant] || colors.green;

    // Sizes - The reference has very rounded buttons
    const sizes = {
        sm: 'px-4 py-1 text-sm rounded-full min-w-[80px]',
        md: 'px-8 py-2 text-lg font-black rounded-full min-w-[120px]',
        lg: 'px-10 py-3 text-xl font-black rounded-full min-w-[160px]',
        icon: 'p-3 w-14 h-14 rounded-2xl flex items-center justify-center', // Square with rounded corners
        circle: 'p-3 w-16 h-16 rounded-full flex items-center justify-center'
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <button
            onClick={onClick}
            className={`
        relative 
        group 
        ${currentSize} 
        border-[3px] ${theme.border}
        bg-gradient-to-b ${theme.from} ${theme.to}
        ${theme.shadow}
        active:translate-y-[4px] 
        active:shadow-none
        transition-all duration-100 ease-out
        flex items-center justify-center gap-2
        ${className}
      `}
            style={{ width: width === 'full' ? '100%' : width }}
        >
            {/* Gloss Effect (Top Half Curve) */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90%] h-[40%] bg-gradient-to-b from-white/70 to-transparent rounded-[inherit] pointer-events-none" />

            {/* "Shine" Dot for extra juiciness */}
            {size === 'circle' && (
                <div className="absolute top-2 right-3 w-3 h-3 bg-white/80 rounded-full blur-[2px] pointer-events-none" />
            )}

            {/* Button Content with strong shadow/stroke effect */}
            <span className={`
        relative z-10 
        text-white 
        font-black 
        tracking-wide
        drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]
        flex items-center gap-2
      `}>
                {icon && <span className="filter drop-shadow-md">{icon}</span>}
                {children}
            </span>
        </button>
    );
};

export default FruitButton;
