import React from 'react';

const MagnoButton = ({
    children,
    onClick,
    variant = 'orange',
    size = 'md',
    className = '',
    width = 'auto',
    icon = null
}) => {

    // Color Definitions
    const colors = {
        orange: {
            from: 'from-[#FFB300]',
            to: 'to-[#F4511E]',
            border: 'border-[#FFD54F]',
            text: 'text-white',
            shadow: 'shadow-[0_4px_0_#BF360C]'
        },
        blue: {
            from: 'from-[#29B6F6]',
            to: 'to-[#0288D1]',
            border: 'border-[#B3E5FC]',
            text: 'text-white',
            shadow: 'shadow-[0_4px_0_#01579B]'
        },
        green: {
            from: 'from-[#66BB6A]',
            to: 'to-[#2E7D32]',
            border: 'border-[#C8E6C9]',
            text: 'text-white',
            shadow: 'shadow-[0_4px_0_#1B5E20]'
        },
        red: {
            from: 'from-[#EF5350]',
            to: 'to-[#C62828]',
            border: 'border-[#FFCDD2]',
            text: 'text-white',
            shadow: 'shadow-[0_4px_0_#B71C1C]'
        },
        purple: {
            from: 'from-[#AB47BC]',
            to: 'to-[#6A1B9A]',
            border: 'border-[#E1BEE7]',
            text: 'text-white',
            shadow: 'shadow-[0_4px_0_#4A148C]'
        }
    };

    const theme = colors[variant] || colors.orange;

    // Sizes
    const sizes = {
        sm: 'px-4 py-1 text-sm rounded-lg',
        md: 'px-6 py-2 text-md font-bold rounded-xl',
        lg: 'px-8 py-3 text-lg font-black rounded-2xl',
        icon: 'p-2 w-12 h-12 rounded-full flex items-center justify-center',
        chip: 'w-10 h-10 rounded-full flex items-center justify-center'
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <button
            onClick={onClick}
            className={`
        relative 
        group 
        ${currentSize} 
        border-[2px] ${theme.border}
        bg-gradient-to-b ${theme.from} ${theme.to}
        ${theme.shadow}
        active:translate-y-[4px] 
        active:shadow-none
        transition-all duration-75 ease-out
        flex items-center justify-center gap-2
        ${className}
      `}
            style={{ width: width === 'full' ? '100%' : width }}
        >
            {/* Glossy top highlight */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[90%] h-[35%] bg-white/30 rounded-t-[inherit] pointer-events-none" />

            {/* Button Content */}
            <span className={`relative z-10 ${theme.text} font-black drop-shadow-md flex items-center gap-2 uppercase tracking-wider`}>
                {icon && <span className="filter drop-shadow-sm">{icon}</span>}
                {children}
            </span>
        </button>
    );
};

export default MagnoButton;
