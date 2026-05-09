import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Play, Settings, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const CATEGORIES = {
    FRUIT: {
        name: 'Fruit',
        icon: "🍎",
        items: ["Apple", "Banana", "Grape", "Melon", "Peach", "Lemon", "Kiwi", "Orange"],
        variant: "red"
    },
    ANIMAL: {
        name: 'Animal',
        icon: "🦁",
        items: ["Bear", "Cat", "Dog", "Lion", "Tiger", "Bird", "Pig", "Rabbit", "Panda"],
        variant: "orange"
    },
    COLOR: {
        name: 'Color',
        icon: "🎨",
        items: ["Red", "Blue", "Green", "Pink", "Black", "White", "Yellow", "Purple"],
        variant: "pink"
    },
    VERB: {
        name: 'Verb',
        icon: "🏃",
        items: ["Run", "Eat", "Sleep", "Play", "Swim", "Jump", "Walk", "Read", "Cook"],
        variant: "blue"
    }
};

const ALL_WORDS = Object.values(CATEGORIES).flatMap(c => c.items.map(w => ({ text: w, type: c.name.toUpperCase() })));

const SPEED_SETTINGS = {
    1: { spawn: 1500, up: 2000, label: "Slow" },
    2: { spawn: 1000, up: 1200, label: "Normal" },
    3: { spawn: 700, up: 800, label: "Fast" }
};

const VocabularyPop = () => {
    const [gameState, setGameState] = useState('SETUP');
    const [targetCatKey, setTargetCatKey] = useState('FRUIT');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [grid, setGrid] = useState(Array(9).fill(null)); // slots for moles
    const [speedLevel, setSpeedLevel] = useState(2);

    const timerRef = useRef(null);
    const spawnerRef = useRef(null);
    const gameActiveRef = useRef(false);

    useEffect(() => {
        return () => stopGame();
    }, []);

    const startGame = () => {
        setScore(0);
        setTimeLeft(60);
        setGrid(Array(9).fill(null));
        setGameState('PLAYING');
        gameActiveRef.current = true;
        soundManager.play('start');

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        spawnMole();
    };

    const stopGame = () => {
        gameActiveRef.current = false;
        clearInterval(timerRef.current);
        if (spawnerRef.current) clearTimeout(spawnerRef.current);
    };

    const endGame = () => {
        stopGame();
        setGameState('FINISHED');
        soundManager.play('win');
    };

    const spawnMole = () => {
        if (!gameActiveRef.current) return;

        setGrid(prevGrid => {
            const emptyIndices = prevGrid.map((m, i) => m === null ? i : -1).filter(i => i !== -1);
            if (emptyIndices.length === 0) return prevGrid;

            const pickIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            const isTarget = Math.random() > 0.5;
            let item;

            if (isTarget) {
                const cat = CATEGORIES[targetCatKey];
                const word = cat.items[Math.floor(Math.random() * cat.items.length)];
                item = { text: word, type: targetCatKey, status: 'up' };
            } else {
                const distractors = ALL_WORDS.filter(w => !CATEGORIES[targetCatKey].items.includes(w.text));
                const wordObj = distractors[Math.floor(Math.random() * distractors.length)];
                item = { text: wordObj.text, type: 'DISTRACTOR', status: 'up' };
            }

            const newGrid = [...prevGrid];
            newGrid[pickIndex] = { ...item, id: Date.now() };

            setTimeout(() => {
                setGrid(g => {
                    // Start Exit Animation (Change status to 'leaving')
                    if (g[pickIndex] && g[pickIndex].id === newGrid[pickIndex].id && g[pickIndex].status === 'up') {
                        const nextG = [...g];
                        nextG[pickIndex] = { ...g[pickIndex], status: 'leaving' };
                        return nextG;
                    }
                    return g;
                });

                // Remove after animation
                setTimeout(() => {
                    setGrid(g => {
                        if (g[pickIndex] && g[pickIndex].id === newGrid[pickIndex].id && g[pickIndex].status === 'leaving') {
                            const nextG = [...g];
                            nextG[pickIndex] = null;
                            return nextG;
                        }
                        return g;
                    });
                }, 600);

            }, SPEED_SETTINGS[speedLevel].up);

            return newGrid;
        });

        const nextSpawnTime = SPEED_SETTINGS[speedLevel].spawn * (0.8 + Math.random() * 0.4);
        spawnerRef.current = setTimeout(spawnMole, nextSpawnTime);
    };

    const handleMoleClick = (index) => {
        if (gameState !== 'PLAYING') return;

        setGrid(prev => {
            const mole = prev[index];
            if (!mole || (mole.status !== 'up' && mole.status !== 'leaving')) return prev;

            const isCorrect = mole.type === targetCatKey;

            if (isCorrect) {
                soundManager.play('correct');
                setScore(s => s + 10);
            } else {
                soundManager.play('wrong');
                setScore(s => Math.max(0, s - 5));
            }

            const newGrid = [...prev];
            newGrid[index] = { ...mole, status: isCorrect ? 'hit' : 'miss' };

            setTimeout(() => {
                setGrid(g => {
                    if (g[index] && g[index].id === mole.id) {
                        const nextG = [...g];
                        nextG[index] = null;
                        return nextG;
                    }
                    return g;
                });
            }, 300);

            return newGrid;
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(30,150,50,0.15)_0%,transparent_70%)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(50,200,100,0.1)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <div className="flex gap-4">
                    <GlossyCard variant="default" className="flex items-center gap-3 px-4 py-1">
                        <Trophy size={18} className="text-yellow-400" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                            <span className="text-2xl font-black text-amber-400 drop-shadow-sm">{score}</span>
                        </div>
                    </GlossyCard>

                    <GlossyCard variant="default" className="flex items-center gap-3 px-4 py-1">
                        <Clock size={18} className={`${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</span>
                            <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </GlossyCard>
                </div>

                <GlossyButton onClick={() => setGameState('SETUP')} variant="orange" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                    <Settings to="/" size={20} />
                </GlossyButton>
            </header>

            {/* Target Indicator */}
            <AnimatePresence>
                {gameState === 'PLAYING' && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        className="mb-6 z-10"
                    >
                        <GlossyCard variant={CATEGORIES[targetCatKey].variant} className="px-8 py-2 flex items-center gap-4">
                            <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Target:</span>
                            <span className="text-4xl drop-shadow-md">{CATEGORIES[targetCatKey].icon}</span>
                            <span className="text-3xl font-black uppercase tracking-wider text-white drop-shadow-sm">
                                {CATEGORIES[targetCatKey].name}
                            </span>
                        </GlossyCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game Grid */}
            <div className={`
                grid grid-cols-3 gap-4 md:gap-6 w-full max-w-[80vh] aspect-square mb-8 z-10 transition-all duration-500
                ${gameState === 'SETUP' ? 'opacity-20 blur-sm scale-95 pointer-events-none' : 'opacity-100 scale-100'}
            `}>
                {grid.map((mole, i) => (
                    <div
                        key={i}
                        className="relative bg-slate-900/40 rounded-full border-4 border-slate-700/30 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center aspect-square overflow-hidden"
                    >
                        {/* Empty Hole Depth */}
                        <div className="absolute inset-0 bg-black/40 rounded-full transform scale-90 translate-y-4 blur-md" />

                        {/* Mole */}
                        <AnimatePresence>
                            {mole && (
                                <motion.div
                                    key={mole.id}
                                    initial={{ y: "120%", scale: 0.8 }}
                                    animate={
                                        mole.status === 'up' || mole.status === 'hit' || mole.status === 'miss'
                                            ? { y: "10%", scale: 1 }
                                            : { y: "120%", scale: 1 } // leaving
                                    }
                                    exit={{ y: "120%", scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => handleMoleClick(i)}
                                    className="absolute w-[80%] h-[80%] z-10"
                                >
                                    <GlossyCard
                                        variant={mole.status === 'hit' ? "green" : mole.status === 'miss' ? "red" : "default"}
                                        className={`w-full h-full rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center p-2
                                            ${mole.status !== 'hit' && mole.status !== 'miss' ? 'hover:-translate-y-2' : ''} transition-transform
                                        `}
                                    >
                                        <span className={`text-slate-900 font-black text-xl md:text-3xl leading-none select-none pointer-events-none 
                                            ${mole.status === 'hit' || mole.status === 'miss' ? 'text-white' : 'text-[#5D4037]'}
                                        `}>
                                            {mole.text}
                                        </span>

                                        {mole.status === 'up' && (
                                            <div className="absolute -bottom-2 opacity-50 text-4xl select-none pointer-events-none">👀</div>
                                        )}

                                        {/* Feedback Overlay */}
                                        {(mole.status === 'hit' || mole.status === 'miss') && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1.5 }}
                                                className="absolute inset-0 flex items-center justify-center font-black text-5xl drop-shadow-lg z-20"
                                            >
                                                {mole.status === 'hit' ? '👍' : '👎'}
                                            </motion.div>
                                        )}
                                    </GlossyCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Setup Modal */}
            <AnimatePresence>
                {gameState === 'SETUP' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlossyCard variant="default" className="text-center overflow-hidden">
                                <RibbonHeader text="VOCAB POP!" color="green" />

                                <div className="p-8 space-y-8">
                                    <p className="text-[#8D6E63] font-bold text-lg">Smash the correct words before time runs out!</p>

                                    {/* Categories */}
                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Target Category</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.keys(CATEGORIES).map(key => (
                                                <GlossyButton
                                                    key={key}
                                                    onClick={() => setTargetCatKey(key)}
                                                    variant={targetCatKey === key ? CATEGORIES[key].variant : "default"}
                                                    className={`flex flex-col items-center justify-center gap-1 py-4 h-auto ${targetCatKey !== key ? "opacity-70" : ""}`}
                                                >
                                                    <span className="text-3xl filter drop-shadow-sm">{CATEGORIES[key].icon}</span>
                                                    <span className="uppercase tracking-wider text-sm">{CATEGORIES[key].name}</span>
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Speed */}
                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Game Speed</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(lvl => (
                                                <GlossyButton
                                                    key={lvl}
                                                    onClick={() => setSpeedLevel(lvl)}
                                                    variant={speedLevel === lvl ? "blue" : "default"}
                                                    className="flex-1"
                                                >
                                                    {SPEED_SETTINGS[lvl].label}
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>

                                    <GlossyButton onClick={startGame} variant="green" size="xl" icon={<Play fill="currentColor" />}>
                                        PLAY NOW
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Modal */}
            <AnimatePresence>
                {gameState === 'FINISHED' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlossyCard variant="orange" className="border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                                <RibbonHeader text="TIME'S UP!" color="red" />
                                <div className="p-8 pb-12 text-center flex flex-col items-center">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                        className="inline-block p-4 bg-yellow-400 rounded-full mb-6 shadow-lg border-2 border-white/20"
                                    >
                                        <Trophy size={64} className="text-white drop-shadow-md" />
                                    </motion.div>

                                    <div className="bg-black/10 rounded-2xl p-6 mb-8 w-full border border-black/5">
                                        <span className="block text-yellow-900/60 text-xs font-bold uppercase tracking-widest mb-1">Final Score</span>
                                        <span className="text-7xl font-black text-white drop-shadow-md">
                                            {score}
                                        </span>
                                    </div>

                                    <GlossyButton onClick={() => setGameState('SETUP')} variant="white" size="xl" className="w-full text-orange-600">
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

export default VocabularyPop;
