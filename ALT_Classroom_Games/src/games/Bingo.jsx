import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Grid3X3, Check, Trophy, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const THEMES = {
    NUMBERS: {
        name: 'Numbers',
        data: Array.from({ length: 75 }, (_, i) => i + 1)
    },
    FRUITS: {
        name: 'Fruits',
        data: [
            { text: "Apple", emoji: "🍎" }, { text: "Banana", emoji: "🍌" },
            { text: "Grape", emoji: "🍇" }, { text: "Melon", emoji: "🍈" },
            { text: "Peach", emoji: "🍑" }, { text: "Lemon", emoji: "🍋" },
            { text: "Kiwi", emoji: "🥝" }, { text: "Orange", emoji: "🍊" },
            { text: "Cherry", emoji: "🍒" }, { text: "Pear", emoji: "🍐" },
            { text: "Berry", emoji: "🍓" }, { text: "Mango", emoji: "🥭" },
            { text: "Pineapple", emoji: "🍍" }, { text: "Coco", emoji: "🥥" },
            { text: "Plum", emoji: "🫐" }, { text: "Lime", emoji: "🥬" } // Using kale/lettuce for lime green if lime not avail, or just text. Let's use 🍈 for melon and 🍋 for lemon. I'll use 🍐 pear? No. 🥬 is lettuce. Let's check Karuta.. No lime there. 🟢 green circle? No. Let's stick to 🍋 for Lemon and distinct for Lime. Maybe 🥝 is close.
            // Actually, let's just use standard emojis.
        ]
    },
    ANIMALS: {
        name: 'Animals',
        data: [
            { text: "Bear", emoji: "🐻" }, { text: "Cat", emoji: "🐱" },
            { text: "Dog", emoji: "🐶" }, { text: "Lion", emoji: "🦁" },
            { text: "Tiger", emoji: "🐯" }, { text: "Bird", emoji: "🐦" },
            { text: "Pig", emoji: "🐷" }, { text: "Rabbit", emoji: "🐰" },
            { text: "Panda", emoji: "🐼" }, { text: "Fox", emoji: "🦊" },
            { text: "Wolf", emoji: "🐺" }, { text: "Fish", emoji: "🐟" },
            { text: "Whale", emoji: "🐳" }, { text: "Duck", emoji: "🦆" },
            { text: "Cow", emoji: "🐮" }, { text: "Sheep", emoji: "🐑" }
        ]
    }
};

const Bingo = () => {
    const [gridSize, setGridSize] = useState(4); // 3, 4, 5, 6
    const [currentTheme, setCurrentTheme] = useState('NUMBERS');
    const [grid, setGrid] = useState([]); // Array of { value, stamped }
    const [won, setWon] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [editCell, setEditCell] = useState(null); // { index } for manual placement

    // For scaling text
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState(0);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize(containerRef.current.clientWidth);
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        generateCard(currentTheme, gridSize);
    }, [currentTheme, gridSize]);

    const generateCard = (themeKey, size = 4) => {
        setWon(false);
        const sourceData = [...THEMES[themeKey].data];
        const totalCells = size * size;

        let pool = [...sourceData];
        while (pool.length < totalCells) {
            pool = [...pool, ...sourceData];
        }

        // Shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        const items = pool.slice(0, totalCells).map(val => ({ value: val, stamped: false }));
        setGrid(items);
        soundManager.play('switch');
    };

    const toggleCell = (index) => {
        if (manualMode) {
            setEditCell({ index });
            return;
        }

        const newGrid = [...grid];
        newGrid[index].stamped = !newGrid[index].stamped;
        setGrid(newGrid);

        if (newGrid[index].stamped) {
            soundManager.play('click');
            checkWin(newGrid);
        } else {
            soundManager.play('click');
        }
    };

    const checkWin = (currentGrid) => {
        if (won) return;

        const size = gridSize;
        const lines = [];

        // Rows
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) row.push(r * size + c);
            lines.push(row);
        }
        // Cols
        for (let c = 0; c < size; c++) {
            const col = [];
            for (let r = 0; r < size; r++) col.push(r * size + c);
            lines.push(col);
        }
        // Diagonals
        const d1 = [], d2 = [];
        for (let i = 0; i < size; i++) {
            d1.push(i * size + i);
            d2.push(i * size + (size - 1 - i));
        }
        lines.push(d1, d2);

        const isWin = lines.some(line => {
            return line.every(idx => currentGrid[idx].stamped);
        });

        if (isWin) {
            setWon(true);
            soundManager.play('win');
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    // Responsive Font Size Calculation
    const getFontSize = () => {
        // Base logical sizes (tailwind classes)
        if (typeof grid[0]?.value === 'number') {
            // Numbers
            if (gridSize === 3) return 'text-[8vh] md:text-[min(8vw,12vh)]';
            if (gridSize === 4) return 'text-[6vh] md:text-[min(6vw,9vh)]';
            if (gridSize === 5) return 'text-[5vh] md:text-[min(5vw,7vh)]';
            if (gridSize === 6) return 'text-[4vh] md:text-[min(4vw,6vh)]';
        }
        // Text/Emoji Objects
        if (gridSize === 3) return 'text-3xl md:text-5xl';
        if (gridSize === 4) return 'text-xl md:text-3xl';
        if (gridSize === 5) return 'text-lg md:text-xl';
        return 'text-sm md:text-base';
    };

    const fontStyle = getFontSize();


    return (
        <div className="h-screen w-full relative overflow-hidden font-sans text-slate-900 flex flex-col items-center bg-slate-900">
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-indigo-950" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,100,200,0.05)_0%,transparent_70%)]" />
            </div>

            {/* Header (Minimal Height) */}
            <header className="flex-none w-full max-w-7xl flex items-center justify-between px-4 py-2 z-20 shrink-0 h-16">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={18} />} className="text-xs">
                        Quit
                    </GlossyButton>
                </Link>

                <h1 className="text-2xl md:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400 drop-shadow-md">
                    BINGO
                </h1>

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setManualMode(!manualMode)} variant={manualMode ? "orange" : "default"} size="sm" className="w-10 h-10 p-0 flex items-center justify-center">
                        <Settings size={18} />
                    </GlossyButton>
                    <GlossyButton onClick={() => generateCard(currentTheme, gridSize)} variant="green" size="sm" className="w-10 h-10 p-0 flex items-center justify-center">
                        <RefreshCw size={18} />
                    </GlossyButton>
                </div>
            </header>

            {/* Controls (Compacted Horizontal) */}
            <div className="flex-none z-20 w-fit max-w-full px-2 mb-2 flex justify-center">
                <GlossyCard variant="default" className="p-1.5 flex gap-4 items-center">
                    {/* Themes */}
                    <div className="flex gap-1">
                        {Object.keys(THEMES).map(key => (
                            <button
                                key={key}
                                onClick={() => setCurrentTheme(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${currentTheme === key ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 bg-black/5'}`}
                            >
                                {THEMES[key].name}
                            </button>
                        ))}
                    </div>

                    <div className="w-[1px] h-6 bg-slate-300/50" />

                    {/* Sizes */}
                    <div className="flex gap-1">
                        {[3, 4, 5, 6].map(size => (
                            <button
                                key={size}
                                onClick={() => setGridSize(size)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${gridSize === size ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 bg-black/5'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </GlossyCard>
            </div>


            {/* Main Board Area (Fill remaining space) */}
            <div className="flex-1 w-full flex items-center justify-center p-2 md:p-4 min-h-0 overflow-hidden relative z-10">

                {/* Board Container - Maintain Aspect Ratio but Fill Height */}
                <div className="relative h-full aspect-square w-auto max-w-full">

                    {manualMode && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-100/90 backdrop-blur text-amber-800 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-300 animate-pulse z-30 shadow-sm whitespace-nowrap pointer-events-none">
                            Drag / Edit Mode
                        </div>
                    )}

                    <GlossyCard
                        variant="default"
                        className="w-full h-full"
                        contentClassName="p-3 md:p-6 flex flex-col justify-center items-center relative"
                    >

                        <div
                            ref={containerRef}
                            className="grid gap-2 w-full h-full"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                gridTemplateRows: `repeat(${gridSize}, 1fr)`
                            }}
                        >
                            {grid.map((cell, i) => (
                                <motion.div
                                    key={`${cell.value}-${i}`}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.01 }} // Fast stagger
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => toggleCell(i)}
                                    className={`
                                        relative rounded-xl md:rounded-2xl 
                                        flex items-center justify-center text-center select-none cursor-pointer 
                                        transition-all duration-150 shadow-sm border-b-[4px] active:border-b-0 active:translate-y-[4px]
                                        overflow-hidden
                                        ${cell.stamped
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-orange-600 shadow-md'
                                            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}
                                    `}
                                >
                                    <div className={`w-full h-full flex flex-col items-center justify-center p-1 break-words leading-none ${fontStyle} font-black gap-2 md:gap-4`}>
                                        {typeof cell.value === 'object' ? (
                                            <>
                                                <span className="text-[5vh] md:text-[min(10vw,10vh)] drop-shadow-sm leading-none">{cell.value.emoji}</span>
                                                <span className="uppercase tracking-wide leading-none">{cell.value.text}</span>
                                            </>
                                        ) : (
                                            cell.value
                                        )}
                                    </div>

                                    {/* Checkmark Overlay */}
                                    <AnimatePresence>
                                        {cell.stamped && (
                                            <motion.div
                                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            >
                                                <div className="opacity-30 mix-blend-multiply w-[90%] h-[90%] bg-black rounded-full blur-xl absolute" />
                                                <Check className="text-white drop-shadow-lg w-[60%] h-[60%]" strokeWidth={4} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </GlossyCard>
                </div>
            </div>

            {/* Win Modal */}
            <AnimatePresence>
                {won && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 inset-x-0 z-50 p-4 pb-8 flex justify-center pointer-events-none"
                    >
                        <GlossyCard variant="orange" className="pointer-events-auto border-4 border-yellow-300 shadow-[0_0_60px_rgba(251,191,36,0.5)] max-w-lg w-full">
                            <div className="p-4 md:p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-yellow-400 p-3 rounded-full text-white shadow-lg">
                                        <Trophy size={32} />
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-white italic tracking-tighter drop-shadow-md">BINGO!</div>
                                        <div className="text-yellow-100 text-xs font-bold uppercase tracking-wider">Fantastic Job!</div>
                                    </div>
                                </div>
                                <GlossyButton onClick={() => generateCard(currentTheme, gridSize)} variant="white" className="text-orange-600 font-bold px-6">
                                    Again!
                                </GlossyButton>
                            </div>
                        </GlossyCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Edit Modal */}
            <AnimatePresence>
                {manualMode && editCell && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setEditCell(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader text="SELECT CONTENT" color="blue" />
                                <div className="p-6 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {THEMES[currentTheme].data.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const isUsed = grid.some(cell => cell.value === item);
                                                if (isUsed) return;
                                                const newGrid = [...grid];
                                                newGrid[editCell.index].value = item;
                                                setGrid(newGrid);
                                                setEditCell(null);
                                            }}
                                            disabled={grid.some(cell => cell.value === item)}
                                            className={`p-2 rounded-xl text-xs font-bold break-words transition-all aspect-square flex flex-col items-center justify-center text-center gap-1
                                                ${grid.some(cell => (typeof cell.value === 'object' ? cell.value.text === item.text : cell.value === item))
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 shadow-sm'
                                                }`}
                                        >
                                            {typeof item === 'object' ? (
                                                <>
                                                    <span className="text-2xl">{item.emoji}</span>
                                                    <span className="text-[10px] uppercase">{item.text}</span>
                                                </>
                                            ) : (
                                                item
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Bingo;
