import React from 'react';

/**
 * RibbonHeader Component Template
 * 
 * Usage:
 * <RibbonHeader text="LEVEL UP" color="green" />
 */
const RibbonHeader = ({ text, color = 'green', subText }) => {

    const colors = {
        green: {
            main: 'bg-gradient-to-b from-[#88EB1F] to-[#45C01A]',
            dark: '#2D8512',
            shadow: '#1e5e0b'
        },
        blue: {
            main: 'bg-gradient-to-b from-[#4FACFE] to-[#00F2FE]',
            dark: '#005596',
            shadow: '#00335b'
        },
        red: {
            main: 'bg-gradient-to-b from-[#FF6B6B] to-[#E02E2E]',
            dark: '#9E0F0F',
            shadow: '#5e0707'
        },
        yellow: {
            main: 'bg-gradient-to-b from-[#FFD54F] to-[#FF8F00]',
            dark: '#E65100',
            shadow: '#8c3100'
        }
    };

    const theme = colors[color] || colors.green;

    return (
        <div className="relative flex flex-col items-center justify-center -mt-10 mb-4 z-20">
            {/* Main Ribbon Body */}
            <div className={`
        relative px-12 py-3 
        min-w-[200px] text-center
        \${theme.main}
        text-white font-black text-2xl tracking-wider uppercase
        shadow-lg
        z-10
        border-b-4 border-[\${theme.dark}]
        transform -skew-x-0
        rounded-sm
      `}
                style={{
                    textShadow: '0 2px 0 rgba(0,0,0,0.5)',
                    borderBottomColor: theme.dark
                }}
            >
                {text}

                {/* Ribbon Ends (Folded Back Triangle) - Left */}
                <div
                    className="absolute -left-2 top-2 w-4 h-full bg-black/20 -z-10 transform skew-y-[20deg]"
                    style={{ backgroundColor: theme.shadow }}
                ></div>
                {/* Ribbon Ends (Folded Back Triangle) - Right */}
                <div
                    className="absolute -right-2 top-2 w-4 h-full bg-black/20 -z-10 transform -skew-y-[20deg]"
                    style={{ backgroundColor: theme.shadow }}
                ></div>

                {/* Side Triangles (The "Tail") - Pure CSS shapes */}
                <div
                    className="absolute top-2 -left-8 h-[calc(100%-8px)] w-8 bg-gradient-to-r from-transparent to-white/20 -z-10"
                    style={{
                        background: theme.dark,
                        clipPath: 'polygon(100% 0, 0 50%, 100% 100%)'
                    }}
                ></div>
                <div
                    className="absolute top-2 -right-8 h-[calc(100%-8px)] w-8 bg-gradient-to-l from-transparent to-white/20 -z-10"
                    style={{
                        background: theme.dark,
                        clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
                    }}
                ></div>

            </div>

            {/* Subtext (like "Level 23") */}
            {subText && (
                <div className="mt-1 px-4 py-1 bg-[#000000]/20 rounded-full text-white/90 text-sm font-bold">
                    {subText}
                </div>
            )}
        </div>
    );
};

export default RibbonHeader;
