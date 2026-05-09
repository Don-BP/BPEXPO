import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Trophy, Clock, Settings, Play, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import { useTheme } from '../context/ThemeContext';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';
import confetti from 'canvas-confetti';

const WORD_LISTS = {
    ANIMALS: [
        "LION", "TIGER", "BEAR", "CAT", "DOG", "FISH", "BIRD", "ZEBRA", "MONKEY", "PANDA", "KOALA",
        "SNAKE", "RABBIT", "HORSE", "SHEEP", "GOAT", "COW", "PIG", "DUCK", "CHICKEN", "MOUSE",
        "ELEPHANT", "GIRAFFE", "HIPPO", "RHINO", "FOX", "WOLF", "DEER", "CAMEL", "LLAMA"
    ],
    FRUIT: [
        "APPLE", "BANANA", "GRAPE", "MELON", "PEACH", "KIWI", "BERRY", "LEMON", "LIME", "ORANGE",
        "PEAR", "PLUM", "CHERRY", "FIG", "MANGO", "PAPAYA", "GUAVA", "DATE", "COCONUT", "OLIVE",
        "TOMATO", "AVOCADO", "BERRY", "LYCHEE", "DURIAN"
    ],
    COLORS: [
        "RED", "BLUE", "GREEN", "PINK", "BLACK", "WHITE", "GOLD", "SILVER", "BROWN", "GREY",
        "YELLOW", "ORANGE", "PURPLE", "TEAL", "NAVY", "SQUARE", "CIRCLE", "STAR", "HEART", "OVAL",
        "RECTANGLE", "DIAMOND", "CROSS", "DOT", "LINE"
    ],
    SCHOOL: [
        "BOOK", "PEN", "DESK", "CHAIR", "RULER", "GLUE", "PAPER", "PENCIL", "ERASER", "MARKER",
        "CRAYON", "SCISSORS", "TAPE", "NOTEBOOK", "FOLDER", "BAG", "CASE", "CHALK", "BOARD", "MAP",
        "GLOBE", "CLOCK", "STAPLER", "CLIP", "PAINT"
    ],
    FOOD: [
        "PIZZA", "PASTA", "RICE", "BREAD", "CAKE", "SOUP", "SALAD", "MEAT", "FISH", "EGG",
        "CHEESE", "MILK", "JUICE", "WATER", "TEA", "COFFEE", "SUGAR", "SALT", "PEPPER", "BUTTER",
        "JAM", "HONEY", "FRUIT", "VEGGIE", "SNACK", "CANDY", "COOKIE", "DONUT", "BURGER", "FRIES"
    ],
    SPORTS: [
        "SOCCER", "TENNIS", "GOLF", "RUGBY", "JUDO", "KARATE", "KENDO", "SUMO", "SWIM", "RUN",
        "JUMP", "DANCE", "YOGA", "CYCLE", "SKATE", "SKI", "HIKE", "CLIMB", "BOXING", "HOCKEY",
        "BASEBALL", "BALL", "BAT", "NET", "GOAL", "TEAM", "MATCH", "WIN", "LOSE", "DRILL"
    ],
    VERBS: [
        "RUN", "WALK", "JUMP", "SIT", "STAND", "EAT", "DRINK", "SLEEP", "WAKE", "READ",
        "WRITE", "LISTEN", "SPEAK", "PLAY", "WORK", "STUDY", "COOK", "CLEAN", "WASH", "BRUSH",
        "OPEN", "CLOSE", "PUSH", "PULL", "THROW", "CATCH", "HIT", "KICK", "TOUCH", "FEEL"
    ]
};

const GRID_SIZE = 10;
const DIRECTIONS = [
    [0, 1],   // Horizontal right
    [1, 0],   // Vertical down
    [1, 1],   // Diagonal down-right
    [0, -1],  // Horizontal left
    [-1, 0],  // Vertical up
];

const WordSearch = () => {
    // Config State
    const [category, setCategory] = useState("FRUIT");
    const [wordCount, setWordCount] = useState(5);
    const [isSetup, setIsSetup] = useState(false);

    // Game State
    // Status: 'idle' (waiting to start), 'animating' (wave effect), 'playing' (game active), 'won' (game over)
    const [gameStatus, setGameStatus] = useState('idle');
    const [grid, setGrid] = useState([]);
    const [placedWords, setPlacedWords] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [selection, setSelection] = useState([]); // Array of {r, c}
    const [isSelecting, setIsSelecting] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Timer State
    const [timer, setTimer] = useState(0);

    const selectionStartRef = useRef(null);

    const { isDark, toggleTheme } = useTheme();

    // Initial Random Setup (Preview)
    useEffect(() => {
        const cats = Object.keys(WORD_LISTS);
        const randomCat = cats[Math.floor(Math.random() * cats.length)];
        setCategory(randomCat);
        initGame(randomCat, true); // true = isPreview
    }, []);

    // Timer Effect
    useEffect(() => {
        let interval;
        if (gameStatus === 'playing') {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStatus]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartGame = () => {
        setGameStatus('animating');
        soundManager.play('start');

        // Regenerate grid immediately for the animation
        initGame(category, false);

        // Wait for animation to finish before starting timer (approx 1.5s wave)
        setTimeout(() => {
            setGameStatus('playing');
        }, 1500);
    };

    const handleRestart = () => {
        setIsSetup(false);
        handleStartGame();
    };

    const initGame = (overrideCategory = null, isPreview = false) => {
        setTimer(0);
        setFoundWords([]);
        setSelection([]);
        setIsSelecting(false);

        if (isPreview) {
            setGameStatus('idle');
        }

        // 1. Select Random Words
        const currentCat = overrideCategory || category;
        const allWords = WORD_LISTS[currentCat];

        // Shuffle and take N
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, Math.min(wordCount, 15)); // Cap at 15/available

        // 2. Generate
        const { newGrid, placed } = generateGrid(selectedWords);
        setGrid(newGrid);
        setPlacedWords(placed);
    };

    // ... (rest of the grid generation logic stays the same)
    const generateGrid = (words) => {
        let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        let placed = [];
        const sortedWords = [...words].sort((a, b) => b.length - a.length);

        for (let word of sortedWords) {
            let placedWord = false;
            let attempts = 0;
            while (!placedWord && attempts < 100) {
                const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);

                if (canPlace(newGrid, word, r, c, dir)) {
                    const coords = place(newGrid, word, r, c, dir);
                    placed.push({ word, color: getRandomColor(), coords });
                    placedWord = true;
                }
                attempts++;
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (newGrid[r][c] === '') {
                    newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
        placed.sort((a, b) => a.word.localeCompare(b.word));
        return { newGrid, placed };
    };

    const canPlace = (grid, word, r, c, [dr, dc]) => {
        if (r + dr * (word.length - 1) < 0 || r + dr * (word.length - 1) >= GRID_SIZE) return false;
        if (c + dc * (word.length - 1) < 0 || c + dc * (word.length - 1) >= GRID_SIZE) return false;

        for (let i = 0; i < word.length; i++) {
            const cell = grid[r + dr * i][c + dc * i];
            if (cell !== '' && cell !== word[i]) return false;
        }
        return true;
    };

    const place = (grid, word, r, c, [dr, dc]) => {
        const coords = [];
        for (let i = 0; i < word.length; i++) {
            grid[r + dr * i][c + dc * i] = word[i];
            coords.push({ r: r + dr * i, c: c + dc * i });
        }
        return coords;
    };

    const getRandomColor = () => {
        // Just return keys now, we'll map to Tailwind/Juicy styles in render
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];
        return colors[Math.floor(Math.random() * colors.length)];
    };


    const handleMouseDown = (r, c) => {
        if (gameStatus !== 'playing') return;
        setIsSelecting(true);
        selectionStartRef.current = { r, c };
        setSelection([{ r, c }]);
    };

    const handleMouseEnter = (r, c) => {
        if (!isSelecting || !selectionStartRef.current) return;

        const start = selectionStartRef.current;
        const dr = r - start.r;
        const dc = c - start.c;

        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
            const steps = Math.max(Math.abs(dr), Math.abs(dc));
            const sr = dr === 0 ? 0 : dr / steps;
            const sc = dc === 0 ? 0 : dc / steps;

            const newSelection = [];
            for (let i = 0; i <= steps; i++) {
                newSelection.push({ r: start.r + sr * i, c: start.c + sc * i });
            }
            setSelection(newSelection);
        }
    };

    const handleMouseUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);
        checkSelection();
        setSelection([]);
    };

    const checkSelection = () => {
        const word = selection.map(pos => grid[pos.r][pos.c]).join('');
        const found = placedWords.find(pw => pw.word === word && !foundWords.includes(pw.word));

        if (found) {
            const newFound = [...foundWords, found.word];
            setFoundWords(newFound);
            soundManager.play('correct');
            if (newFound.length === placedWords.length) {
                setGameStatus('won');
                soundManager.play('win');
                confetti({ particleCount: 200, spread: 100 });
            }
        } else {
            const reverseWord = word.split('').reverse().join('');
            const foundRev = placedWords.find(pw => pw.word === reverseWord && !foundWords.includes(pw.word));
            if (foundRev) {
                const newFoundRev = [...foundWords, foundRev.word];
                setFoundWords(newFoundRev);
                soundManager.play('correct');
                if (newFoundRev.length === placedWords.length) {
                    setGameStatus('won');
                    soundManager.play('win');
                    confetti({ particleCount: 200, spread: 100 });
                }
            }
        }
    };

    const isSelected = (r, c) => {
        return selection.some(pos => pos.r === r && pos.c === c);
    };

    const getFoundColor = (r, c) => {
        for (let wordStr of foundWords) {
            const wordObj = placedWords.find(pw => pw.word === wordStr);
            if (wordObj) {
                const isPart = wordObj.coords.some(coord => coord.r === r && coord.c === c);
                if (isPart) return wordObj.color;
            }
        }
        return null;
    };

    const cellVariants = {
        idle: { scale: 1, filter: "brightness(1)" },
        animating: (custom) => ({
            scale: [1, 1.4, 1],
            filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
            transition: {
                delay: custom * 0.05,
                duration: 0.4
            }
        })
    };

    // --- RENDER HELPERS ---
    const getCellStyles = (r, c) => {
        const selected = isSelected(r, c);
        const foundColor = getFoundColor(r, c);

        if (selected) return "bg-pink-500 text-white z-20 scale-110 shadow-lg border-2 border-white";

        if (foundColor) {
            const colorMap = {
                red: 'bg-red-500/80 text-white',
                blue: 'bg-blue-500/80 text-white',
                green: 'bg-green-500/80 text-white',
                yellow: 'bg-yellow-500/80 text-white',
                purple: 'bg-purple-500/80 text-white',
                pink: 'bg-pink-500/80 text-white',
                orange: 'bg-orange-500/80 text-white'
            };
            return `${colorMap[foundColor]} z-10`;
        }

        return "bg-slate-800/40 text-slate-400 border border-white/5 hover:bg-slate-700 hover:text-white hover:border-white/20";
    };


    return (
        <div
            className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4 selection:bg-transparent"
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
        >

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20" />
            </div>


            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-2 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <GlossyCard variant="default" className="px-4 py-1 flex items-center gap-2">
                    <Clock size={16} className={gameStatus === 'playing' ? "text-green-600 animate-pulse" : "text-amber-900/40"} />
                    <span className="font-mono text-xl font-bold tracking-widest text-amber-900">{formatTime(timer)}</span>
                </GlossyCard>

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setShowHelp(true)} variant="default" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <CircleHelp size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={toggleTheme} variant="default" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </GlossyButton>
                    <GlossyButton onClick={() => setIsSetup(true)} variant="pink" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <Settings size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={handleRestart} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw size={20} />
                    </GlossyButton>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-7xl flex-1 items-start justify-center overflow-hidden">

                {/* Left: Word Bank */}
                <GlossyCard variant="default" className="md:w-64 w-full flex-none max-h-[200px] md:max-h-[80vh] flex flex-col">
                    <RibbonHeader text={category} color="purple" />
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="flex flex-wrap md:flex-col gap-2">
                            {placedWords.map((pw, i) => (
                                <div
                                    key={i}
                                    className={`
                                        px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 border flex items-center justify-between flex-1 md:flex-none
                                        ${foundWords.includes(pw.word)
                                            ? 'bg-green-500/20 text-green-600 border-green-500/30 line-through opacity-60'
                                            : 'bg-white/40 text-slate-900 border-black/5 hover:bg-white/60'
                                        }
                                    `}
                                >
                                    <span>{pw.word}</span>
                                    {foundWords.includes(pw.word) && <Trophy size={14} className="text-yellow-400" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-3 bg-black/20 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-white/5">
                        {foundWords.length} / {placedWords.length} Found
                    </div>
                </GlossyCard>


                {/* Right: Grid */}
                <div className="flex-1 relative flex items-center justify-center aspect-square max-w-[80vh] w-full">
                    {/* Start Overlay */}
                    <AnimatePresence>
                        {gameStatus === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
                            >
                                <GlossyButton onClick={handleStartGame} variant="pink" size="xl" className="shadow-[0_0_50px_rgba(236,72,153,0.5)] scale-125 !w-auto px-12" icon={<Play fill="currentColor" />}>
                                    START
                                </GlossyButton>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* The Grid */}
                    <GlossyCard variant="default" className="w-full h-full p-2 bg-slate-900/80">
                        <div
                            className="w-full h-full rounded-xl overflow-hidden touch-none select-none"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                                gap: '2px',
                            }}
                        >
                            {grid.map((row, r) => (
                                row.map((cell, c) => (
                                    <motion.div
                                        key={`${r}-${c}`}
                                        custom={r + c}
                                        variants={cellVariants}
                                        animate={gameStatus === 'animating' ? 'animating' : 'idle'}
                                        onMouseDown={() => handleMouseDown(r, c)}
                                        onMouseEnter={() => handleMouseEnter(r, c)}
                                        className={`flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-black rounded-md transition-colors duration-150 cursor-pointer ${getCellStyles(r, c)}`}
                                    >
                                        {cell}
                                    </motion.div>
                                ))
                            ))}
                        </div>
                    </GlossyCard>
                </div>
            </div>


            {/* Setup Modal */}
            <AnimatePresence>
                {isSetup && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader text="GAME SETUP" color="pink" icon={<Settings className="w-5 h-5" />} />

                                <div className="p-8 space-y-6">
                                    {/* Topics */}
                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Topic</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {Object.keys(WORD_LISTS).map(cat => (
                                                <GlossyButton
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    variant={category === cat ? "blue" : "default"}
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                >
                                                    {cat}
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Word Count</label>
                                            <span className="text-xl font-black text-pink-400">{wordCount}</span>
                                        </div>
                                        <input
                                            type="range" min="3" max="15"
                                            value={wordCount}
                                            onChange={(e) => setWordCount(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>

                                    <GlossyButton onClick={() => { setIsSetup(false); handleStartGame(); }} variant="green" size="xl" className="w-full">
                                        APPLY & RESTART
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                {gameStatus === 'won' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlossyCard variant="orange" className="border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                                <RibbonHeader text="COMPLETE!" color="red" />
                                <div className="p-8 pb-12 text-center flex flex-col items-center">
                                    <div className="text-8xl mb-6 filter drop-shadow-md">🏆</div>

                                    <div className="bg-black/20 rounded-xl px-8 py-4 mb-8 border border-white/10">
                                        <span className="block text-yellow-100/60 text-xs font-bold uppercase tracking-widest mb-1">Time</span>
                                        <span className="text-5xl font-black text-white drop-shadow-md font-mono">
                                            {formatTime(timer)}
                                        </span>
                                    </div>

                                    <GlossyButton onClick={handleRestart} variant="white" size="xl" className="w-full text-orange-600">
                                        Play Again
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

export default WordSearch;
