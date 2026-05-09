import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Grid3X3, Users, Brain, Sparkles, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const DEFAULT_PAIRS = [
    { a: 'Dog', b: '🐶', id: 'dog' },
    { a: 'Cat', b: '🐱', id: 'cat' },
    { a: 'Mouse', b: '🐭', id: 'mouse' },
    { a: 'Hamster', b: '🐹', id: 'hamster' },
    { a: 'Rabbit', b: '🐰', id: 'rabbit' },
    { a: 'Fox', b: '🦊', id: 'fox' },
    { a: 'Bear', b: '🐻', id: 'bear' },
    { a: 'Panda', b: '🐼', id: 'panda' },
    { a: 'Koala', b: '🐨', id: 'koala' },
    { a: 'Tiger', b: '🐯', id: 'tiger' },
    { a: 'Lion', b: '🦁', id: 'lion' },
    { a: 'Cow', b: '🐮', id: 'cow' },
    { a: 'Pig', b: '🐷', id: 'pig' },
    { a: 'Frog', b: '🐸', id: 'frog' },
    { a: 'Monkey', b: '🐵', id: 'monkey' },
    { a: 'Bird', b: '🐦', id: 'bird' },
    { a: 'Duck', b: '🦆', id: 'duck' },
    { a: 'Owl', b: '🦉', id: 'owl' }
];

const MemoryMatch = () => {
    // Setup State
    const [gameState, setGameState] = useState('SETUP'); // SETUP, PLAYING, FINISHED
    const [gridSize, setGridSize] = useState(16); // 16, 20, 24, 30, 36
    const [teamCount, setTeamCount] = useState(2);

    // Teacher Mode
    const [customPairs, setCustomPairs] = useState(() => {
        const saved = localStorage.getItem('memory_match_pairs');
        return saved ? JSON.parse(saved) : [];
    });
    const [showEditor, setShowEditor] = useState(false);
    const [newPair, setNewPair] = useState({ a: '', b: '' });

    // Play State
    const [cards, setCards] = useState([]); // { id, content, state, matchId }
    const [flippedIndices, setFlippedIndices] = useState([]); // [index1, index2]
    const [teams, setTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [message, setMessage] = useState('');

    const startGame = () => {
        // Setup Teams
        const newTeams = Array.from({ length: teamCount }, (_, i) => ({
            name: `Team ${i + 1}`,
            score: 0
        }));
        setTeams(newTeams);
        setCurrentTeam(0);

        // Setup Cards
        const pairCount = gridSize / 2;
        const sourcePairs = customPairs.length >= pairCount ? customPairs : [...customPairs, ...DEFAULT_PAIRS];

        // Ensure we have enough pairs by cycling if needed
        const selectedPairs = [];
        for (let i = 0; i < pairCount; i++) {
            selectedPairs.push(sourcePairs[i % sourcePairs.length]);
        }

        const deck = [];
        selectedPairs.forEach(pair => {
            deck.push({ matchId: pair.id, content: pair.a, state: 'hidden', uniqueId: Math.random() });
            deck.push({ matchId: pair.id, content: pair.b, state: 'hidden', uniqueId: Math.random() });
        });

        // Shuffle
        setCards(deck.sort(() => Math.random() - 0.5));
        setFlippedIndices([]);
        setIsLocked(false);
        setGameState('PLAYING');
        setMessage(`${newTeams[0].name}'s Turn`);
        soundManager.play('start');
    };

    const handleCardClick = (index) => {
        if (isLocked || cards[index].state !== 'hidden') return;
        if (flippedIndices.includes(index)) return;

        soundManager.play('pop');

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        setCards(prev => {
            const newCards = [...prev];
            newCards[index].state = 'flipped';
            return newCards;
        });

        if (newFlipped.length === 2) {
            setIsLocked(true);
            checkForMatch(newFlipped[0], newFlipped[1]);
        }
    };

    const checkForMatch = (idx1, idx2) => {
        const card1 = cards[idx1];
        const card2 = cards[idx2];

        if (card1.matchId === card2.matchId) {
            setTimeout(() => {
                soundManager.play('correct');

                setCards(prev => {
                    const newCards = [...prev];
                    newCards[idx1].state = 'matched';
                    newCards[idx2].state = 'matched';
                    return newCards;
                });

                setTeams(prev => {
                    const newTeams = [...prev];
                    newTeams[currentTeam].score += 1;
                    return newTeams;
                });

                setFlippedIndices([]);
                setIsLocked(false);
                setMessage(`${teams[currentTeam].name} found a match! Go again!`);

                const allMatched = cards.every((c, i) =>
                    (i === idx1 || i === idx2 || c.state === 'matched')
                );
                if (allMatched) {
                    setTimeout(() => {
                        soundManager.play('win');
                        setGameState('FINISHED');
                        confetti({ particleCount: 200, spread: 100 });
                    }, 500);
                }

            }, 600);
        } else {
            setTimeout(() => {
                soundManager.play('wrong');

                setCards(prev => {
                    const newCards = [...prev];
                    newCards[idx1].state = 'hidden';
                    newCards[idx2].state = 'hidden';
                    return newCards;
                });

                setFlippedIndices([]);
                setIsLocked(false);
                nextTurn();
            }, 1200);
        }
    };

    const nextTurn = () => {
        setCurrentTeam(prev => {
            const next = (prev + 1) % teamCount;
            setMessage(`${teams[next].name}'s Turn`);
            return next;
        });
    };

    const gridCols = Math.sqrt(gridSize) % 1 === 0 ? Math.sqrt(gridSize) : (gridSize === 20 ? 5 : (gridSize === 24 ? 6 : 6));

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-900/20 to-transparent rounded-full blur-3xl opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-900/20 to-transparent rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-8 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                {gameState === 'PLAYING' && (
                    <GlossyCard variant="default" className="px-8 py-2 flex items-center gap-4">
                        <motion.span
                            key={message}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600"
                        >
                            {message}
                        </motion.span>
                    </GlossyCard>
                )}

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setShowEditor(true)} variant="purple" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <Settings />
                    </GlossyButton>
                    <GlossyButton onClick={() => setGameState('SETUP')} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw className="text-white hover:rotate-180 transition duration-500" />
                    </GlossyButton>
                </div>
            </header>

            <AnimatePresence mode='wait'>
                {gameState === 'SETUP' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-lg z-10"
                    >
                        <GlossyCard variant="default" className="text-center overflow-hidden">
                            <RibbonHeader text="MEMORY MATCH" color="indigo" icon={<Brain className="w-6 h-6" />} />

                            <div className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Grid Size</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[16, 20, 24, 30, 36].map(size => (
                                                <GlossyButton
                                                    key={size}
                                                    onClick={() => setGridSize(size)}
                                                    variant={gridSize === size ? "blue" : "default"}
                                                    className="flex-1 min-w-[60px]"
                                                >
                                                    {size}
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Teams</label>
                                        <div className="flex gap-2">
                                            {[2, 3, 4].map(count => (
                                                <GlossyButton
                                                    key={count}
                                                    onClick={() => setTeamCount(count)}
                                                    variant={teamCount === count ? "indigo" : "default"}
                                                    className="flex-1"
                                                >
                                                    {count} Teams
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <GlossyButton onClick={startGame} variant="green" size="xl" className="w-full py-6 text-2xl">
                                    Start Game
                                </GlossyButton>
                            </div>
                        </GlossyCard>
                    </motion.div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl h-[80vh] z-10">

                        {/* Left: Scoreboard */}
                        <GlossyCard variant="default" className="w-full md:w-72 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 transition-all">
                            <h3 className="text-[#8D6E63] font-bold uppercase text-center text-xs tracking-widest flex items-center justify-center gap-2">
                                <Trophy size={14} /> SCOREBOARD
                            </h3>
                            <div className="space-y-3">
                                {teams.map((team, i) => (
                                    <div
                                        key={i}
                                        className={`p-3 rounded-xl border-2 flex justify-between items-center transition-all shadow-sm ${i === currentTeam ? 'bg-indigo-50 border-indigo-200' : 'bg-white/50 border-transparent opacity-60'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${i === currentTeam ? 'bg-indigo-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                                                {i + 1}
                                            </div>
                                            <span className={`font-bold text-sm ${i === currentTeam ? 'text-indigo-900' : 'text-slate-400'}`}>{team.name}</span>
                                        </div>
                                        <span className={`text-2xl font-black ${i === currentTeam ? 'text-indigo-600' : 'text-slate-400'}`}>{team.score}</span>
                                    </div>
                                ))}
                            </div>
                        </GlossyCard>

                        {/* Right: Grid */}
                        <div className="flex-grow flex items-center justify-center">
                            <GlossyCard variant="default" className="w-full h-full p-4 bg-slate-900/40">
                                <div
                                    className="grid gap-2 w-full h-full content-center justify-center"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                                        gridAutoRows: 'minmax(0, 1fr)'
                                    }}
                                >
                                    {cards.map((card, i) => (
                                        <motion.div
                                            key={card.uniqueId}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="relative w-full h-full perspective-1000"
                                            onClick={() => handleCardClick(i)}
                                        >
                                            <motion.div
                                                className="w-full h-full relative preserve-3d transition-all duration-500 cursor-pointer"
                                                animate={{ rotateY: card.state === 'flipped' || card.state === 'matched' ? 180 : 0 }}
                                            >
                                                {/* Front (Hidden state) */}
                                                <div className="absolute inset-0 backface-hidden rounded-xl shadow-lg flex items-center justify-center group transform transition-transform hover:scale-[1.02]">
                                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border-b-4 border-indigo-800 flex items-center justify-center relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                                        <Brain className="text-white/40 drop-shadow-lg" size="40%" />
                                                    </div>
                                                </div>

                                                {/* Back (Revealed state) */}
                                                <div
                                                    className={`
                                                        absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-b-4 flex items-center justify-center p-2 text-center shadow-lg
                                                        ${card.state === 'matched'
                                                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-700 text-white'
                                                            : 'bg-gradient-to-br from-white to-slate-100 border-slate-300 text-slate-800'}
                                                    `}
                                                >
                                                    <span className={`${card.content.length > 8 ? 'text-xs md:text-sm' : 'text-xl md:text-3xl'} font-black select-none drop-shadow-sm`}>
                                                        {card.content}
                                                    </span>
                                                    {card.state === 'matched' && (
                                                        <motion.div
                                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                            className="absolute top-1 right-1"
                                                        >
                                                            <Sparkles size={16} className="text-yellow-300 drop-shadow-md" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlossyCard>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                {gameState === 'FINISHED' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlossyCard variant="orange" className="border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                                <RibbonHeader text="GAME OVER!" color="red" />
                                <div className="p-8 pb-12 text-center flex flex-col items-center">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                        className="inline-block p-4 bg-yellow-400 rounded-full mb-6 shadow-lg border-2 border-white/20"
                                    >
                                        <Trophy size={64} className="text-white drop-shadow-md" />
                                    </motion.div>

                                    <div className="space-y-4 w-full mb-8">
                                        {[...teams].sort((a, b) => b.score - a.score).map((team, i) => (
                                            <div
                                                key={i}
                                                className={`flex justify-between items-center p-4 rounded-xl border-2 ${i === 0 ? 'bg-white text-amber-600 border-white shadow-md' : 'bg-black/10 text-amber-100 border-black/5'}`}
                                            >
                                                <div className="flex items-center gap-4 text-xl font-black">
                                                    {i === 0 && '👑'} {team.name}
                                                </div>
                                                <span className="text-2xl font-black">{team.score} matches</span>
                                            </div>
                                        ))}
                                    </div>

                                    <GlossyButton onClick={() => setGameState('SETUP')} variant="white" size="xl" className="w-full text-orange-600">
                                        Start New Game
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-2xl h-[80vh]"
                        >
                            <GlossyCard variant="default" className="h-full flex flex-col">
                                <RibbonHeader text="CARD EDITOR" color="purple" icon={<Settings className="w-5 h-5" />} />

                                <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
                                    <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200">
                                        <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">New Pair</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={newPair.a}
                                                onChange={(e) => setNewPair({ ...newPair, a: e.target.value })}
                                                placeholder="Card 1"
                                                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold focus:outline-none focus:border-purple-400 transition"
                                            />
                                            <input
                                                value={newPair.b}
                                                onChange={(e) => setNewPair({ ...newPair, b: e.target.value })}
                                                placeholder="Card 2"
                                                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold focus:outline-none focus:border-purple-400 transition"
                                            />
                                            <GlossyButton
                                                onClick={() => {
                                                    if (newPair.a && newPair.b) {
                                                        const updated = [...customPairs, { ...newPair, id: Date.now() }];
                                                        setCustomPairs(updated);
                                                        localStorage.setItem('memory_match_pairs', JSON.stringify(updated));
                                                        setNewPair({ a: '', b: '' });
                                                    }
                                                }}
                                                disabled={!newPair.a || !newPair.b}
                                                variant="green"
                                                size="sm"
                                            >
                                                ADD
                                            </GlossyButton>
                                        </div>
                                    </div>

                                    <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                        {customPairs.length === 0 ? (
                                            <div className="text-center text-slate-400 py-10 italic border-2 border-dashed border-slate-300 rounded-xl">
                                                No custom pairs. Using defaults.
                                            </div>
                                        ) : (
                                            customPairs.map((pair, i) => (
                                                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm group hover:border-purple-200 transition">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-indigo-500">{pair.a}</span>
                                                        <span className="text-slate-300">↔</span>
                                                        <span className="font-bold text-purple-500">{pair.b}</span>
                                                    </div>
                                                    <GlossyButton
                                                        onClick={() => {
                                                            const updated = customPairs.filter((_, idx) => idx !== i);
                                                            setCustomPairs(updated);
                                                            localStorage.setItem('memory_match_pairs', JSON.stringify(updated));
                                                        }}
                                                        variant="red"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 scale-90"
                                                    >
                                                        Delete
                                                    </GlossyButton>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end rounded-b-3xl">
                                    <GlossyButton onClick={() => setShowEditor(false)} variant="blue" size="md">
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

export default MemoryMatch;
