import React from 'react';

const IceCard = ({
    children,
    variant = 'beige',
    className = '',
    title = null
}) => {

    const variants = {
        beige: {
            bg: 'bg-[#FFF8E1]', // Warm cream
            border: 'border-[#4FC3F7]', // Light blue border
            inner: 'shadow-[inset_0_0_20px_rgba(255,193,7,0.1)]' // Slight warm inner glow
        },
        blue: {
            bg: 'bg-[#E1F5FE]', // Very light blue
            border: 'border-[#039BE5]', // Darker blue border
            inner: 'shadow-[inset_0_0_20px_rgba(3,169,244,0.1)]'
        }
    };

    const theme = variants[variant] || variants.beige;

    return (
        <div className={`
      relative 
      rounded-3xl 
      border-[6px] ${theme.border} 
      ${theme.bg}
      shadow-xl
      ${className}
    `}>
            {/* Title/Header Area (Optional) */}
            {title && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-cyan-400 to-blue-500 border-2 border-white text-white font-black px-6 py-1 rounded-full shadow-[0_4px_0_#0288D1] z-10 whitespace-nowrap">
                    {title}
                </div>
            )}

            {/* Content Container with Inner Shadow/Glow */}
            <div className={`w-full h-full p-6 ${theme.inner} rounded-[18px]`}>
                {children}
            </div>

            {/* Gloss Highlight on the Border (Top Left) */}
            <div className="absolute top-2 left-2 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 blur-xl rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
};

export default IceCard;
