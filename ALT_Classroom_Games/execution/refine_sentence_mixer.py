
import os

target_file = r"d:\ALT_Classroom_Games\src\games\SentenceScramble.jsx"

new_content = r"""import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Check, Undo, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';

const LEVELS = {
    EASY: [
        "I like pizza",
        "It is sunny",
        "She is happy",
        "He runs fast",
        "They are friends"
    ],
    MEDIUM: [
        "I went to the park yesterday",
        "Do you want to play soccer",
        "My favorite color is blue",
        "She is eating a delicious apple",
        "The cat is sleeping on the bed"
    ],
    HARD: [
        "I have been studying English for five years",
        "If it rains tomorrow we cannot go hiking",
        "He asked me where the library was located",
        "She is the most intelligent person I know",
        "Please turn off the lights when you leave"
    ]
};

const SentenceScramble = () => {
    const [level, setLevel] = useState("EASY");
    const [targetSentence, setTargetSentence] = useState("");
    const [scrambledWords, setScrambledWords] = useState([]);
    const [userSentence, setUserSentence] = useState([]);
    const [status, setStatus] = useState('playing'); // playing, correct, wrong
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        initGame();
    }, [level]);

    const initGame = () => {
        const sentences = LEVELS[level];
        // Ensure we pick new sentences if possible, or just random
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        setTargetSentence(sentence);

        // Scramble
        const words = sentence.split(" ").map((w, i) => ({ id: i, text: w }));
        const shuffled = [...words].sort(() => Math.random() - 0.5);

        setScrambledWords(shuffled);
        setUserSentence([]);
        setStatus('playing');
        soundManager.play('start');
    };

    const handleWordClick = (word, fromBank) => {
        if (status === 'correct') return;

        soundManager.play('click');

        if (fromBank) {
            // Move from bank to user sentence
            setScrambledWords(prev => prev.filter(w => w.id !== word.id));
            setUserSentence(prev => [...prev, word]);
        } else {
            // Move from user sentence back to bank
            setUserSentence(prev => prev.filter(w => w.id !== word.id));
            setScrambledWords(prev => [...prev, word]);
        }
    };

    const checkAnswer = () => {
        const currentString = userSentence.map(w => w.text).join(" ");
        if (currentString === targetSentence) {
            setStatus('correct');
            soundManager.play('win');
        } else {
            setStatus('wrong');
            soundManager.play('wrong');
            setTimeout(() => setStatus('playing'), 1000);
        }
    };

    const resetCurrent = () => {
        if (status === 'correct') return; 
        // Return all words to bank
        setScrambledWords([...scrambledWords, ...userSentence].sort(() => Math.random() - 0.5));
        setUserSentence([]);
        setStatus('playing');
        soundManager.play('switch');
    };

    return (
        <div className="h-screen w-full relative overflow-hidden font-sans text-white flex flex-col items-center">
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-900/30 to-transparent rounded-full blur-3xl opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-900/30 to-transparent rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header */}
            <header className="flex-none w-full flex items-center justify-between px-6 py-4 z-20 bg-slate-900/30 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <ArrowLeft className="text-white" size={24} />
                    </Link>
                    <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                        SENTENCE MIXER
                    </h1>
                </div>

                <div className="flex gap-4">
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="bg-slate-800 border border-white/20 text-white rounded-xl px-6 py-2 font-bold text-lg outline-none cursor-pointer hover:bg-slate-700"
                    >
                        {Object.keys(LEVELS).map(lvl => <option key={lvl} value={lvl} className="text-white bg-slate-800">{lvl}</option>)}
                    </select>
                    <button onClick={() => setShowHelp(true)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <CircleHelp className="text-white" size={24} />
                    </button>
                    <button onClick={initGame} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <RefreshCw className="text-white" size={24} />
                    </button>
                </div>
            </header>

            {/* Main Game Area - Split Vertically */}
            <div className="flex-1 w-full flex flex-col overflow-hidden relative z-10 p-4 md:p-8 gap-4 md:gap-8">

                {/* Top Half: Answer Area */}
                <div className="flex-[0.4] w-full flex flex-col items-center justify-center relative">
                    <div className={`w-full h-full bg-white/5 backdrop-blur-xl rounded-[2rem] border-2 flex flex-wrap items-center justify-center p-8 gap-4 shadow-inner transition-colors duration-500 ${
                        status === 'correct' ? 'border-green-500/50 bg-green-500/10' : 
                        status === 'wrong' ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'
                    }`}>
                        
                        {userSentence.length === 0 && (
                            <div className="absolute text-white/20 font-black text-3xl md:text-5xl pointer-events-none uppercase tracking-widest text-center">
                                Tap Words Below
                            </div>
                        )}
                        
                        <AnimatePresence>
                            {userSentence.map((word) => (
                                <motion.button
                                    key={word.id}
                                    layoutId={word.id}
                                    onClick={() => handleWordClick(word, false)}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    disabled={status === 'correct'}
                                    className="px-6 py-4 md:px-8 md:py-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-2xl md:text-4xl shadow-[0_4px_0_rgb(180,83,9)] hover:translate-y-1 hover:shadow-none active:translate-y-2 transition-all text-white border-2 border-white/20"
                                >
                                    {word.text}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Status Feedback */}
                    <AnimatePresence>
                        {status === 'correct' && (
                             <motion.div 
                                initial={{ y: 50, opacity: 0 }} 
                                animate={{ y: 0, opacity: 1 }} 
                                exit={{ y: 50, opacity: 0 }}
                                className="absolute -bottom-6 bg-green-500 text-white px-8 py-2 rounded-full font-black text-xl shadow-lg border-2 border-white/20 flex items-center gap-2"
                             >
                                <Check size={24} /> PERFECT!
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Half: Word Bank & Controls */}
                <div className="flex-[0.6] w-full flex flex-col gap-6 md:gap-10">
                    
                    {/* Word Bank */}
                    <div className="flex-1 w-full bg-slate-900/40 rounded-[2rem] p-6 md:p-10 flex content-center justify-center flex-wrap gap-4 md:gap-6 overflow-y-auto border border-white/5">
                        <AnimatePresence>
                            {scrambledWords.map((word) => (
                                <motion.button
                                    key={word.id}
                                    layoutId={word.id}
                                    onClick={() => handleWordClick(word, true)}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="px-6 py-4 md:px-8 md:py-6 rounded-2xl bg-slate-800 border-2 border-slate-600 font-bold text-2xl md:text-4xl text-slate-300 shadow-[0_4px_0_rgb(51,65,85)] hover:bg-slate-700 hover:text-white hover:translate-y-1 hover:shadow-none active:translate-y-2 transition-all"
                                >
                                    {word.text}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Action Bar */}
                    <div className="flex-none h-24 flex items-center justify-center gap-6">
                        {status === 'correct' ? (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                onClick={initGame}
                                className="w-full max-w-sm h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl font-black text-3xl text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] border-4 border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                                NEXT ROUND <ArrowRight size={32} />
                            </motion.button>
                        ) : (
                            <>
                                <button
                                    onClick={resetCurrent}
                                    className="h-full aspect-square bg-slate-800 text-slate-400 rounded-3xl border-2 border-slate-700 hover:bg-slate-700 hover:text-white transition flex items-center justify-center"
                                >
                                    <Undo size={32} />
                                </button>
                                <button
                                    onClick={checkAnswer}
                                    disabled={scrambledWords.length > 0}
                                    className={`
                                        flex-1 max-w-sm h-full rounded-3xl font-black text-3xl shadow-xl border-4 transition-all flex items-center justify-center gap-4
                                        ${scrambledWords.length === 0
                                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-white/20 text-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                                            : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'}
                                    `}
                                >
                                    CHECK <Check size={32} />
                                </button>
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
                                Put the words in the correct order to make a sentence!
                                <br /><br />
                                Tap a word in the bank to move it up. Tap it again to move it back.
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

export default SentenceScramble;
"""

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"SUCCESS: Updated {target_file} with refined layout and Next button.")
