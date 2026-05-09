import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

/**
 * NeonProgressBar
 * Rounded progress bars with optional stripes and an "Add" button.
 * 
 * @param {number} value - 0 to 100
 * @param {string} color - 'green', 'yellow', 'orange', 'purple', 'blue'
 * @param {boolean} striped - enable diagonal stripes
 * @param {boolean} showButton - show the '+' button
 */
const NeonProgressBar = ({ value = 50, color = 'green', striped = false, showButton = true, className = '' }) => {

    const colors = {
        green: {
            bar: "bg-[#76e66e]",
            stripes: "from-[#76e66e] via-[#94f08e] to-[#76e66e]",
            bg: "bg-[#2d1b4e]",
            border: "border-2 border-[#a5d6a7]",
            text: "text-white"
        },
        yellow: {
            bar: "bg-[#fcd34d]",
            bg: "bg-[#2d1b4e]",
            border: "border-2 border-[#fef08a]",
            text: "text-white"
        },
        orange: {
            bar: "bg-[#fdba74]",
            bg: "bg-[#2d1b4e]",
            border: "border-2 border-[#fed7aa]",
            text: "text-white"
        },
        purple: {
            bar: "bg-[#c084fc]",
            bg: "bg-[#2d1b4e]",
            border: "border-2 border-[#e9d5ff]",
            text: "text-white"
        },
        blue: {
            bar: "bg-[#60a5fa]",
            bg: "bg-[#2d1b4e]",
            border: "border-2 border-[#bfdbfe]",
            text: "text-white"
        }
    };

    const style = colors[color] || colors.green;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Main Bar Container */}
            <div className={`
                flex-1 h-8 md:h-10 relative rounded-full 
                ${style.bg} border-2 border-white/20 
                overflow-hidden shadow-inner
            `}>
                {/* Progress Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className={`
                        h-full rounded-full relative
                        ${style.bar}
                        ${striped ? 'neon-stripe-pattern' : ''}
                        flex items-center justify-end pr-3
                        shadow-[0_2px_10px_rgba(0,0,0,0.2)]
                    `}
                >
                    {/* Gloss Hint */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-full pointer-events-none" />
                </motion.div>

                {/* Text Label */}
                <div className="absolute inset-0 flex items-center justify-between px-4 font-bold text-white drop-shadow-md z-10">
                    <span className="text-sm md:text-base opacity-80 uppercase tracking-widest">Energy</span>
                    <span className="text-sm md:text-base">{value}%</span>
                </div>
            </div>

            {/* Optional Plus Button */}
            {showButton && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                        w-8 h-8 md:w-10 md:h-10 rounded-full 
                        bg-yellow-400 border-2 border-yellow-200 
                        shadow-[0_3px_0_#d97706]
                        flex items-center justify-center
                        text-yellow-900
                    `}
                >
                    <Plus size={20} strokeWidth={4} />
                </motion.button>
            )}

            {/* CSS for Stripes */}
            <style jsx>{`
                .neon-stripe-pattern {
                    background-image: linear-gradient(
                        45deg,
                        rgba(255, 255, 255, 0.3) 25%,
                        transparent 25%,
                        transparent 50%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0.3) 75%,
                        transparent 75%,
                        transparent
                    );
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default NeonProgressBar;
