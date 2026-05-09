import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Volume2, Play, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const DEFAULT_SETS = {
    'animals': {
        name: 'Animals', // Shortened for tabs
        full_name: 'Animals & Food',
        icon: '🦁',
        items: [
            { word: 'apple', emoji: '🍎' }, { word: 'book', emoji: '📚' },
            { word: 'cat', emoji: '🐱' }, { word: 'dog', emoji: '🐶' },
            { word: 'elephant', emoji: '🐘' }, { word: 'fish', emoji: '🐟' },
            { word: 'guitar', emoji: '🎸' }, { word: 'house', emoji: '🏠' },
            { word: 'ice cream', emoji: '🍦' }, { word: 'juice', emoji: '🧃' },
            { word: 'kite', emoji: '🪁' }, { word: 'lemon', emoji: '🍋' }
        ]
    },
    'colors': {
        name: 'Colors',
        full_name: 'Colors & Shapes',
        icon: '🎨',
        items: [
            { word: 'red', emoji: '🟥' }, { word: 'blue', emoji: '🟦' },
            { word: 'green', emoji: '🟩' }, { word: 'yellow', emoji: '🟨' },
            { word: 'orange', emoji: '🟧' }, { word: 'purple', emoji: '🟪' },
            { word: 'circle', emoji: '⭕' }, { word: 'square', emoji: '🔲' },
            { word: 'triangle', emoji: '🔺' }, { word: 'star', emoji: '⭐' }
        ]
    },
    'school': {
        name: 'School',
        full_name: 'School Supplies',
        icon: '🎒',
        items: [
            { word: 'pencil', emoji: '✏️' }, { word: 'eraser', emoji: '🧼' },
            { word: 'ruler', emoji: '📏' }, { word: 'pen', emoji: '🖊️' },
            { word: 'notebook', emoji: '📓' }, { word: 'bag', emoji: '🎒' },
            { word: 'desk', emoji: '🪑' }, { word: 'scissors', emoji: '✂️' },
            { word: 'clock', emoji: '⏰' }, { word: 'computer', emoji: '💻' }
        ]
    }
};

const DEFAULT_TEAMS = [
    { id: 0, name: "Team 1", score: 0, variant: 'blue' },
    { id: 1, name: "Team 2", score: 0, variant: 'red' }
];

const Karuta = () => {
    // State
    const [currentSet, setCurrentSet] = useState(DEFAULT_SETS['animals']);
    const [usedWords, setUsedWords] = useState([]);
    const [currentWord, setCurrentWord] = useState(null); // The word currently being hunted
    const [teams, setTeams] = useState(DEFAULT_TEAMS);
    const [modalOpen, setModalOpen] = useState(false);
    const [shakeCard, setShakeCard] = useState(null); // id of card to shake

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        setUsedWords([]);
        setCurrentWord(null);
        setTeams(DEFAULT_TEAMS.map(t => ({ ...t, score: 0 })));
        setModalOpen(false);
        soundManager.play('start');
    };

    const playNextWord = () => {
        const available = currentSet.items.filter(item => !usedWords.includes(item.word));
        if (available.length === 0) {
            alert("Game Over!");
            return;
        }

        const randomItem = available[Math.floor(Math.random() * available.length)];
        setCurrentWord(randomItem.word);
        speak(randomItem.word);
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    const handleCardClick = (item) => {
        if (!currentWord) return;
        if (usedWords.includes(item.word)) return;

        if (item.word === currentWord) {
            soundManager.play('correct');
            setModalOpen(true);
        } else {
            soundManager.play('wrong');
            setShakeCard(item.word);
            setTimeout(() => setShakeCard(null), 500);
        }
    };

    const awardPoint = (teamIndex) => {
        if (teamIndex !== -1) {
            setTeams(prev => prev.map((t, i) => i === teamIndex ? { ...t, score: t.score + 1 } : t));
        }

        // Mark as used
        setUsedWords(prev => [...prev, currentWord]);
        setCurrentWord(null);
        setModalOpen(false);
    };

    const changeSet = (key) => {
        setCurrentSet(DEFAULT_SETS[key]);
        setUsedWords([]);
        setCurrentWord(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center pt-8 p-4 font-sans relative overflow-x-hidden">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,100,0,0.1)_0%,transparent_70%)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,200,0,0.1)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-8 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                {/* Set Selector */}
                <GlossyCard variant="default" className="px-2 py-2 flex items-center gap-2">
                    {Object.keys(DEFAULT_SETS).map(key => (
                        <button
                            key={key}
                            onClick={() => changeSet(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentSet === DEFAULT_SETS[key] ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <span className="flex items-center gap-2">
                                <span>{DEFAULT_SETS[key].icon}</span> <span className="hidden sm:inline">{DEFAULT_SETS[key].name}</span>
                            </span>
                        </button>
                    ))}
                </GlossyCard>

                <GlossyButton onClick={initGame} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                    <RefreshCw size={20} />
                </GlossyButton>
            </header>

            {/* Scores */}
            <div className="flex gap-4 md:gap-12 mb-6 w-full max-w-4xl justify-center z-10">
                {teams.map((team, i) => (
                    <GlossyCard key={i} variant={team.variant} className="min-w-[140px]">
                        <div className="flex flex-col items-center py-2 px-6">
                            <span className="text-xs font-bold uppercase tracking-widest mb-1 text-white/70">{team.name}</span>
                            <div className="text-5xl font-black text-white drop-shadow-md">
                                {team.score}
                            </div>
                        </div>
                    </GlossyCard>
                ))}
            </div>

            {/* Control Bar (Floating) */}
            <motion.div
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="sticky top-4 z-20 mb-8"
            >
                <GlossyCard variant="default" className="flex items-center gap-6 px-4 py-2 pr-8 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                    <GlossyButton
                        onClick={currentWord ? () => speak(currentWord) : playNextWord}
                        variant={currentWord ? "orange" : "green"}
                        size="xl"
                        className="w-16 h-16 rounded-full flex items-center justify-center p-0"
                    >
                        {currentWord ? <Volume2 size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </GlossyButton>

                    <div className="min-w-[200px] text-center">
                        {currentWord ? (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl font-black text-[#5D4037] uppercase tracking-widest drop-shadow-sm"
                            >
                                {currentWord}
                            </motion.span>
                        ) : (
                            <span className="text-xl font-bold text-slate-400 uppercase tracking-wider">Tap Play to Start</span>
                        )}
                    </div>
                </GlossyCard>
            </motion.div>

            {/* Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-full pb-24 px-8 z-10">
                <AnimatePresence>
                    {currentSet.items.map((item, i) => {
                        const isUsed = usedWords.includes(item.word);
                        const isShaking = shakeCard === item.word;

                        return (
                            <motion.div
                                key={item.word}
                                layout
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                whileHover={!isUsed ? { scale: 1.05, y: -5 } : {}}
                                whileTap={!isUsed ? { scale: 0.95 } : {}}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                onClick={() => handleCardClick(item)}
                                className={`
                                    relative cursor-pointer
                                `}
                                style={{
                                    aspectRatio: '1/1',
                                    width: '100%',
                                    ...(isShaking ? { x: [-5, 5, -5, 5, 0] } : {})
                                }}
                            >
                                <GlossyCard
                                    variant="default"
                                    className={`
                                        w-full h-full
                                        ${isUsed ? 'opacity-50 grayscale' : ''}
                                        ${isShaking ? 'ring-4 ring-red-500' : ''}
                                    `}
                                    contentClassName="flex flex-col items-center justify-between p-2 pb-8 pt-6"
                                >
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-6xl sm:text-8xl transform group-hover:scale-110 transition duration-300 drop-shadow-md select-none">{item.emoji}</div>
                                    </div>
                                    <div className={`text-sm sm:text-xl font-black uppercase tracking-widest ${isUsed ? 'text-slate-400' : 'text-[#8D6E63]'} select-none leading-none w-full text-center truncate px-1`}>{item.word}</div>

                                    {/* Checkmark overlay */}
                                    {isUsed && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-3xl">
                                            <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                                                <Check size={24} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </GlossyCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Winner Selection Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlossyCard variant="default">
                                <RibbonHeader text="WHO WAS FASTEST?" color="orange" />

                                <div className="p-8 text-center">
                                    <div className="mb-6 text-6xl animate-pulse">⚡</div>
                                    <p className="text-[#8D6E63] mb-8 font-bold text-lg">Select the team that tapped the card first!</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {teams.map((team, i) => (
                                            <GlossyButton
                                                key={i}
                                                onClick={() => awardPoint(i)}
                                                variant={team.variant}
                                                size="xl"
                                                className="py-8 text-2xl"
                                            >
                                                {team.name}
                                            </GlossyButton>
                                        ))}
                                    </div>
                                    <GlossyButton onClick={() => awardPoint(-1)} variant="default" size="sm" className="w-full text-slate-400">
                                        NOBODY / SKIP
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

export default Karuta;
