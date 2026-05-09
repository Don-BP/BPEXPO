import React from 'react';
import { cn } from '../../utils/cn';

interface MagnoCardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    contentClassName?: string;
    variant?: 'default' | 'selected' | 'disabled';
}

const MagnoCard: React.FC<MagnoCardProps> = ({
    children,
    title,
    className,
    contentClassName,
    variant = 'default'
}) => {

    const variants = {
        default: {
            bg: "bg-[#2D0A0A]",
            border: "border-[#FFB300]",
            innerBorder: "border-[#FFB300]/50"
        },
        selected: {
            bg: "bg-[#2D0A0A]",
            border: "border-[#00E5FF] shadow-[0_0_15px_#00E5FF]", // Cyan glow for selection
            innerBorder: "border-[#00E5FF]/50"
        },
        disabled: {
            bg: "bg-[#1A0505]",
            border: "border-[#5D4037]",
            innerBorder: "border-[#5D4037]/30"
        }
    };

    const style = variants[variant] || variants.default;

    return (
        <div className={cn("relative mt-6 group transition-all duration-300", className)}>
            {/* Ornate Header/Title - Positioned Absolute Top */}
            {title && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 min-w-[180px] pointer-events-none">
                    <div className="relative">
                        {/* Header Background */}
                        <div className="bg-[#4A0E0E] border-[3px] border-[#FFB300] py-2 px-8 rounded-xl shadow-lg flex items-center justify-center">
                            <span className="text-[#FFB300] font-black text-xl uppercase tracking-widest drop-shadow-md whitespace-nowrap">
                                {title}
                            </span>
                        </div>
                        {/* Side Ornaments */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFB300] rounded-full border-2 border-[#2D0A0A]" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFB300] rounded-full border-2 border-[#2D0A0A]" />
                    </div>
                </div>
            )}

            {/* Background with double border effect */}
            <div className={cn(
                "relative rounded-3xl border-[4px] shadow-[0_0_20px_rgba(0,0,0,0.5)] p-1 z-10 w-full h-full",
                style.bg,
                style.border
            )}>
                {/* Inner Border */}
                <div className={cn(
                    "border-[2px] rounded-[20px] p-6 h-full text-white w-full",
                    style.innerBorder,
                    contentClassName
                )}>
                    {children}
                </div>
            </div>

            {/* Glossy overlay effect on the whole card */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-3xl overflow-hidden opacity-10 z-20">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rotate-45" />
            </div>
        </div>
    );
};

export default MagnoCard;
