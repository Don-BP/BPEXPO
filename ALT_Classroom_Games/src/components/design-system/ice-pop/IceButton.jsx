import React from 'react';

const IceButton = ({
    children,
    onClick,
    variant = 'blue',
    size = 'md',
    className = '',
    width = 'auto',
    icon = null
}) => {

    // Color Definitions
    const colors = {
        blue: {
            from: 'from-cyan-400',
            to: 'to-blue-500',
            border: 'border-cyan-200', // The light rim
            shadow: 'shadow-[0_6px_0_#0288D1]', // Darker blue for depth
            activeShadow: 'active:shadow-[0_0px_0_#0288D1]',
            text: 'text-white'
        },
        yellow: {
            from: 'from-yellow-300',
            to: 'to-orange-400',
            border: 'border-yellow-100',
            shadow: 'shadow-[0_6px_0_#F57C00]',
            activeShadow: 'active:shadow-[0_0px_0_#F57C00]',
            text: 'text-white'
        },
        green: {
            from: 'from-green-400',
            to: 'to-emerald-500',
            border: 'border-green-200',
            shadow: 'shadow-[0_6px_0_#1B5E20]', // or slightly lighter
            activeShadow: 'active:shadow-[0_0px_0_#1B5E20]',
            text: 'text-white'
        },
        pink: {
            from: 'from-pink-400',
            to: 'to-rose-500',
            border: 'border-pink-200',
            shadow: 'shadow-[0_6px_0_#C2185B]',
            activeShadow: 'active:shadow-[0_0px_0_#C2185B]',
            text: 'text-white'
        },
        red: {
            from: 'from-red-400',
            to: 'to-red-600',
            border: 'border-red-200',
            shadow: 'shadow-[0_6px_0_#B71C1C]',
            activeShadow: 'active:shadow-[0_0px_0_#B71C1C]',
            text: 'text-white'
        }
    };

    const theme = colors[variant] || colors.blue;

    // Sizes
    const sizes = {
        sm: 'p-2 text-sm min-w-[40px]',
        md: 'px-6 py-3 text-lg font-bold',
        lg: 'px-8 py-4 text-xl font-black',
        icon: 'p-3 w-14 h-14 flex items-center justify-center' // Square-ish for icons
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <button
            onClick={onClick}
            className={`
        relative 
        group 
        ${currentSize} 
        rounded-2xl 
        border-[3px] ${theme.border}
        bg-gradient-to-b ${theme.from} ${theme.to}
        ${theme.shadow}
        active:translate-y-[6px] 
        ${theme.activeShadow}
        transition-all duration-100 ease-out
        flex items-center justify-center gap-2
        ${className}
      `}
            style={{ width: width === 'full' ? '100%' : width }}
        >
            {/* Gloss Effect (Top Half) */}
            <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/60 to-transparent rounded-t-[10px] pointer-events-none" />

            {/* Gloss Dot (Top Left Corner) - seen in some styles */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-white/70 rounded-full blur-[1px] pointer-events-none" />

            {/* Button Content */}
            <span className={`relative z-10 ${theme.text} drop-shadow-md flex items-center gap-2`}>
                {icon && <span className="filter drop-shadow-sm">{icon}</span>}
                {children}
            </span>
        </button>
    );
};

export default IceButton;
