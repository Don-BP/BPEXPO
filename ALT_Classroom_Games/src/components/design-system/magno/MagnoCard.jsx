import React from 'react';

const MagnoCard = ({
    children,
    title = null,
    className = '',
    variant = 'default'
}) => {

    return (
        <div className={`relative ${className}`}>
            {/* Background with double border effect */}
            <div className={`
        relative 
        bg-[#2D0A0A] 
        rounded-3xl 
        border-[4px] border-[#FFB300] 
        shadow-[0_0_20px_rgba(0,0,0,0.5)]
        p-1
      `}>
                {/* Inner Border */}
                <div className="border-[2px] border-[#FFB300]/50 rounded-[20px] p-6 h-full">
                    {children}
                </div>
            </div>

            {/* Ornate Header/Title */}
            {title && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10 min-w-[180px]">
                    <div className="relative">
                        {/* Header Background */}
                        <div className="bg-[#4A0E0E] border-[3px] border-[#FFB300] py-2 px-8 rounded-xl shadow-lg flex items-center justify-center">
                            <span className="text-[#FFB300] font-black text-xl uppercase tracking-widest drop-shadow-md">
                                {title}
                            </span>
                        </div>
                        {/* Side Ornaments */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFB300] rounded-full border-2 border-[#2D0A0A]" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFB300] rounded-full border-2 border-[#2D0A0A]" />
                    </div>
                </div>
            )}

            {/* Glossy overlay effect on the whole card */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-3xl overflow-hidden opacity-10">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rotate-45" />
            </div>
        </div>
    );
};

export default MagnoCard;
