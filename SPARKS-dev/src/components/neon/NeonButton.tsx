import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'blue' | 'pink' | 'yellow' | 'orange' | 'green';
    size?: 'sm' | 'md' | 'lg';
}

const NeonButton: React.FC<NeonButtonProps> = ({
    children,
    className,
    variant = 'blue',
    size = 'md',
    ...props
}) => {

    const candyVariants = {
        blue: "bg-[#2885FF] border-[#8DC3FF] shadow-[0_6px_0_#004E98,0_10px_0_rgba(0,0,0,0.2)]",
        pink: "bg-[#E943D5] border-[#FF99F5] shadow-[0_6px_0_#A60098,0_10px_0_rgba(0,0,0,0.2)]",
        yellow: "bg-[#FBC02D] border-[#FFF59D] shadow-[0_6px_0_#F57F17,0_10px_0_rgba(0,0,0,0.2)]",
        orange: "bg-[#F55926] border-[#FFAB91] shadow-[0_6px_0_#BF360C,0_10px_0_rgba(0,0,0,0.2)]",
        green: "bg-[#66BB6A] border-[#A5D6A7] shadow-[0_6px_0_#1B5E20,0_10px_0_rgba(0,0,0,0.2)]"
    };

    const style = candyVariants[variant] || candyVariants.blue;

    const sizes = {
        sm: "px-4 py-1 text-sm min-w-[80px]",
        md: "px-8 py-3 text-xl min-w-[140px]",
        lg: "px-10 py-4 text-2xl min-w-[180px]"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.95, y: 4, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            className={cn(
                "relative rounded-full font-black text-white uppercase tracking-wider",
                "border-t-4 border-l-2 border-r-2 border-b-0",
                style,
                sizes[size],
                className
            )}
            {...props}
        >
            {/* Inner "Shine" Bubble */}
            <div className="absolute top-1 left-2 right-2 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />

            {/* Text Glow/Shadow */}
            <span className="drop-shadow-md relative z-10">{children}</span>
        </motion.button>
    );
};

export default NeonButton;
