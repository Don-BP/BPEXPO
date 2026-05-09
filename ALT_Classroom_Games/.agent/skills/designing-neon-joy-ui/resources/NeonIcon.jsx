import { motion } from 'framer-motion';

/**
 * NeonIcon
 * Small circular or square buttons with icons inside.
 * 
 * @param {string} shape - 'circle' or 'square'
 * @param {string} color - 'red' (heart), 'pink' (diamond), 'green' (plus), 'blue' (bolt), 'yellow' (crown)
 */
const NeonIcon = ({ icon: Icon, shape = 'circle', color = 'red', onClick, size = 'md', className = '' }) => {

    const colors = {
        red: {
            bg: "bg-gradient-to-br from-[#ff758c] to-[#ff7eb3]",
            border: "border-[#ffccd5]",
            shadow: "shadow-[0_3px_0_#d6336c]"
        },
        pink: {
            bg: "bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc]", // Lilac
            border: "border-[#f3e8ff]",
            shadow: "shadow-[0_3px_0_#8a4baf]"
        },
        green: {
            bg: "bg-gradient-to-br from-[#96e6a1] to-[#d4fc79]",
            border: "border-[#eaffea]",
            shadow: "shadow-[0_3px_0_#52b788]"
        },
        blue: {
            bg: "bg-gradient-to-br from-[#4facfe] to-[#00f2fe]",
            border: "border-[#bde6ff]",
            shadow: "shadow-[0_3px_0_#0077b6]"
        },
        yellow: {
            bg: "bg-gradient-to-br from-[#f6d365] to-[#fda085]",
            border: "border-[#fff8e1]",
            shadow: "shadow-[0_3px_0_#f48c06]"
        }
    };

    const style = colors[color] || colors.red;

    const shapes = {
        circle: "rounded-full",
        square: "rounded-xl"
    };

    const sizes = {
        sm: "w-8 h-8 p-1.5",
        md: "w-12 h-12 p-2.5",
        lg: "w-16 h-16 p-3"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, y: 3, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            onClick={onClick}
            className={`
                relative flex items-center justify-center
                border-2 ${style.border} ${style.bg} ${style.shadow}
                ${shapes[shape]}
                ${sizes[size]}
                ${className}
            `}
        >
            {/* Inner Shine */}
            <div className="absolute inset-x-1 top-1 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-[inherit] pointer-events-none opacity-80" />

            {/* Icon */}
            <div className="relative z-10 text-white drop-shadow-sm">
                {Icon && <Icon size="100%" strokeWidth={2.5} />}
            </div>
        </motion.button>
    );
};

export default NeonIcon;
