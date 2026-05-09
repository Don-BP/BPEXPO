import React from 'react';
import { cn } from '../../utils/cn';

interface NeonCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'blue' | 'purple' | 'pink' | 'yellow' | 'orange' | 'green' | 'dark';
    onClick?: () => void;
}

const NeonCard: React.FC<NeonCardProps> = ({
    children,
    className,
    variant = 'orange',
    onClick
}) => {
    const variants = {
        blue: {
            container: "bg-[#2885FF]", // Bright Blue base
            border: "border-4 border-[#8DC3FF]", // Lighter blue border
            shadow: "shadow-[0_8px_0_#004E98,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        purple: {
            container: "bg-[#7B2CBF]", // Deep Purple
            border: "border-4 border-[#C77DFF]", // Light Purple border
            shadow: "shadow-[0_8px_0_#3C096C,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        pink: {
            container: "bg-[#E943D5]",
            border: "border-4 border-[#FF99F5]",
            shadow: "shadow-[0_8px_0_#A60098,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        yellow: {
            container: "bg-[#FBC02D]",
            border: "border-4 border-[#FFF59D]",
            shadow: "shadow-[0_8px_0_#F57F17,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        orange: {
            container: "bg-[#F55926]",
            border: "border-4 border-[#FFAB91]",
            shadow: "shadow-[0_8px_0_#BF360C,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        green: {
            container: "bg-[#66BB6A]",
            border: "border-4 border-[#A5D6A7]",
            shadow: "shadow-[0_8px_0_#1B5E20,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        dark: {
            container: "bg-[#1f2937]", // Dark slate
            border: "border-4 border-[#374151]",
            shadow: "shadow-[0_8px_0_#111827]"
        }
    };

    const style = variants[variant] || variants.blue;

    return (
        <div
            className={cn(
                "relative rounded-3xl p-1 transition-transform",
                style.shadow,
                className,
                onClick && "cursor-pointer active:translate-y-2 active:shadow-none duration-100"
            )}
            onClick={onClick}
        >
            {/* Main Card Body */}
            <div className={cn(
                "relative px-6 py-6 w-full h-full rounded-[20px]",
                style.container,
                style.border,
                "flex flex-col items-center box-border"
            )}>
                {/* Inner Bevel/Glow (Top highlight) */}
                <div className="absolute inset-x-2 top-2 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-[14px] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default NeonCard;
