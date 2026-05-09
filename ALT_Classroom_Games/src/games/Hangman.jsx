import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Heart, Moon, Sun, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import { useTheme } from '../context/ThemeContext';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';
import confetti from 'canvas-confetti';

const CATEGORIES = {
    ANIMALS: {
        name: "Animals",
        words: ["ELEPHANT", "GIRAFFE", "MONKEY", "PENGUIN", "KANGAROO", "DOLPHIN", "ZEBRA", "LION", "TIGER", "BEAR"],
        color: "green"
    },
    FRUITS: {
        name: "Fruits",
        words: ["STRAWBERRY", "PINEAPPLE", "WATERMELON", "BLUEBERRY", "ORANGE", "BANANA", "GRAPES", "APPLE", "PEACH", "MANGO"],
        color: "orange"
    },
    COLORS: {
        name: "Colors",
        words: ["PURPLE", "ORANGE", "YELLOW", "INDIGO", "VIOLET", "MAROON", "TURQUOISE", "MAGENTA", "SILVER", "GOLDEN"],
        color: "pink"
    },
    SCHOOL: {
        name: "School",
        words: ["TEACHER", "STUDENT", "PENCIL", "ERASER", "NOTEBOOK", "CLASSROOM", "LIBRARY", "SCISSORS", "RULER", "CRAYON"],
        color: "blue"
    }
};

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const MAX_MISTAKES = 7;

const Snowman = ({ mistakes }) => {
    // Simple snowman/snowman-like figure parts - using SVG for crispiness
    const parts = [
        <circle key="base" cx="100" cy="160" r="40" fill="white" stroke="white" strokeWidth="2" fillOpacity="1" />, // 1
        <circle key="mid" cx="100" cy="115" r="30" fill="white" stroke="white" strokeWidth="2" fillOpacity="1" />,  // 2
        <circle key="head" cx="100" cy="75" r="20" fill="white" stroke="white" strokeWidth="2" fillOpacity="1" />,   // 3
        <g key="eyes">
            <circle cx="92" cy="70" r="2" fill="black" />
            <circle cx="108" cy="70" r="2" fill="black" />
        </g>, // 4
        <path key="nose" d="M100 75 L110 78 L100 81 Z" fill="orange" fillOpacity="1" />, // 5
        <g key="arms">
            <line x1="70" y1="115" x2="40" y2="95" stroke="brown" strokeWidth="3" />
            <line x1="130" y1="115" x2="160" y2="95" stroke="brown" strokeWidth="3" />
        </g>, // 6
        <rect key="hat" x="80" y="40" width="40" height="15" fill="#333" /> // 7
    ];

    return (
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-4">
            <svg viewBox="40 0 120 200" className="w-full h-full">
                {parts.slice(0, mistakes).map(part => part)}
            </svg>
        </div>
    );
};

const Hangman = () => {
    const [gameState, setGameState] = useState('SETUP'); // SETUP, PLAYING, WON, LOST
    const [categoryKey, setCategoryKey] = useState("ANIMALS");
    const [word, setWord] = useState("");
    const [guessed, setGuessed] = useState(new Set());
    const [mistakes, setMistakes] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    const { isDark, toggleTheme } = useTheme();

    const startNewGame = () => {
        const words = CATEGORIES[categoryKey].words;
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setWord(randomWord);
        setGuessed(new Set());
        setMistakes(0);
        setGameState("PLAYING");
        soundManager.play('start');
    };

    const handleGuess = (letter) => {
        if (gameState !== 'PLAYING' || guessed.has(letter)) return;

        const newGuessed = new Set(guessed).add(letter);
        setGuessed(newGuessed);

        if (word.includes(letter)) {
            soundManager.play('correct');
            // Check win condition
            const isWon = word.split('').every(char => newGuessed.has(char));
            if (isWon) {
                setGameState('WON');
                soundManager.play('win');
                confetti({ particleCount: 200, spread: 100 });
            }
        } else {
            soundManager.play('wrong');
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            if (newMistakes >= MAX_MISTAKES) {
                setGameState('LOST');
                soundManager.play('gameover');
            }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-slate-900 to-indigo-950">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                {/* Snow effect maybe? */}
            </div>

            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-8 z-50 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setShowHelp(true)} variant="default" size="icon">
                        <CircleHelp size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={toggleTheme} variant="default" size="icon">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </GlossyButton>
                    <GlossyButton onClick={() => {
                        console.log('Settings clicked, setting game state to SETUP');
                        setGameState('SETUP');
                    }} variant="orange" size="icon">
                        <Settings size={20} />
                    </GlossyButton>
                </div>
            </header>

            {gameState === 'SETUP' ? (
                <div className="flex items-center justify-center h-full flex-1 w-full z-10">
                    <GlossyCard variant="default" className="w-full max-w-md p-8 text-center">
                        <RibbonHeader text="SNOWMAN" color="blue" />

                        <div className="space-y-6 mt-4">
                            <p className="text-slate-600 font-bold">Choose a Category:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(CATEGORIES).map(catKey => (
                                    <GlossyButton
                                        key={catKey}
                                        onClick={() => setCategoryKey(catKey)}
                                        variant={categoryKey === catKey ? CATEGORIES[catKey].color : "default"}
                                        className={categoryKey !== catKey ? "opacity-70" : ""}
                                    >
                                        {CATEGORIES[catKey].name}
                                    </GlossyButton>
                                ))}
                            </div>

                            <GlossyButton onClick={startNewGame} variant="green" size="xl" className="w-full mt-8">
                                START GAME
                            </GlossyButton>
                        </div>
                    </GlossyCard>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl flex-1 z-10">

                    {/* Left: Snowman Scene */}
                    <div className="flex-1 lg:flex-[0.4] flex flex-col gap-4">
                        <GlossyCard variant="blue" className="flex-1 min-h-[400px] relative flex flex-col items-center justify-center bg-gradient-to-b from-sky-900 to-indigo-900 border-4 border-white/20">
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                                    {CATEGORIES[categoryKey].name}
                                </span>
                            </div>

                            <Snowman mistakes={mistakes} />

                            {/* Life Bar */}
                            <div className="absolute bottom-6 left-0 w-full px-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase text-sky-200">Health</span>
                                    <span className="text-xs font-bold text-white">{MAX_MISTAKES - mistakes} / {MAX_MISTAKES}</span>
                                </div>
                                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                    <motion.div
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${((MAX_MISTAKES - mistakes) / MAX_MISTAKES) * 100}%` }}
                                        className={`h-full ${mistakes > MAX_MISTAKES - 3 ? 'bg-red-500' : 'bg-green-400'}`}
                                    />
                                </div>
                            </div>
                        </GlossyCard>
                    </div>

                    {/* Right: Game Controls */}
                    <div className="flex-1 lg:flex-[0.6] flex flex-col gap-6">

                        {/* Word Display */}
                        <GlossyCard variant="default" className="p-8 min-h-[160px] flex items-center justify-center">
                            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                                {word.split('').map((char, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`
                                            w-10 h-14 md:w-14 md:h-18 lg:w-16 lg:h-20 
                                            flex items-end justify-center 
                                            text-3xl md:text-5xl font-black pb-2 border-b-4 rounded-md transition-colors
                                            ${guessed.has(char) || gameState !== 'PLAYING'
                                                ? (gameState === 'LOST' && !guessed.has(char) ? "text-red-400 border-red-400 bg-red-50" : "text-indigo-600 border-indigo-600 bg-indigo-50")
                                                : "text-transparent border-slate-300 bg-slate-100"
                                            }
                                        `}
                                    >
                                        {guessed.has(char) || gameState !== 'PLAYING' ? char : ""}
                                    </motion.div>
                                ))}
                            </div>
                        </GlossyCard>

                        {/* Keyboard */}
                        <div className="grid grid-cols-7 gap-2 md:gap-3">
                            {KEYS.map(key => {
                                const isGuessed = guessed.has(key);
                                let variant = "default";
                                if (isGuessed) {
                                    if (word.includes(key)) variant = "green"; // Learned/Correct
                                    else variant = "red"; // Wrong
                                }

                                return (
                                    <GlossyButton
                                        key={key}
                                        onClick={() => handleGuess(key)} // The internal GlossyButton might need to handle disabled logic visibly
                                        disabled={isGuessed || gameState !== 'PLAYING'}
                                        variant={variant}
                                        className={`
                                            aspect-square p-0 flex items-center justify-center text-xl md:text-2xl font-bold
                                            ${isGuessed ? 'opacity-50' : 'hover:-translate-y-1'}
                                        `}
                                    >
                                        {key}
                                    </GlossyButton>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Win/Loss Modal */}
            <AnimatePresence>
                {(gameState === 'WON' || gameState === 'LOST') && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlossyCard variant={gameState === 'WON' ? "green" : "red"} className="border-4 border-white/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <RibbonHeader text={gameState === 'WON' ? "YOU WIN!" : "GAME OVER"} color={gameState === 'WON' ? "green" : "red"} />

                                <div className="p-8 text-center flex flex-col items-center gap-6">
                                    <div className="text-8xl filter drop-shadow-xl">
                                        {gameState === 'WON' ? '🎉' : '⛄'}
                                    </div>

                                    <div className="w-full bg-black/20 rounded-xl p-4">
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">The word was</p>
                                        <p className="text-4xl font-black text-white tracking-widest">{word}</p>
                                    </div>

                                    <GlossyButton onClick={startNewGame} variant="white" size="xl" className="w-full text-slate-800">
                                        Play Again
                                    </GlossyButton>
                                    <GlossyButton onClick={() => setGameState('SETUP')} variant="default" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-transparent">
                                        Change Category
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-sm"
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader text="HOW TO PLAY" color="blue" />
                                <div className="p-8 text-center space-y-4">
                                    <p className="text-[#8D6E63] font-bold">Guess the hidden word one letter at a time.</p>
                                    <p className="text-slate-500 text-sm">Don't let the Snowman get built!</p>
                                    <GlossyButton onClick={() => setShowHelp(false)} variant="blue" size="lg" className="w-full mt-4">
                                        GOT IT!
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

export default Hangman;
