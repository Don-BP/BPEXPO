import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Delete, Brain, Lightbulb, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const WORDS = [
    { word: "APPLE", category: "FRUIT" }, { word: "BEACH", category: "PLACE" },
    { word: "BREAD", category: "FOOD" }, { word: "BRUSH", category: "OBJECT" },
    { word: "CHAIR", category: "FURNITURE" }, { word: "CLASS", category: "SCHOOL" },
    { word: "CLOCK", category: "OBJECT" }, { word: "CLOUD", category: "NATURE" },
    { word: "COLOR", category: "ART" }, { word: "DANCE", category: "ACTION" },
    { word: "DREAM", category: "MIND" }, { word: "DRINK", category: "ACTION" },
    { word: "DRIVE", category: "ACTION" }, { word: "EARTH", category: "NATURE" },
    { word: "EVENT", category: "TIME" }, { word: "FIELD", category: "PLACE" },
    { word: "FRUIT", category: "FOOD" }, { word: "GLASS", category: "MATERIAL" },
    { word: "GRASS", category: "NATURE" }, { word: "GREEN", category: "COLOR" },
    { word: "HAPPY", category: "EMOTION" }, { word: "HEART", category: "BODY" },
    { word: "HELLO", category: "GREETING" }, { word: "HORSE", category: "ANIMAL" },
    { word: "HOUSE", category: "PLACE" }, { word: "IMAGE", category: "MEDIA" },
    { word: "JUICE", category: "DRINK" }, { word: "GRAPE", category: "FRUIT" },
    { word: "LEMON", category: "FRUIT" },
    { word: "LIGHT", category: "PHYSICS" }, { word: "LUNCH", category: "MEAL" },
    { word: "MELON", category: "FRUIT" }, { word: "MONEY", category: "OBJECT" },
    { word: "MOUSE", category: "ANIMAL" }, { word: "MOVIE", category: "MEDIA" },
    { word: "MUSIC", category: "ART" }, { word: "NIGHT", category: "TIME" },
    { word: "OCEAN", category: "NATURE" }, { word: "PARTY", category: "EVENT" },
    { word: "PHONE", category: "TECH" }, { word: "PIANO", category: "MUSIC" },
    { word: "PIZZA", category: "FOOD" }, { word: "PLANE", category: "VEHICLE" },
    { word: "PLANT", category: "NATURE" }, { word: "PLATE", category: "KITCHEN" },
    { word: "POINT", category: "GAME" }, { word: "POWER", category: "ENERGY" },
    { word: "PRIZE", category: "REWARD" }, { word: "QUIET", category: "SOUND" },
    { word: "RADIO", category: "TECH" }, { word: "RIVER", category: "NATURE" },
    { word: "ROBOT", category: "TECH" }, { word: "SHIRT", category: "CLOTHES" },
    { word: "SHOES", category: "CLOTHES" }, { word: "SKIRT", category: "CLOTHES" },
    { word: "SLEEP", category: "ACTION" }, { word: "SMILE", category: "EMOTION" },
    { word: "SNAKE", category: "ANIMAL" }, { word: "SOUND", category: "PHYSICS" },
    { word: "SPACE", category: "NATURE" }, { word: "SPOON", category: "KITCHEN" },
    { word: "SPORT", category: "ACTIVITY" }, { word: "START", category: "ACTION" },
    { word: "STONE", category: "MATERIAL" }, { word: "STORE", category: "PLACE" },
    { word: "STORM", category: "WEATHER" }, { word: "STORY", category: "MEDIA" },
    { word: "STUDY", category: "ACTION" }, { word: "SUGAR", category: "FOOD" },
    { word: "SWEET", category: "TASTE" }, { word: "TABLE", category: "FURNITURE" },
    { word: "TIGER", category: "ANIMAL" }, { word: "TOUCH", category: "SENSE" },
    { word: "TOWEL", category: "OBJECT" }, { word: "TRACK", category: "PLACE" },
    { word: "TRAIN", category: "VEHICLE" }, { word: "TRUCK", category: "VEHICLE" },
    { word: "VIDEO", category: "MEDIA" }, { word: "WATER", category: "DRINK" },
    { word: "WATCH", category: "ACCESSORY" }, { word: "WHALE", category: "ANIMAL" },
    { word: "WHITE", category: "COLOR" }, { word: "WORLD", category: "PLACE" },
    { word: "WRITE", category: "ACTION" }, { word: "ZEBRA", category: "ANIMAL" }
];

const KEYS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

const WordDetect = () => {
    // solution is now an object { word, category }
    const [solution, setSolution] = useState({ word: "", category: "" });
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [shakeRow, setShakeRow] = useState(false);
    const [showHelp, setShowHelp] = useState(true);
    const [keyStates, setKeyStates] = useState({});
    const [showHint, setShowHint] = useState(false); // New hint state

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const key = e.key.toUpperCase();
            if (key === 'ENTER') handleInput('ENTER');
            else if (key === 'BACKSPACE') handleInput('BACKSPACE');
            else if (/^[A-Z]$/.test(key)) handleInput(key);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, guesses, currentGuess]);

    const initGame = () => {
        const randomItem = WORDS[Math.floor(Math.random() * WORDS.length)];
        setSolution(randomItem);
        setGuesses([]);
        setCurrentGuess("");
        setGameStatus('playing');
        setKeyStates({});
        setShakeRow(false);
        setShowHint(false);
        soundManager.play('start');
        console.log("Solution:", randomItem.word);
    };

    const handleInput = (key) => {
        if (gameStatus !== 'playing') return;

        if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
            soundManager.play('click');
        } else if (key === 'ENTER') {
            submitGuess();
        } else {
            if (currentGuess.length < WORD_LENGTH) {
                setCurrentGuess(prev => prev + key);
                soundManager.play('click');
            } else {
                setShakeRow(true);
                setTimeout(() => setShakeRow(false), 500);
            }
        }
    };

    const submitGuess = () => {
        if (currentGuess.length !== WORD_LENGTH) {
            setShakeRow(true);
            setTimeout(() => setShakeRow(false), 500);
            return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);

        const newKeyStates = { ...keyStates };
        const sChars = solution.word.split('');
        const gChars = currentGuess.split('');

        // First pass: Correct
        gChars.forEach((char, i) => {
            if (char === sChars[i]) {
                newKeyStates[char] = 'correct';
                sChars[i] = null;
                gChars[i] = null;
            }
        });

        // Second pass: Present
        gChars.forEach((char, i) => {
            if (char && sChars.includes(char)) {
                if (newKeyStates[char] !== 'correct') {
                    newKeyStates[char] = 'present';
                }
                const idx = sChars.indexOf(char);
                sChars[idx] = null;
            } else if (char) {
                if (!newKeyStates[char]) {
                    newKeyStates[char] = 'absent';
                }
            }
        });

        setKeyStates(newKeyStates);
        setCurrentGuess("");

        if (currentGuess === solution.word) {
            setGameStatus('won');
            soundManager.play('correct');
        } else if (newGuesses.length >= MAX_GUESSES) {
            setGameStatus('lost');
            soundManager.play('wrong');
        } else {
            soundManager.play('switch');
        }
    };

    const getRowColors = (guess) => {
        const status = Array(5).fill('absent');
        const sChars = solution.word.split('');
        const gChars = guess.split('');

        gChars.forEach((char, i) => {
            if (char === sChars[i]) {
                status[i] = 'correct';
                sChars[i] = null;
                gChars[i] = null;
            }
        });
        gChars.forEach((char, i) => {
            if (char && sChars.includes(char)) {
                status[i] = 'present';
                const idx = sChars.indexOf(char);
                sChars[idx] = null;
            }
        });
        return status;
    };

    // Hint Logic: Reveal first letter
    const revealHint = () => {
        setShowHint(true);
        soundManager.play('pop');
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center pt-8">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-900/20 to-transparent rounded-full blur-3xl opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-900/20 to-transparent rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header */}
            <header className="w-full max-w-4xl flex items-center justify-between px-4 z-10 shrink-0 mb-4">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <Brain className="text-emerald-400" size={32} />
                        <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            WORD DETECT
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    <GlossyButton onClick={revealHint} variant="orange" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <Lightbulb size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={() => setShowHelp(true)} variant="blue" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <CircleHelp size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={initGame} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw size={20} />
                    </GlossyButton>
                </div>
            </header>

            {/* Category Banner */}
            <GlossyCard variant="default" className="mb-6 px-8 py-2 min-w-[300px]">
                <div className="flex flex-col items-center">
                    <p className="text-[#8D6E63] text-xs font-bold tracking-widest uppercase mb-1">Category</p>
                    <p className="text-2xl font-black text-[#5D4037] tracking-widest uppercase">{solution.category}</p>
                </div>
            </GlossyCard>

            {/* Active Hint Display */}
            <AnimatePresence>
                {showHint && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <GlossyCard variant="wood" className="px-6 py-2 border-yellow-400/50">
                            <span className="text-yellow-100 font-bold text-sm">STARTS WITH: <span className="text-2xl ml-1 text-white">{solution.word?.[0]}</span></span>
                        </GlossyCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Board Container - Responsive & Full Size */}
            <div className="flex-1 w-full max-w-4xl px-4 flex items-center justify-center min-h-0 z-10 mb-4">
                <div className="w-full flex flex-col gap-2 justify-center">
                    {Array(MAX_GUESSES).fill(null).map((_, rowIndex) => {
                        const isCurrent = rowIndex === guesses.length;
                        const guess = guesses[rowIndex];
                        const rowColors = guess ? getRowColors(guess) : [];

                        return (
                            <motion.div
                                key={rowIndex}
                                animate={isCurrent && shakeRow ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex gap-2 w-full justify-center"
                            >
                                {Array(WORD_LENGTH).fill(null).map((_, colIndex) => {
                                    const letter = isCurrent ? currentGuess[colIndex] : (guess ? guess[colIndex] : "");
                                    const status = guess ? rowColors[colIndex] : '';

                                    // Juicy UI Board Styles
                                    let bgClass = "bg-black/20 border-white/10"; // Default empty
                                    if (letter && !status) bgClass = "bg-white/10 border-white/30 text-white"; // Typed but not submitted
                                    if (status === 'correct') bgClass = "bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-[0_4px_0_theme(colors.green.800)] text-white";
                                    if (status === 'present') bgClass = "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-[0_4px_0_theme(colors.yellow.800)] text-white";
                                    if (status === 'absent') bgClass = "bg-slate-700 border-slate-600 text-slate-400 opacity-80";

                                    return (
                                        <motion.div
                                            key={colIndex}
                                            initial={false}
                                            animate={guess ? { rotateX: 360 } : { scale: letter ? 1.1 : 1 }}
                                            transition={{ delay: colIndex * 0.1, duration: 0.6 }}
                                            className={`
                                                w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-2 transition-all duration-300 flex items-center justify-center font-black text-3xl sm:text-4xl md:text-5xl
                                                ${bgClass}
                                                ${isCurrent && letter ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''}
                                            `}
                                        >
                                            {letter}
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Input Area: Keyboard + Check Button */}
            <div className="w-full max-w-4xl p-2 pb-8 shrink-0 z-10 flex flex-col items-center gap-4">

                {/* Styled Keyboard */}
                <div className="w-full flex flex-col gap-1.5">
                    {KEYS.map((row, i) => (
                        <div key={i} className="flex justify-center gap-1.5 w-full">
                            {row.map(key => {
                                if (key === 'ENTER') return null; // Using dedicated button
                                const state = keyStates[key] || '';

                                let keyStyle = "bg-white/10 text-slate-200 border-white/5 hover:bg-white/20"; // Default
                                if (state === 'correct') keyStyle = "bg-green-500 text-white border-green-600 shadow-md";
                                if (state === 'present') keyStyle = "bg-yellow-500 text-white border-yellow-600 shadow-md";
                                if (state === 'absent') keyStyle = "bg-slate-800 text-slate-600 border-slate-700 opacity-50";

                                const flexClass = key.length > 1 ? 'w-16' : 'w-10 sm:w-12';

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleInput(key)}
                                        className={`${flexClass} h-12 md:h-14 rounded-lg font-bold text-lg transition-all active:scale-95 flex items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 ${keyStyle}`}
                                    >
                                        {key === 'BACKSPACE' ? <Delete size={20} /> : key}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Check Button */}
                <div className="w-full max-w-sm">
                    <GlossyButton
                        onClick={submitGuess}
                        disabled={currentGuess.length !== WORD_LENGTH}
                        variant="green"
                        size="xl"
                        className="w-full"
                        icon={<Check />}
                    >
                        CHECK WORD
                    </GlossyButton>
                </div>
            </div>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader text="HOW TO PLAY" color="blue" />
                                <div className="p-6 space-y-6">
                                    <p className="text-lg text-[#5D4037] font-bold text-center">
                                        Guess the hidden word in <span className="text-blue-600">6 tries</span>!
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-center bg-green-100 p-3 rounded-xl border border-green-200">
                                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold border-b-4 border-green-700">A</div>
                                            <p className="text-green-800 font-bold">Right letter, right spot!</p>
                                        </div>
                                        <div className="flex gap-4 items-center bg-yellow-100 p-3 rounded-xl border border-yellow-200">
                                            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold border-b-4 border-yellow-700">B</div>
                                            <p className="text-yellow-800 font-bold">Right letter, wrong spot.</p>
                                        </div>
                                        <div className="flex gap-4 items-center bg-slate-200 p-3 rounded-xl border border-slate-300">
                                            <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center text-white font-bold border-b-4 border-slate-700">C</div>
                                            <p className="text-slate-600 font-bold">Not in the word.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <GlossyButton onClick={() => setShowHelp(false)} variant="green" size="lg" className="w-full">
                                            LET'S PLAY!
                                        </GlossyButton>
                                    </div>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Win/Loss Modal */}
            <AnimatePresence>
                {gameStatus !== 'playing' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader
                                    text={gameStatus === 'won' ? 'SPLENDID!' : 'GAME OVER'}
                                    color={gameStatus === 'won' ? 'green' : 'red'}
                                />
                                <div className="p-8 text-center">
                                    <div className="text-8xl mb-6 filter drop-shadow hover:scale-110 transition cursor-default">
                                        {gameStatus === 'won' ? '🎉' : '💔'}
                                    </div>

                                    <p className="text-[#8D6E63] mb-2 font-bold uppercase tracking-widest">The word was:</p>
                                    <div className="bg-[#3E2723] rounded-2xl p-4 mb-8 border-4 border-[#5D4037] shadow-inner">
                                        <span className="text-4xl font-black tracking-[0.2em] text-white">
                                            {solution.word}
                                        </span>
                                    </div>

                                    <GlossyButton onClick={initGame} variant="blue" size="xl" className="w-full" icon={<RefreshCw />}>
                                        PLAY AGAIN
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

export default WordDetect;
