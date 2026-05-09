import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, ArrowLeft, RefreshCw, Trophy, Users, Zap, Wind, AlertTriangle, Moon, Sun, Check, X as XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import { useTheme } from '../context/ThemeContext';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

import confetti from 'canvas-confetti';

const QUESTIONS = [
    "What is the past tense of 'go'?", "Name three colors.", "How do you say 'arigato' in English?",
    "What day is today?", "Spell 'Friend'.", "What is 5 + 5?", "Name a fruit.", "Opposite of 'Hot'?",
    "Count to 10.", "What time is it?", "Name a vegetable.", "Spell 'School'.", "Do you like Natto?",
    "What is your favorite food?", "Name an animal.", "Opposite of 'Big'?", "What comes after Tuesday?",
    "Spell 'Happy'.", "How are you?", "Name a sport.", "What color is a banana?", "Say hello!",
    "Touch your head.", "Clap your hands.", "Stand up!"
];

const Tornado = () => {
    // Core State
    const [gameState, setGameState] = useState('setup'); // setup, playing, gameover
    const [muted, setMuted] = useState(soundManager.muted);
    const [isShaking, setIsShaking] = useState(false);

    // Teacher Mode
    const [customQuestions, setCustomQuestions] = useState(() => {
        const saved = localStorage.getItem('tornado_questions');
        return saved ? JSON.parse(saved) : [];
    });
    const [showEditor, setShowEditor] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');

    // Config
    const [numTeams, setNumTeams] = useState(2);
    const [gridSize, setGridSize] = useState(5);

    // Gameplay Data
    const [teams, setTeams] = useState([]);
    const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
    const [grid, setGrid] = useState([]);
    const [revealedCount, setRevealedCount] = useState(0);

    // Responsive Board Size
    const containerRef = useRef(null);
    const [boardSize, setBoardSize] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const style = window.getComputedStyle(containerRef.current);
                const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
                const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

                const availableWidth = clientWidth - paddingX;
                const availableHeight = clientHeight - paddingY;

                setBoardSize(Math.max(0, Math.min(availableWidth, availableHeight)));
            }
        };

        // Initial measure
        updateSize();
        // Add window listener as a backup (sometimes resize observer is lazy)
        window.addEventListener('resize', updateSize);

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setBoardSize(Math.max(0, Math.min(width, height)));
            }
        });

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, [gameState]); // Re-run when gameState changes (setup -> playing)

    // Modal State
    const [activeModal, setActiveModal] = useState(null);
    // { type: 'question'|'special'|'tornado'|'switch', data: { text, points, icon } }

    const { isDark, toggleTheme } = useTheme();

    const toggleMute = () => {
        const isMuted = soundManager.toggleMute();
        setMuted(isMuted);
    };

    const startGame = () => {
        soundManager.play('start');

        // Init Teams - using neon palette
        const COLORS = ['#F43F5E', '#06B6D4', '#EAB308', '#8B5CF6'];
        const newTeams = Array(numTeams).fill(0).map((_, i) => ({
            id: i,
            name: `Team ${i + 1}`,
            score: 0,
            color: COLORS[i]
        }));
        setTeams(newTeams);
        setCurrentTeamIdx(0);

        // Init Grid
        const total = gridSize * gridSize;
        const specials = generateSpecials(total);

        const newGrid = Array(total).fill(null).map((_, i) => ({
            id: i,
            number: i + 1,
            type: specials[i] || 'bonus', // Default to +1 logic if undefined
            points: specials[i] === 'bonus1' ? 1 :
                specials[i] === 'bonus2' ? 2 :
                    specials[i] === 'bonus5' ? 5 :
                        specials[i] === 'penalty1' ? -1 : 0,
            revealed: false
        }));

        setGrid(newGrid);
        setRevealedCount(0);
        setGameState('playing');
    };

    const generateSpecials = (total) => {
        // Simple distribution
        const specialCounts = {
            tornado: Math.floor(total / 8),
            bonus5: Math.floor(total / 12),
            switch: Math.floor(total / 15),
            penalty1: Math.floor(total / 10)
        };

        // Populate array with types
        let types = [];
        Object.entries(specialCounts).forEach(([type, count]) => {
            types.push(...Array(count).fill(type));
        });

        // Fill rest with regular (+1, +2 mixed)
        while (types.length < total) {
            types.push(Math.random() > 0.7 ? 'bonus2' : 'bonus1');
        }

        // Shuffle
        return types.sort(() => Math.random() - 0.5);
    };

    const handleSquareClick = (square) => {
        if (square.revealed || activeModal) return;

        soundManager.play('click');

        // Question Check
        if (!activeModal) {
            // Pick a question
            const questionPool = customQuestions.length > 0 ? customQuestions : QUESTIONS;
            const questionText = questionPool[Math.floor(Math.random() * questionPool.length)];

            setActiveModal({
                type: 'question',
                data: { text: questionText, square } // Pass square to reveal later
            });
            return;
        }
    };

    const handleAnswer = (correct) => {
        if (!activeModal) return;
        const { square } = activeModal.data;

        if (!correct) {
            // Wrong Answer: Just reveal as X and next turn
            revealSquare(square.id, false);
            soundManager.play('wrong');
            closeModal();
            nextTurn();
            return;
        }

        // Correct Answer: Reveal and Trigger Effect
        closeModal();
        revealSquare(square.id, true);

        const squareData = grid[square.id];
        triggerEffect(squareData);
    };

    const revealSquare = (id, success) => {
        setGrid(prev => prev.map(sq =>
            sq.id === id ? { ...sq, revealed: true, success } : sq
        ));
        setRevealedCount(c => c + 1);
    };

    const triggerEffect = (square) => {
        const team = teams[currentTeamIdx];
        let delayNext = 2000; // Time to admire the modal

        switch (square.type) {
            case 'tornado':
                soundManager.play('tornado');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 1000);
                setActiveModal({ type: 'tornado', data: { team: team.name, color: team.color } });
                updateScore(currentTeamIdx, -team.score); // Wipe score
                break;
            case 'switch':
                soundManager.play('switch');
                setActiveModal({ type: 'switch', data: {} });
                rotateScores();
                break;
            case 'bonus5':
                soundManager.play('bonus');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                setActiveModal({ type: 'special', data: { text: "Huge Bonus!", sub: "+5 Points", icon: "🌟" } });
                updateScore(currentTeamIdx, 5);
                break;
            case 'penalty1':
                soundManager.play('penalty');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
                setActiveModal({ type: 'special', data: { text: "Oh no!", sub: "-1 Point", icon: "💣" } });
                updateScore(currentTeamIdx, -1);
                break;
            default: // bonus1 or bonus2
                const pts = square.type === 'bonus2' ? 2 : 1;
                soundManager.play('correct');
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: [team.color, '#ffffff']
                });
                // No modal for regular points to keep flow fast
                updateScore(currentTeamIdx, pts);
                delayNext = 500; // Faster transition
                break;
        }

        // Auto close modal and next turn
        setTimeout(() => {
            closeModal();
            checkGameOver() || nextTurn();
        }, delayNext);
    };

    const updateScore = (teamIdx, delta) => {
        setTeams(prev => prev.map((t, i) =>
            i === teamIdx ? { ...t, score: Math.max(0, t.score + delta) } : t
        ));
    };

    const rotateScores = () => {
        setTeams(prev => {
            const scores = prev.map(t => t.score);
            const last = scores.pop();
            scores.unshift(last);
            return prev.map((t, i) => ({ ...t, score: scores[i] }));
        });
    };

    const closeModal = () => setActiveModal(null);

    const nextTurn = () => {
        setCurrentTeamIdx(prev => (prev + 1) % numTeams);
    };

    const checkGameOver = () => {
        if (revealedCount >= grid.length - 1) {
            setGameState('gameover');
            soundManager.play('gameover');
            return true;
        }
        return false;
    };

    // --- Render Helpers ---

    if (gameState === 'setup') {
        return (
            <div className="fixed inset-0 z-30 flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-900/90 backdrop-blur-sm">
                <Link to="/" className="absolute top-6 left-6 z-50">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={16} />}>
                        Home
                    </GlossyButton>
                </Link>

                <GlossyCard variant="default" className="w-full max-w-2xl">
                    <RibbonHeader text="TORNADO SETUP" color="red" />

                    <div className="space-y-8 px-4 pt-4">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-[#8D6E63] mb-4 uppercase tracking-widest">Number of Teams</h2>
                            <div className="flex gap-4 justify-center">
                                {[2, 3, 4].map(n => (
                                    <GlossyButton
                                        key={n}
                                        variant={numTeams === n ? 'blue' : 'orange'}
                                        onClick={() => setNumTeams(n)}
                                        className="w-16 h-16 text-2xl"
                                        size="md"
                                    >
                                        {n}
                                    </GlossyButton>
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-[#8D6E63] mb-4 uppercase tracking-widest">Grid Size</h2>
                            <div className="flex gap-4 justify-center">
                                {[4, 5, 6].map(n => (
                                    <GlossyButton
                                        key={n}
                                        variant={gridSize === n ? 'purple' : 'orange'}
                                        onClick={() => setGridSize(n)}
                                        size="md"
                                    >
                                        {n}x{n}
                                    </GlossyButton>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center pt-6">
                            <GlossyButton
                                onClick={startGame}
                                variant="green"
                                size="xl"
                                icon={<Zap fill="currentColor" />}
                            >
                                START GAME
                            </GlossyButton>
                        </div>
                    </div>
                </GlossyCard>
            </div>
        );
    }

    return (
        <motion.div
            className="fixed inset-0 z-30 flex flex-col font-outfit text-white overflow-hidden"
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            <TornadoOverlay active={activeModal?.type === 'tornado'} />



            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-900 to-black/80" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
                />
            </div>

            <TornadoOverlay active={activeModal?.type === 'tornado'} />

            {/* Header */}
            <header className="relative w-full z-20 px-4 py-2 flex items-center justify-between shrink-0 bg-slate-900/50 backdrop-blur-sm shadow-md h-auto min-h-[80px]">
                <div className="flex-1 flex justify-start pointer-events-auto">
                    <GlossyButton onClick={() => setGameState('setup')} variant="blue" size="sm" icon={<ArrowLeft size={18} />}>
                        Quit
                    </GlossyButton>
                </div>

                <div className="flex-2 flex justify-center gap-4 md:gap-8 pointer-events-auto mx-4">
                    {teams.map((t, i) => (
                        <motion.div
                            layout
                            key={t.id}
                            animate={{
                                scale: currentTeamIdx === i ? 1.1 : 0.95,
                                opacity: currentTeamIdx === i ? 1 : 0.8
                            }}
                            className="relative z-10"
                        >
                            <GlossyCard
                                variant="default"
                                className={`
                                    min-w-[100px] md:min-w-[140px] px-3 py-2 flex flex-col items-center border-b-4 transition-all duration-300
                                    ${currentTeamIdx === i ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-amber-50' : 'border-slate-300 bg-slate-100'}
                                `}
                            >
                                <span className={`font-black text-[10px] md:text-xs uppercase tracking-widest mb-0.5 ${currentTeamIdx === i ? 'text-amber-600' : 'text-slate-400'}`}>
                                    {t.name}
                                </span>
                                <span className="font-black text-3xl md:text-5xl text-slate-800 leading-none filter drop-shadow-sm">
                                    {t.score}
                                </span>
                            </GlossyCard>
                        </motion.div>
                    ))}
                </div>

                <div className="flex-1 flex justify-end gap-2 pointer-events-auto">
                    <GlossyButton onClick={toggleMute} variant="orange" size="sm" className="w-10 h-10 flex items-center justify-center p-0">
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </GlossyButton>
                    <GlossyButton onClick={() => {
                        if (window.confirm("Restart game?")) setGameState('setup');
                    }} variant="red" size="sm" className="w-10 h-10 flex items-center justify-center p-0">
                        <RefreshCw size={18} />
                    </GlossyButton>
                    <GlossyButton onClick={() => setShowEditor(true)} variant="blue" size="sm" className="w-10 h-10 flex items-center justify-center p-0">
                        <Settings size={18} />
                    </GlossyButton>
                </div>
            </header>

            {/* Grid */}
            <div ref={containerRef} className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden min-h-0 relative z-10">
                <div
                    className="grid gap-2 md:gap-4 box-border"
                    style={{
                        width: boardSize,
                        height: boardSize,
                        opacity: boardSize > 0 ? 1 : 0,
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                    }}
                >
                    {grid.map(sq => (
                        <Card key={sq.id} square={sq} onClick={() => handleSquareClick(sq)} />
                    ))}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    >
                        {activeModal.type === 'question' && (
                            <motion.div
                                initial={{ scale: 0.8, y: 100, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                className="w-full max-w-3xl perspective-[1000px]"
                            >
                                <GlossyCard variant="default">
                                    <RibbonHeader text="QUESTION" color="blue" />
                                    <div className="text-center p-8">
                                        <p className="text-4xl md:text-6xl font-black text-[#5D4037] mb-12 leading-tight">
                                            {activeModal.data.text}
                                        </p>

                                        <div className="grid grid-cols-2 gap-8">
                                            <GlossyButton onClick={() => handleAnswer(true)} variant="green" size="xl" icon={<Check size={32} />}>
                                                CORRECT
                                            </GlossyButton>
                                            <GlossyButton onClick={() => handleAnswer(false)} variant="red" size="xl" icon={<XIcon size={32} />}>
                                                WRONG
                                            </GlossyButton>
                                        </div>
                                    </div>
                                </GlossyCard>
                            </motion.div>
                        )}

                        {activeModal.type === 'tornado' && (
                            <motion.div
                                initial={{ scale: 0, rotate: 720 }}
                                animate={{ scale: 1, rotate: 0 }}
                            >
                                <GlossyCard variant="default" className="max-w-xl">
                                    <RibbonHeader text="TORNADO!" color="red" />
                                    <div className="text-center p-8 space-y-6">
                                        <div className="text-9xl animate-spin-slow">🌪️</div>
                                        <p className="text-2xl font-bold text-[#8D6E63]">
                                            <span className="text-red-500 font-black">{activeModal.data.team}</span>'s score has been wiped out!
                                        </p>
                                    </div>
                                </GlossyCard>
                            </motion.div>
                        )}

                        {(activeModal.type === 'special' || activeModal.type === 'switch') && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                className="min-w-[400px]"
                            >
                                <GlossyCard variant="default">
                                    <RibbonHeader
                                        text={activeModal.type === 'switch' ? "SWITCH!" : "BONUS!"}
                                        color={activeModal.type === 'switch' ? 'purple' : 'green'}
                                    />
                                    <div className="text-center p-8">
                                        <div className="text-9xl mb-6">{activeModal.data.icon || (activeModal.type === 'switch' ? '🔄' : '🎉')}</div>
                                        <h2 className="text-4xl font-black text-[#5D4037] mb-2">{activeModal.data.text}</h2>
                                        {activeModal.data.sub && <p className="text-2xl text-[#8D6E63] font-bold">{activeModal.data.sub}</p>}
                                    </div>
                                </GlossyCard>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {gameState === 'gameover' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                    >
                        <GlossyCard variant="default" className="w-full max-w-2xl">
                            <RibbonHeader text="GAME OVER" color="orange" />

                            <div className="p-8 space-y-4">
                                {[...teams].sort((a, b) => b.score - a.score).map((t, i) => (
                                    <div key={t.id} className={`flex justify-between items-center p-4 rounded-xl ${i === 0 ? 'bg-yellow-200 border-2 border-yellow-400' : 'bg-black/5'}`}>
                                        <span className="font-bold text-xl text-[#5D4037] flex items-center gap-2">
                                            {i === 0 && '👑'} {t.name}
                                        </span>
                                        <span className="font-black text-2xl text-[#3E2723]">{t.score}</span>
                                    </div>
                                ))}

                                <div className="flex gap-4 mt-8 pt-4 border-t border-black/10">
                                    <GlossyButton onClick={() => setGameState('setup')} variant="blue" className="flex-1">
                                        Menu
                                    </GlossyButton>
                                    <GlossyButton onClick={startGame} variant="green" className="flex-1">
                                        Play Again
                                    </GlossyButton>
                                </div>
                            </div>
                        </GlossyCard>
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
                        <GlossyCard variant="wood" className="w-full max-w-2xl h-[80vh] flex flex-col">
                            <RibbonHeader text="TEACHER MODE" color="blue" />
                            <div className="flex-grow overflow-hidden flex flex-col p-4">
                                <div className="flex justify-end mb-4">
                                    <button onClick={() => setShowEditor(false)} className="p-2 bg-white/20 rounded-full text-white"><XIcon /></button>
                                </div>

                                <div className="mb-6 flex gap-2">
                                    <input
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="Type new question..."
                                        className="flex-1 p-3 rounded-lg border-2 border-[#5D4037] bg-[#FFF8E1] text-[#3E2723] font-bold"
                                    />
                                    <GlossyButton onClick={() => {
                                        if (newQuestion) {
                                            const updated = [...customQuestions, newQuestion];
                                            setCustomQuestions(updated);
                                            localStorage.setItem('tornado_questions', JSON.stringify(updated));
                                            setNewQuestion('');
                                        }
                                    }} variant="green">ADD</GlossyButton>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-[#000000]/10 p-2 rounded-xl">
                                    {customQuestions.map((q, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                            <span className="font-bold text-[#3E2723]">{q}</span>
                                            <button onClick={() => {
                                                const updated = customQuestions.filter((_, idx) => idx !== i);
                                                setCustomQuestions(updated);
                                                localStorage.setItem('tornado_questions', JSON.stringify(updated));
                                            }} className="text-red-500 font-bold">DEL</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlossyCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

const Card = ({ square, onClick }) => {
    return (
        <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
            <motion.div
                className="w-full h-full relative cursor-pointer group"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: square.revealed ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                whileHover={!square.revealed ? { scale: 1.05, y: -5 } : {}}
                whileTap={!square.revealed ? { scale: 0.95 } : {}}
                onClick={onClick}
            >
                {/* Front (Number) */}
                <div
                    className="absolute inset-0 backface-hidden rounded-xl md:rounded-2xl shadow-lg border-b-4 border-indigo-900 bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                    <span className="text-3xl md:text-5xl font-black text-indigo-100 drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                        {square.number}
                    </span>
                </div>

                {/* Back (Content) */}
                <div
                    className={`absolute inset-0 backface-hidden rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center text-4xl md:text-5xl font-black border-4
                        ${square.success !== false
                            ? (square.type === 'tornado' ? 'bg-slate-800 text-white border-slate-600' :
                                square.type === 'penalty1' ? 'bg-red-100 text-red-500 border-red-400' :
                                    square.type === 'switch' ? 'bg-purple-100 text-purple-600 border-purple-400' :
                                        'bg-emerald-100 text-emerald-600 border-emerald-400')
                            : 'bg-slate-200 text-slate-400 border-slate-300'
                        }`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    {/* Gloss Effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                    <div className="drop-shadow-sm transform transition-transform animate-in zoom-in duration-300">
                        {square.success === false ? <span className="opacity-50 grayscale text-3xl">❌</span> :
                            square.type === 'tornado' ? <span className="animate-spin-slow inline-block">🌪️</span> :
                                square.type === 'switch' ? '🔄' :
                                    square.type === 'penalty1' ? '💣' :
                                        square.points > 0 ? `+${square.points}` : square.points}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const TornadoOverlay = ({ active }) => {
    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm mix-blend-multiply" />
                    <motion.div
                        animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
                        transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                        className="text-[20rem] opacity-40 blur-sm select-none"
                    >
                        🌪️
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Tornado;
