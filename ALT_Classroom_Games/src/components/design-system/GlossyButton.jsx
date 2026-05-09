import React from 'react';

/**
 * GlossyButton Component
 * 
 * A "Juicy" 3D button with glossy finish, pressed state, and vibrant colors.
 * Replicates the "Mobile Game" aesthetic using pure CSS/Tailwind.
 * 
 * @param {string} children - Button text or content
 * @param {string} variant - 'green', 'red', 'blue', 'orange', 'purple'
 * @param {string} size - 'sm', 'md', 'lg', 'xl'
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes
 * @param {boolean} disabled - Disabled state
 * @param {string} icon - Optional icon (emoji or component)
 */
const GlossyButton = ({
    children,
    variant = 'green',
    size = 'md',
    onClick,
    className = '',
    disabled = false,
    icon = null
}) => {

    // Color Definitions: [Top, Bottom, Border/Shadow, TextShadow]
    const colors = {
        green: {
            bg: 'bg-gradient-to-b from-[#88EB1F] to-[#45C01A]',
            border: 'border-[#2D8512]',
            shadow: 'shadow-[0_4px_0_#2D8512]',
            active: 'active:shadow-none active:translate-y-1 active:border-b-0',
            textShadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
        },
        red: {
            bg: 'bg-gradient-to-b from-[#FF6B6B] to-[#E02E2E]',
            border: 'border-[#9E0F0F]',
            shadow: 'shadow-[0_4px_0_#9E0F0F]',
            active: 'active:shadow-none active:translate-y-1 active:border-b-0',
            textShadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
        },
        blue: {
            bg: 'bg-gradient-to-b from-[#4FACFE] to-[#00F2FE]', // Cyan-ish
            // Re-adjust for deeper blue to match reference "HOME" / "REPLAY"
            bg: 'bg-gradient-to-b from-[#63C5FF] to-[#0089E4]',
            border: 'border-[#005596]',
            shadow: 'shadow-[0_4px_0_#005596]',
            active: 'active:shadow-none active:translate-y-1 active:border-b-0',
            textShadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
        },
        orange: {
            bg: 'bg-gradient-to-b from-[#FFD54F] to-[#FF8F00]',
            border: 'border-[#E65100]',
            shadow: 'shadow-[0_4px_0_#E65100]',
            active: 'active:shadow-none active:translate-y-1 active:border-b-0',
            textShadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
        },
        purple: {
            bg: 'bg-gradient-to-b from-[#D585FF] to-[#9822EF]',
            border: 'border-[#6200A3]',
            shadow: 'shadow-[0_4px_0_#6200A3]',
            active: 'active:shadow-none active:translate-y-1 active:border-b-0',
            textShadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
        }
    };

    const selectedColor = colors[variant] || colors.green;

    const sizes = {
        sm: 'px-4 py-1 text-sm rounded-lg',
        md: 'px-6 py-2 text-lg rounded-xl',
        lg: 'px-8 py-3 text-xl rounded-2xl',
        xl: 'px-10 py-4 text-2xl rounded-2xl w-full',
        icon: 'w-12 h-12 p-0 flex items-center justify-center rounded-xl'
    };

    const baseStyles = `
    relative 
    inline-flex items-center justify-center
    font-black uppercase tracking-wide text-white
    transition-all duration-75 ease-in-out
    border-b-4 ${selectedColor.border}
    ${selectedColor.bg}
    ${selectedColor.shadow}
    ${selectedColor.active}
    before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:to-transparent before:opacity-50 before:rounded-[inherit] before:pointer-events-none
    hover:brightness-110
    cursor-pointer
    select-none
  `;

    // Inner inset shadow for that "plastic" feel at the top
    const innerShine = `after:absolute after:inset-x-0 after:top-0 after:h-1/2 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:rounded-t-[inherit] after:pointer-events-none`;

    if (disabled) {
        return (
            <button
                className={`px-6 py-2 rounded-xl bg-gray-400 border-b-4 border-gray-600 text-gray-200 cursor-not-allowed opacity-70 ${className}`}
                disabled
            >
                {children}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseStyles} ${sizes[size]} ${className}`}
        >
            {/* Text Container with Text Shadow */}
            <span className={`relative z-10 flex items-center gap-2 ${selectedColor.textShadow}`}>
                {icon && <span>{icon}</span>}
                {children}
            </span>
            {/* Inner Shine Effect */}
            <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] pointer-events-none"></div>
        </button>
    );
};

export default GlossyButton;
