import React from 'react';

const MagnoProgressBar = ({
    value = 50,
    max = 100,
    color = 'blue',
    variant = 'solid', // 'solid' or 'pellet'
    pelletCount = 20,
    showText = true,
    className = ''
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
        blue: {
            fill: 'bg-[#00E5FF]',
            border: 'border-[#00B8D4]',
            glow: 'shadow-[0_0_10px_rgba(0,229,255,0.5)]'
        },
        red: {
            fill: 'bg-[#FF1744]',
            border: 'border-[#D50000]',
            glow: 'shadow-[0_0_10px_rgba(255,23,68,0.5)]'
        },
        orange: {
            fill: 'bg-[#FF9100]',
            border: 'border-[#FF6D00]',
            glow: 'shadow-[0_0_10px_rgba(255,145,0,0.5)]'
        },
        green: {
            fill: 'bg-[#00E676]',
            border: 'border-[#00C853]',
            glow: 'shadow-[0_0_10px_rgba(0,230,118,0.5)]'
        },
        purple: {
            fill: 'bg-[#D500F9]',
            border: 'border-[#AA00FF]',
            glow: 'shadow-[0_0_10px_rgba(213,0,249,0.5)]'
        }
    };

    const theme = colors[color] || colors.blue;

    const filledPellets = Math.round((percentage / 100) * pelletCount);

    return (
        <div className={`w-full ${className}`}>
            {/* Label Area */}
            <div className="flex justify-between items-center mb-1 px-1">
                {showText && (
                    <span className="text-[#FFB300] font-bold text-xs uppercase tracking-tighter">
                        {value} / {max}
                    </span>
                )}
            </div>

            {variant === 'solid' ? (
                /* Track (Solid) */
                <div className="h-4 bg-[#1A0505] rounded-full border-[2px] border-[#FFB300]/30 p-0.5 shadow-inner">
                    {/* Fill */}
                    <div
                        className={`h-full rounded-full ${theme.fill} ${theme.border} border-[1px] ${theme.glow} transition-all duration-300 ease-out relative`}
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Shine highlight */}
                        <div className="absolute top-0 left-0 w-full h-[30%] bg-white/40 rounded-full" />
                    </div>
                </div>
            ) : (
                /* Track (Pellet) */
                <div className="h-6 bg-[#1A0505] rounded-lg border-[2px] border-[#FFB300]/30 p-1 flex gap-1 items-center shadow-inner overflow-hidden">
                    {[...Array(pelletCount)].map((_, i) => (
                        <div
                            key={i}
                            className={`
                        h-full flex-grow rounded-sm transition-all duration-300
                        ${i < filledPellets ? `${theme.fill} ${theme.glow} border-[1px] ${theme.border}` : 'bg-black/40'}
                    `}
                        >
                            {/* Pellet Shine */}
                            {i < filledPellets && <div className="w-full h-[20%] bg-white/30 rounded-full mt-0.5 mx-auto" style={{ width: '80%' }} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MagnoProgressBar;
