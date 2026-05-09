import { motion } from 'framer-motion';

/**
 * NeonCard
 * A glossy, glass-morphism style card/panel for game UI.
 * Matches the "Level" or "You Win" panels in the reference.
 * 
 * @param {string} variant - 'blue', 'purple'
 */
const NeonCard = ({ children, className = '', variant = 'blue', ...props }) => {

    const variants = {
        blue: {
            container: "bg-[#2885FF]",
            border: "border-4 border-[#8DC3FF]",
            shadow: "shadow-[0_8px_0_#004E98,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        purple: {
            container: "bg-[#7B2CBF]",
            border: "border-4 border-[#C77DFF]",
            shadow: "shadow-[0_8px_0_#3C096C,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        green: {
            container: "bg-[#66BB6A]",
            border: "border-4 border-[#A5D6A7]",
            shadow: "shadow-[0_8px_0_#1B5E20,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        yellow: {
            container: "bg-[#FBC02D]",
            border: "border-4 border-[#FFF59D]",
            shadow: "shadow-[0_8px_0_#F57F17,0_12px_20px_rgba(0,0,0,0.3)]"
        },
        dark: {
            container: "bg-[#1f2937]",
            border: "border-4 border-[#374151]",
            shadow: "shadow-[0_8px_0_#111827]"
        },
        default: {
            container: "bg-[#1f2937]/80 backdrop-blur-md",
            border: "border-4 border-white/10",
            shadow: "shadow-2xl"
        }
    };

    const style = variants[variant] || variants.blue;

    return (
        <motion.div
            {...props}
            className={`relative rounded-3xl p-1 ${style.shadow} ${className}`}
        >
            {/* Main Card Body */}
            <div className={`
                relative px-6 py-6 w-full h-full rounded-[20px]
                ${style.container} ${style.border}
                flex flex-col items-center
                box-border
            `}>
                {/* Inner Bevel/Glow (Top highlight) */}
                <div className="absolute inset-x-2 top-2 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-[14px] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

export default NeonCard;
