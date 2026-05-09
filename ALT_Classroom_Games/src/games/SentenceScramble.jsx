import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Check, Undo, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';
import confetti from 'canvas-confetti';

const LEVELS = {
    EASY: {
        name: "Easy",
        color: "green",
        sentences: [
            "I like pizza",
            "It is sunny",
            "She is happy",
            "He runs fast",
            "They are friends"
        ]
    },
    MEDIUM: {
        name: "Medium",
        color: "blue",
        sentences: [
            "I went to the park yesterday",
            "Do you want to play soccer",
            "My favorite color is blue",
            "She is eating a delicious apple",
            "The cat is sleeping on the bed"
        ]
    },
    HARD: {
        name: "Hard",
        color: "red",
        sentences: [
            "I have been studying English for five years",
            "If it rains tomorrow we cannot go hiking",
            "He asked me where the library was located",
            "She is the most intelligent person I know",
            "Please turn off the lights when you leave"
        ]
    }
};

const SentenceScramble = () => {
    const [levelKey, setLevelKey] = useState("EASY");
    const [targetSentence, setTargetSentence] = useState("");
    const [scrambledWords, setScrambledWords] = useState([]);
    const [userSentence, setUserSentence] = useState([]);
    const [status, setStatus] = useState('playing'); // playing, correct, wrong
    const [showHelp, setShowHelp] = useState(false);
    const [completedSentences, setCompletedSentences] = useState([]);

    // Reset history on level change
    useEffect(() => {
        setCompletedSentences([]);
        initGame(true);
    }, [levelKey]);

    const initGame = (forceReset = false) => {
        const levelData = LEVELS[levelKey];
        const allSentences = levelData.sentences;
        let history = forceReset ? [] : completedSentences;

        if (forceReset) {
            setCompletedSentences([]);
        }

        let available = allSentences.filter(s => !history.includes(s));

        if (available.length === 0) {
            available = allSentences;
            setCompletedSentences([]);
            history = [];
        }

        const sentence = available[Math.floor(Math.random() * available.length)];
        setTargetSentence(sentence);

        const words = sentence.split(" ").map((w, i) => ({ id: `${i}-${Date.now()}`, text: w }));
        const shuffled = [...words].sort(() => Math.random() - 0.5);

        setScrambledWords(shuffled);
        setUserSentence([]);
        setStatus('playing');
        soundManager.play('start');
    };

    const handleWordClick = (word, fromBank) => {
        if (status === 'correct') return;
        soundManager.play('pop');

        if (fromBank) {
            setScrambledWords(prev => prev.filter(w => w.id !== word.id));
            setUserSentence(prev => [...prev, word]);
        } else {
            setUserSentence(prev => prev.filter(w => w.id !== word.id));
            setScrambledWords(prev => [...prev, word]);
        }
    };

    const checkAnswer = () => {
        const currentString = userSentence.map(w => w.text).join(" ");
        if (currentString === targetSentence) {
            setStatus('correct');
            soundManager.play('win');
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
            setCompletedSentences(prev => [...prev, targetSentence]);
        } else {
            setStatus('wrong');
            soundManager.play('wrong');
            setTimeout(() => setStatus('playing'), 1000);
        }
    };

    const resetCurrent = () => {
        if (status === 'correct') return;
        soundManager.play('switch');
        setScrambledWords([...scrambledWords, ...userSentence].sort(() => Math.random() - 0.5));
        setUserSentence([]);
        setStatus('playing');
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/40 via-slate-900 to-black">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(251,146,60,0.1)_0%,transparent_60%)]" />
            </div>

            {/* Header */}
            <header className="w-full max-w-5xl flex items-center justify-between mb-8 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <GlossyCard variant="default" className="px-6 py-2 flex items-center gap-4">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Sentences</span>
                    <span className="text-2xl font-black text-orange-400">{completedSentences.length} / {LEVELS[levelKey].sentences.length}</span>
                </GlossyCard>

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setShowHelp(true)} variant="default" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <CircleHelp size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={() => initGame(true)} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw size={20} />
                    </GlossyButton>
                </div>
            </header>

            <div className="flex flex-col gap-6 w-full max-w-5xl flex-1 z-10 pb-8">

                {/* Level Selection */}
                <div className="flex justify-center gap-2 mb-4">
                    {Object.keys(LEVELS).map(lvl => (
                        <GlossyButton
                            key={lvl}
                            onClick={() => setLevelKey(lvl)}
                            variant={levelKey === lvl ? LEVELS[lvl].color : "default"}
                            size="sm"
                            className={levelKey !== lvl ? "opacity-60 scale-95" : ""}
                        >
                            {LEVELS[lvl].name}
                        </GlossyButton>
                    ))}
                </div>

                {/* Answer Area */}
                <GlossyCard variant="default" className={`min-h-[200px] flex items-center justify-center relative transition-all duration-300 ${status === 'correct' ? 'border-green-400 bg-green-500/10' : status === 'wrong' ? 'border-red-400 bg-red-500/10 animate-shake' : ''}`}>
                    <RibbonHeader text="BUILD YOUR SENTENCE" color="orange" icon={<BookOpen className="w-5 h-5" />} />

                    <div className="flex flex-wrap items-center justify-center gap-3 p-8 w-full mt-6">
                        {userSentence.length === 0 && (
                            <span className="text-slate-500/50 font-black text-4xl uppercase tracking-widest select-none">
                                TAP WORDS
                            </span>
                        )}
                        <AnimatePresence>
                            {userSentence.map((word) => (
                                <motion.div
                                    key={word.id}
                                    layoutId={word.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <GlossyButton
                                        onClick={() => handleWordClick(word, false)}
                                        disabled={status === 'correct'}
                                        variant="orange"
                                        className="text-xl md:text-2xl px-6 py-3"
                                    >
                                        {word.text}
                                    </GlossyButton>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Feedback Badge */}
                    <AnimatePresence>
                        {status === 'correct' && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                                className="absolute -bottom-6 z-10"
                            >
                                <div className="bg-green-500 text-white px-8 py-2 rounded-full font-black text-xl shadow-lg border-4 border-white flex items-center gap-2">
                                    <Check size={28} strokeWidth={4} /> PERFECT!
                                </div>
                            </motion.div>
                        )}
                        {status === 'wrong' && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                                className="absolute -bottom-6 z-10"
                            >
                                <div className="bg-red-500 text-white px-8 py-2 rounded-full font-black text-xl shadow-lg border-4 border-white flex items-center gap-2">
                                    TRY AGAIN!
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlossyCard>

                {/* Controls & Word Bank */}
                <div className="flex flex-col md:flex-row gap-4 h-full">

                    {/* Word Bank */}
                    <div className="flex-1 bg-slate-900/40 rounded-3xl p-6 border border-white/10 flex flex-wrap content-start items-start justify-center gap-3 min-h-[150px]">
                        <AnimatePresence>
                            {scrambledWords.map((word) => (
                                <motion.div
                                    key={word.id}
                                    layoutId={word.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <GlossyButton
                                        onClick={() => handleWordClick(word, true)}
                                        variant="default"
                                        className="text-xl md:text-2xl px-6 py-3 bg-slate-800 text-slate-300 hover:text-white border-slate-600"
                                    >
                                        {word.text}
                                    </GlossyButton>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row md:flex-col gap-3 justify-center">
                        {status === 'correct' ? (
                            <GlossyButton onClick={() => initGame(false)} variant="green" size="xl" className="h-full flex-1 md:w-48 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse">
                                NEXT <ArrowRight size={24} className="ml-2" />
                            </GlossyButton>
                        ) : (
                            <>
                                <GlossyButton onClick={resetCurrent} variant="default" className="flex-1 md:flex-initial h-16 md:w-32 bg-slate-700">
                                    <Undo size={24} />
                                </GlossyButton>

                                <GlossyButton
                                    onClick={checkAnswer}
                                    disabled={scrambledWords.length > 0}
                                    variant={scrambledWords.length === 0 ? "orange" : "default"}
                                    className={`flex-[2] md:flex-initial h-16 md:w-32 text-xl ${scrambledWords.length > 0 ? 'opacity-50' : ''}`}
                                >
                                    CHECK
                                </GlossyButton>
                            </>
                        )}
                    </div>
                </div>

            </div>

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
                                    <p className="text-[#8D6E63] font-bold">Unscramble the words to make a correct sentence.</p>
                                    <p className="text-slate-500 text-sm">Tap words to move them between the bank and your answer.</p>
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

export default SentenceScramble;
