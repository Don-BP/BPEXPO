
import os

target_file = r"d:\ALT_Classroom_Games\src\games\Hangman.jsx"

new_content = r"""import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';

const CATEGORIES = {
    ANIMALS: ["ELEPHANT", "GIRAFFE", "MONKEY", "PENGUIN", "KANGAROO", "DOLPHIN", "ZEBRA", "LION", "TIGER", "BEAR"],
    FRUITS: ["STRAWBERRY", "PINEAPPLE", "WATERMELON", "BLUEBERRY", "ORANGE", "BANANA", "GRAPES", "APPLE", "PEACH", "MANGO"],
    COLORS: ["PURPLE", "ORANGE", "YELLOW", "INDIGO", "VIOLET", "MAROON", "TURQUOISE", "MAGENTA", "SILVER", "GOLDEN"],
    SCHOOL: ["TEACHER", "STUDENT", "PENCIL", "ERASER", "NOTEBOOK", "CLASSROOM", "LIBRARY", "SCISSORS", "RULER", "CRAYON"]
};

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const MAX_MISTAKES = 7;

const Hangman = () => {
    const [category, setCategory] = useState("ANIMALS");
    const [word, setWord] = useState("");
    const [guessed, setGuessed] = useState(new Set());
    const [mistakes, setMistakes] = useState(0);
    const [status, setStatus] = useState("playing"); // playing, won, lost
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        startNewGame();
    }, [category]);

    const startNewGame = () => {
        const words = CATEGORIES[category];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setWord(randomWord);
        setGuessed(new Set());
        setMistakes(0);
        setStatus("playing");
        soundManager.play('start');
    };

    const handleGuess = (letter) => {
        if (status !== 'playing' || guessed.has(letter)) return;

        const newGuessed = new Set(guessed).add(letter);
        setGuessed(newGuessed);

        if (word.includes(letter)) {
            soundManager.play('correct');
            // Check win condition
            const isWon = word.split('').every(char => newGuessed.has(char));
            if (isWon) {
                setStatus('won');
                soundManager.play('win');
            }
        } else {
            soundManager.play('wrong');
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            if (newMistakes >= MAX_MISTAKES) {
                setStatus('lost');
                soundManager.play('gameover');
            }
        }
    };

    const Snowman = ({ mistakes }) => {
        // Simple snowman/snowman-like figure parts
        const parts = [
            // Base value 0 starts with empty scene
            <motion.circle key="base" cx="100" cy="160" r="40" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} />, // 1: Bottom Body
            <motion.circle key="mid" cx="100" cy="100" r="30" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} />,  // 2: Mid Body
            <motion.circle key="head" cx="100" cy="55" r="20" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} />,   // 3: Head
            <motion.g key="eyes">
                <circle cx="92" cy="50" r="2" fill="black" />
                <circle cx="108" cy="50" r="2" fill="black" />
            </motion.g>, // 4: Eyes
            <motion.path key="nose" d="M100 55 L110 58 L100 61 Z" fill="orange" initial={{ scale: 0 }} animate={{ scale: 1 }} />, // 5: Nose
            <motion.g key="arms">
                <line x1="70" y1="100" x2="40" y2="80" stroke="brown" strokeWidth="3" />
                <line x1="130" y1="100" x2="160" y2="80" stroke="brown" strokeWidth="3" />
            </motion.g>, // 6: Arms
            <motion.rect key="hat" x="80" y="20" width="40" height="15" fill="#333" initial={{ y: -50 }} animate={{ y: 20 }} /> // 7: Hat
        ];

        return (
            <div className="relative w-full h-full min-h-[300px] flex items-center justify-center"> 
                {/* SVG maintains aspect ratio but scales up */}
                <svg viewBox="0 0 200 200" className="w-full h-full max-h-[60vh] drop-shadow-2xl">
                    {parts.slice(0, mistakes).map(part => part)}
                </svg>
            </div>
        );
    };

    return (
        <div className="h-screen w-full relative overflow-hidden font-sans text-white flex flex-col items-center">
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-900/40 to-transparent rounded-full blur-3xl opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-900/40 to-transparent rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header */}
            <header className="flex-none w-full flex items-center justify-between px-6 py-4 z-20 bg-slate-900/30 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <ArrowLeft className="text-white" size={24} />
                    </Link>
                    <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        SNOWMAN
                    </h1>
                </div>
                <div className="flex gap-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-slate-800 border border-white/20 text-white rounded-xl px-6 py-2 font-bold text-lg outline-none cursor-pointer hover:bg-slate-700"
                    >
                        {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat} className="text-white bg-slate-800">{cat}</option>)}
                    </select>
                    <button onClick={() => setShowHelp(true)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <CircleHelp className="text-white" size={24} />
                    </button>
                    <button onClick={startNewGame} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <RefreshCw className="text-white" size={24} />
                    </button>
                </div>
            </header>

            {/* Main Game Area - Split Logic */}
            <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden relative z-10">

                {/* Left: Snowman Display */}
                <div className="flex-1 lg:flex-[0.4] bg-indigo-900/10 flex flex-col items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-white/5 relative">
                    <Snowman mistakes={mistakes} />
                    
                    {/* Mistakes Tracker - Absolute or bottom of Left Panel */}
                    <div className="absolute bottom-4 left-0 w-full flex flex-col items-center gap-2">
                         <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Mistakes</div>
                         <div className="flex gap-2">
                            {Array(MAX_MISTAKES).fill(0).map((_, i) => (
                                <Heart key={i} size={32} className={i < mistakes ? "text-slate-700" : "text-red-500 fill-red-500 drop-shadow-lg"} />
                            ))}
                         </div>
                    </div>
                </div>

                {/* Right: Word & Keyboard */}
                <div className="flex-1 lg:flex-[0.6] flex flex-col p-4 lg:p-12 items-center justify-center gap-8 bg-slate-900/20">

                    {/* Word Display - Huge */}
                    <div className="flex-1 flex items-center justify-center w-full">
                        <div className="flex flex-wrap justify-center gap-3 lg:gap-6">
                            {word.split('').map((char, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`w-12 h-16 sm:w-16 sm:h-20 lg:w-20 lg:h-24 flex items-end justify-center border-b-4 lg:border-b-8 text-4xl sm:text-5xl lg:text-7xl font-black pb-2 transition-all duration-300 ${guessed.has(char) || status !== 'playing'
                                        ? (status === 'lost' && !guessed.has(char) ? "text-red-400 border-red-400/50" : "text-white border-white")
                                        : "text-transparent border-white/20"
                                        }`}
                                >
                                    {guessed.has(char) || status !== 'playing' ? char : "_"}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Keyboard - Huge Grid */}
                    <div className="w-full max-w-5xl">
                        <div className="grid grid-cols-7 gap-2 sm:gap-4">
                            {KEYS.map(key => {
                                let stateStyle = "bg-white/5 text-white hover:bg-white/10 border-white/5";
                                if (guessed.has(key)) {
                                    if (word.includes(key)) stateStyle = "bg-green-500 text-white border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-95 opacity-50";
                                    else stateStyle = "bg-slate-800 text-slate-600 border-slate-700 opacity-30 scale-90";
                                }

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleGuess(key)}
                                        disabled={guessed.has(key) || status !== 'playing'}
                                        // Dynamic text size based on screen
                                        className={`
                                            aspect-square rounded-xl font-bold text-2xl sm:text-3xl lg:text-4xl border-2 transition-all active:scale-95 flex items-center justify-center
                                            ${stateStyle}
                                        `}
                                    >
                                        {key}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>

            {/* Win/Loss Modal */}
            <AnimatePresence>
                {status !== 'playing' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/20 rounded-[3rem] p-12 text-center max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-purple-500 to-indigo-500" />

                            <div className="text-9xl mb-8 filter drop-shadow-2xl animate-bounce">
                                {status === 'won' ? '🎉' : '🫠'}
                            </div>

                            <h2 className="text-6xl font-black mb-4 text-white tracking-tight">
                                {status === 'won' ? 'AWESOME!' : 'NICE TRY!'}
                            </h2>

                            <p className="text-slate-400 mb-8 font-medium text-xl">The word was:</p>

                            <div className="bg-white/5 rounded-3xl p-6 mb-12 border border-white/5 shadow-inner">
                                <span className="text-5xl lg:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                                    {word}
                                </span>
                            </div>

                            <button
                                onClick={startNewGame}
                                className="w-full py-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-black text-2xl hover:scale-105 active:scale-95 transition shadow-2xl"
                            >
                                PLAY AGAIN
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black mb-6 text-white text-center">HOW TO PLAY</h2>

                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Guess the hidden word one letter at a time!
                                <br /><br />
                                Avoid making too many mistakes, or the Snowman will be built and you'll lose!
                            </p>

                            <button onClick={() => setShowHelp(false)} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/10 transition">
                                GOT IT!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Hangman;
"""

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"SUCCESS: Updated {target_file} with refined layout.")
