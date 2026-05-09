import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Volume2, VolumeX, RotateCw, Edit, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const DEFAULT_SEGMENTS = [
    { text: "What's your name?", color: "#EF4444" },
    { text: "How are you?", color: "#F97316" },
    { text: "How old are you?", color: "#EAB308" },
    { text: "What color is this?", color: "#22C55E" },
    { text: "Do you like pizza?", color: "#06B6D4" },
    { text: "Can you swim?", color: "#3B82F6" },
    { text: "Stand up!", color: "#A855F7" },
    { text: "Sit down!", color: "#EC4899" }
];

const SpinAndSpeak = () => {
    const canvasRef = useRef(null);
    const [segments, setSegments] = useState(() => {
        const saved = localStorage.getItem('spinSpeakSegments');
        return saved ? JSON.parse(saved) : DEFAULT_SEGMENTS;
    });

    // Game States
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Editing State
    const [editInput, setEditInput] = useState("");
    const [editColor, setEditColor] = useState("#3B82F6");

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // Responsive Canvas
    useEffect(() => {
        if (!containerRef.current) return;
        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setContainerSize({ width: clientWidth, height: clientHeight });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        localStorage.setItem('spinSpeakSegments', JSON.stringify(segments));
        if (!isSpinning && containerSize.width > 0) drawWheel(rotation);
    }, [segments, rotation, containerSize]);

    // Draw Function
    const drawWheel = (currentRotation) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Outer Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        const totalSegments = segments.length;
        const arcSize = (2 * Math.PI) / totalSegments;

        segments.forEach((segment, i) => {
            const angle = currentRotation + (i * arcSize);

            // Draw Wedge
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "white";
            ctx.font = "bold 18px 'Comic Sans MS', sans-serif";
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            ctx.fillText(segment.text.length > 15 ? segment.text.substring(0, 15) + "..." : segment.text, radius - 20, 5);
            ctx.restore();
        });

        // Center Cap
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#3B82F6';
        ctx.fill();

        // Pointer (Triangle)
        ctx.beginPath();
        ctx.moveTo(centerX + 25, centerY - radius - 25); // Top right
        ctx.lineTo(centerX - 25, centerY - radius - 25); // Top left
        ctx.lineTo(centerX, centerY - radius + 10);     // Point
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
    };

    const spinWheel = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSelectedSegment(null);
        if (!isMuted) soundManager.play('spin');

        let currentRot = rotation;
        const spinDuration = 4000;
        const spinForce = Math.random() * 10 + 20; // Random spins
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / spinDuration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const currentSpeed = (spinForce * (1 - ease));
            currentRot += currentSpeed * 0.1;

            drawWheel(currentRot);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                setRotation(currentRot % (2 * Math.PI));
                determineWinner(currentRot % (2 * Math.PI));
            }
        };
        requestAnimationFrame(animate);
    };

    const determineWinner = (finalRotation) => {
        // Pointer is at -90 degrees (or 270) relative to 0
        // Correct normalization logic
        const totalSegments = segments.length;
        const arcSize = (2 * Math.PI) / totalSegments;

        // Normalize rotation to 0-2PI
        let normalizedRot = finalRotation % (2 * Math.PI);
        if (normalizedRot < 0) normalizedRot += 2 * Math.PI;

        // The angle of the pointer relative to the wheel's 0 is what matters.
        // Pointer is at Top (1.5 PI or -0.5 PI)
        // Let's simplify: 
        // Index 0 starts at 'rotation'
        // Index i starts at 'rotation + i*arc'
        // We want 'rotation + i*arc' to cover the pointer (3*PI/2)

        // Actually simplest way:
        const pointerAngle = (3 * Math.PI / 2); // 270 degrees (Top)

        // Find which segment covers this angle
        // (BaseRotation + i*Arc) <= PointerAngle <= (BaseRotation + (i+1)*Arc)
        // Normalize everything

        for (let i = 0; i < totalSegments; i++) {
            let start = (finalRotation + i * arcSize) % (2 * Math.PI);
            let end = (start + arcSize) % (2 * Math.PI);

            if (start < 0) start += 2 * Math.PI;
            if (end < 0) end += 2 * Math.PI;

            // Check if pointer angle is between start and end
            // Handle wrap-around case
            let isMatch = false;
            if (start < end) {
                if (pointerAngle >= start && pointerAngle < end) isMatch = true;
            } else {
                if (pointerAngle >= start || pointerAngle < end) isMatch = true;
            }

            if (isMatch) {
                setTimeout(() => {
                    setSelectedSegment(segments[i]);
                    if (!isMuted) soundManager.play('win');
                }, 500);
                return;
            }
        }
    };

    // Editor Logic
    const addSegment = () => {
        if (!editInput) return;
        setSegments([...segments, { text: editInput, color: editColor }]);
        setEditInput("");
        setEditColor("#" + Math.floor(Math.random() * 16777215).toString(16));
    };

    const removeSegment = (index) => {
        if (segments.length <= 1) return;
        setSegments(segments.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center pt-8">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,0,150,0.15)_0%,transparent_70%)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(0,150,255,0.1)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <header className="w-full max-w-6xl flex items-center justify-between px-4 z-10 shrink-0 mb-4">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <h1 className="hidden md:block text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-sm">
                    SPIN & SPEAK
                </h1>

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setIsMuted(!isMuted)} variant="orange" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </GlossyButton>
                    <GlossyButton onClick={() => setShowEditor(true)} variant="pink" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <Edit size={20} />
                    </GlossyButton>
                </div>
            </header>

            {/* Main Game Area */}
            <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative z-10">

                {/* Wheel Container */}
                <div ref={containerRef} className="relative group w-full h-[60vh] flex items-center justify-center">
                    {/* Glow behind wheel */}
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-50 group-hover:scale-75 transition-transform duration-500" />

                    <canvas
                        ref={canvasRef}
                        width={containerSize.width}
                        height={containerSize.height}
                        className="object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Spin Button */}
                <div className="mt-8 mb-4">
                    <GlossyButton
                        onClick={spinWheel}
                        disabled={isSpinning}
                        variant="blue"
                        size="xl"
                        className="text-2xl px-12 py-6 animate-bounce-slow"
                        icon={<RotateCw size={32} className={isSpinning ? "animate-spin" : ""} />}
                    >
                        {isSpinning ? "SPINNING..." : "SPIN IT!"}
                    </GlossyButton>
                </div>

            </main>


            {/* Result Modal */}
            <AnimatePresence>
                {selectedSegment && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedSegment(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-full max-w-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader text="YOUR WINNINGS" color="green" />
                                <div className="p-12 text-center flex flex-col items-center gap-8">
                                    <Sparkles className="text-yellow-400 w-24 h-24 stroke-[1.5] animate-pulse" />

                                    <div className="bg-white/10 p-8 rounded-3xl border-4 border-white/20 w-full relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] leading-tight">
                                            {selectedSegment.text}
                                        </h2>
                                    </div>

                                    <GlossyButton onClick={() => setSelectedSegment(null)} variant="green" size="xl">
                                        AWESOME!
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditor(false)}
                    >
                        <motion.div
                            initial={{ y: 50 }} animate={{ y: 0 }}
                            className="w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <GlossyCard variant="default" className="max-h-[85vh] flex flex-col">
                                <RibbonHeader text="WHEEL EDITOR" color="blue" />

                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                    {/* Input Group */}
                                    <div className="flex gap-2 mb-6">
                                        <input
                                            value={editInput}
                                            onChange={e => setEditInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addSegment()}
                                            placeholder="Type a new option..."
                                            className="flex-1 bg-white ml-2 rounded-xl px-4 py-3 text-slate-800 font-bold border-4 border-[#8D6E63]/20 focus:border-[#8D6E63] outline-none shadow-inner"
                                        />
                                        <input
                                            type="color"
                                            value={editColor}
                                            onChange={e => setEditColor(e.target.value)}
                                            className="w-14 h-14 rounded-xl cursor-pointer border-4 border-white shadow-md bg-white p-1"
                                        />
                                        <button
                                            onClick={addSegment}
                                            className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_0_theme(colors.green.700)] active:translate-y-1 active:shadow-none transition-all"
                                        >
                                            <Plus size={28} strokeWidth={3} />
                                        </button>
                                    </div>

                                    {/* List */}
                                    <div className="space-y-3">
                                        {segments.map((seg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-3 bg-black/5 p-3 rounded-2xl group hover:bg-black/10 transition-colors"
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full shadow-sm border-2 border-white"
                                                    style={{ backgroundColor: seg.color }}
                                                />
                                                <span className="flex-1 font-bold text-[#5D4037] truncate text-lg">{seg.text}</span>
                                                <button
                                                    onClick={() => removeSegment(i)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-[#8D6E63]/20 bg-[#fff8e1]">
                                    <GlossyButton onClick={() => setShowEditor(false)} variant="blue" size="lg" className="w-full" icon={<Save size={20} />}>
                                        DONE
                                    </GlossyButton>
                                </div>

                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default SpinAndSpeak;
