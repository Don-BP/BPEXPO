import ThreeDice from '../components/ThreeDice';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Users, TrendingUp, Dice5, Settings, HelpCircle, Check, X, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';
import confetti from 'canvas-confetti';

const DEFAULT_QUESTIONS = [
    { id: 1, q: "What color is the sky?", a: "Blue" },
    { id: 2, q: "What is 5 + 5?", a: "10" },
    { id: 3, q: "Name a fruit that is red.", a: "Apple" },
    { id: 4, q: "What animal says 'Meow'?", a: "Cat" },
    { id: 5, q: "Opposite of Hot?", a: "Cold" },
];

const COLORS = [
    { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', shadow: 'shadow-red-500/50', variant: 'red' },
    { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', shadow: 'shadow-blue-500/50', variant: 'blue' },
    { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', shadow: 'shadow-green-500/50', variant: 'green' },
    { bg: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50', variant: 'orange' },
];

const generateRandomBoard = () => {
    const ladders = [];
    const snakes = [];
    const usedStartPositions = new Set([1, 100]);
    const usedEndPositions = new Set([1, 100]);

    // Generate Ladders
    let attempts = 0;
    while (ladders.length < 8 && attempts < 1000) {
        attempts++;
        const start = Math.floor(Math.random() * 80) + 2;
        const length = Math.floor(Math.random() * 30) + 10;
        const end = start + length;

        if (end < 100 && !usedStartPositions.has(start) && !usedEndPositions.has(end)) {
            const startRow = Math.floor((start - 1) / 10);
            const endRow = Math.floor((end - 1) / 10);
            if (endRow > startRow) {
                ladders.push({ start, end });
                usedStartPositions.add(start);
                usedEndPositions.add(end);
            }
        }
    }

    // Generate Snakes
    attempts = 0;
    while (snakes.length < 8 && attempts < 1000) {
        attempts++;
        const start = Math.floor(Math.random() * 98) + 11;
        const length = Math.floor(Math.random() * 30) + 10;
        const end = start - length;

        if (end > 1 && !usedStartPositions.has(start) && !usedEndPositions.has(end)) {
            const startRow = Math.floor((start - 1) / 10);
            const endRow = Math.floor((end - 1) / 10);
            if (endRow < startRow) {
                snakes.push({ start, end });
                usedStartPositions.add(start);
                usedEndPositions.add(end);
            }
        }
    }

    return { ladders, snakes };
};

const SnakesAndLadders = () => {
    // Setup State
    const [gameState, setGameState] = useState('SETUP'); // SETUP, PLAYING, FINISHED
    const [teamCount, setTeamCount] = useState(2);

    // Play State
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [svgLines, setSvgLines] = useState([]);

    // Refs
    const boardRef = useRef(null);
    const cellsRef = useRef({});

    const [snakes, setSnakes] = useState([]);
    const [ladders, setLadders] = useState([]);
    const [cellPoints, setCellPoints] = useState({});

    // Question System
    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem('snakes_questions');
        return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    });
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [pendingMove, setPendingMove] = useState(null); // { type: 'ladder'|'snake', target: number }
    const [showTeacherMode, setShowTeacherMode] = useState(false);
    const [showDiceZoom, setShowDiceZoom] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ q: '', a: '' });



    // Calculate SVG Lines
    const calculateLines = () => {
        if (!boardRef.current) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        const newLines = [];
        const getCellCenter = (num) => {
            const cell = cellsRef.current[num];
            if (!cell) return null;
            const rect = cell.getBoundingClientRect();
            return {
                x: rect.left - boardRect.left + rect.width / 2,
                y: rect.top - boardRect.top + rect.height / 2
            };
        };

        if (ladders.length > 0) {
            ladders.forEach(l => {
                const start = getCellCenter(l.start);
                const end = getCellCenter(l.end);
                if (start && end) newLines.push({ ...l, x1: start.x, y1: start.y, x2: end.x, y2: end.y, type: 'ladder' });
            });
        }

        if (snakes.length > 0) {
            snakes.forEach(s => {
                const start = getCellCenter(s.start);
                const end = getCellCenter(s.end);
                if (start && end) newLines.push({ ...s, x1: start.x, y1: start.y, x2: end.x, y2: end.y, type: 'snake' });
            });
        }
        setSvgLines(newLines);
    };

    useLayoutEffect(() => {
        if (gameState === 'PLAYING') {
            setTimeout(calculateLines, 100);
            window.addEventListener('resize', calculateLines);
            return () => window.removeEventListener('resize', calculateLines);
        }
    }, [gameState]);

    const startGame = () => {
        const { snakes: newSnakes, ladders: newLadders } = generateRandomBoard();
        setSnakes(newSnakes);
        setLadders(newLadders);

        // Generate Points
        const points = {};
        for (let i = 2; i < 100; i++) {
            if (Math.random() > 0.6) {
                const vals = [1, 2, 3, 5];
                points[i] = vals[Math.floor(Math.random() * vals.length)];
            }
        }
        setCellPoints(points);

        const newPlayers = Array.from({ length: teamCount }, (_, i) => ({
            id: i,
            name: `Player ${i + 1}`,
            position: 1,
            score: 0,
            color: COLORS[i]
        }));
        setPlayers(newPlayers);
        setCurrentPlayer(0);
        setDiceValue(null);
        setGameState('PLAYING');
        soundManager.play('start');
    };

    const rollDice = () => {
        if (gameState === 'FINISHED' || isRolling || isMoving) return;
        soundManager.play('click');
        setShowDiceZoom(false); // Reset zoom
        setIsRolling(true);
    };

    const handleDiceRollComplete = async (value) => {
        setIsRolling(false);
        setDiceValue(value);

        // Zoom Effect
        setShowDiceZoom(true);
        soundManager.play('pop');

        movePlayer(value);
    };

    const movePlayer = async (steps) => {
        setIsMoving(true);
        const player = players[currentPlayer];
        const targetPos = Math.min(player.position + steps, 100);

        await new Promise(r => setTimeout(r, 500));
        updatePlayerPosition(currentPlayer, targetPos);
        soundManager.play('pop');

        await new Promise(r => setTimeout(r, 600));
        checkSpecial(targetPos, player.position);
    };

    const checkSpecial = async (pos, oldPos) => {
        const ladder = ladders.find(l => l.start === pos);
        const snake = snakes.find(s => s.start === pos);

        // Award points if any
        if (cellPoints[pos]) {
            setPlayers(prev => {
                const next = [...prev];
                next[currentPlayer].score += cellPoints[pos];
                return next;
            });
        }

        // Always Trigger Question
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQuestion(randomQ);

        const newPendingMove = {
            type: snake ? 'snake' : ladder ? 'ladder' : 'normal',
            target: ladder ? ladder.end : snake ? snake.end : pos,
            start: pos,
            revert: oldPos
        };

        setPendingMove(newPendingMove);
        setShowQuestionModal(true);
    };

    const handleQuestionAnswer = async (correct) => {
        setShowQuestionModal(false);
        const move = pendingMove;
        setPendingMove(null);

        if (move.type === 'ladder') {
            if (correct) {
                soundManager.play('correct');
                await new Promise(r => setTimeout(r, 500));
                updatePlayerPosition(currentPlayer, move.target);
                finishTurn(move.target);
            } else {
                soundManager.play('wrong');
                finishTurn(move.start); // Stay at start of ladder
            }
        } else if (move.type === 'snake') {
            if (correct) {
                soundManager.play('correct');
                finishTurn(move.start); // Stay at snake head (Saved!)
            } else {
                soundManager.play('wrong');
                await new Promise(r => setTimeout(r, 500));
                updatePlayerPosition(currentPlayer, move.target); // Slide down
                finishTurn(move.target);
            }
        } else if (move.type === 'normal') {
            if (correct) {
                soundManager.play('correct');
                finishTurn(move.target); // Stay
            } else {
                soundManager.play('wrong');
                // Revert to old position (Strict Mode: Go back if wrong)
                await new Promise(r => setTimeout(r, 500));
                updatePlayerPosition(currentPlayer, move.revert);
                finishTurn(move.revert);
            }
        }
    };

    const finishTurn = (pos) => {
        if (pos === 100) {
            soundManager.play('win');
            confetti({ particleCount: 200, spread: 100 });
            setGameState('FINISHED');
            setIsMoving(false);
        } else {
            setIsMoving(false);
            setCurrentPlayer(prev => (prev + 1) % teamCount);
        }
    };

    const updatePlayerPosition = (pIndex, newPos) => {
        setPlayers(prev => {
            const next = [...prev];
            next[pIndex].position = newPos;
            return next;
        });
    };

    // Grid Logic
    const gridCells = [];
    for (let row = 9; row >= 0; row--) {
        const start = row * 10 + 1;
        const end = start + 9;
        const layer = [];
        for (let i = start; i <= end; i++) layer.push(i);
        if (row % 2 !== 0) layer.reverse();
        gridCells.push(...layer);
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>

            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-4 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                {gameState === 'PLAYING' && (
                    <GlossyCard variant="default" className="px-4 py-2 flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${players[currentPlayer]?.color.bg} shadow-lg`} />
                        <span className="font-bold text-slate-800 uppercase tracking-wider">
                            Turn: <span className={players[currentPlayer]?.color.text.replace('400', '600')}>{players[currentPlayer]?.name}</span>
                        </span>
                    </GlossyCard>
                )}

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setShowTeacherMode(true)} variant="default" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <Settings size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={() => setGameState('SETUP')} variant="pink" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw size={20} />
                    </GlossyButton>
                </div>
            </header>


            <AnimatePresence mode='wait'>
                {gameState === 'SETUP' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 w-full flex items-center justify-center z-10"
                    >
                        <GlossyCard variant="default" className="max-w-md w-full text-center p-8">
                            <RibbonHeader text="SNAKES & LADDERS" color="purple" icon={<TrendingUp className="w-6 h-6" />} />

                            <div className="space-y-8 mt-8">
                                <div className="space-y-4">
                                    <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest">Select Players</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[2, 3, 4].map(count => (
                                            <GlossyButton
                                                key={count}
                                                onClick={() => setTeamCount(count)}
                                                variant={teamCount === count ? "blue" : "default"}
                                                className={teamCount !== count ? "opacity-60" : ""}
                                            >
                                                {count}
                                            </GlossyButton>
                                        ))}
                                    </div>
                                </div>

                                <GlossyButton onClick={startGame} variant="green" size="xl" className="w-full">
                                    START GAME
                                </GlossyButton>
                            </div>
                        </GlossyCard>
                    </motion.div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[95vw] flex-1 z-10 items-stretch overflow-hidden pb-4">

                        {/* LEFT: Players & Dice */}
                        <div className="lg:w-64 flex flex-col gap-4 shrink-0">
                            {/* Player List */}
                            <GlossyCard variant="default" className="flex-1 min-h-[200px] flex flex-col p-3">
                                <RibbonHeader text="PLAYERS" color="blue" size="sm" />
                                <div className="flex flex-col gap-2 mt-4 overflow-y-auto flex-1 custom-scrollbar overflow-x-hidden px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <style>{`
                                        .custom-scrollbar::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>
                                    {players.map((p, i) => (
                                        <div
                                            key={i}
                                            className={`
                                                flex items-center gap-2 px-2 py-2 rounded-xl border transition-all duration-300
                                                ${i === currentPlayer
                                                    ? `bg-white border-amber-400 shadow-md scale-[1.02]`
                                                    : 'bg-black/5 border-transparent opacity-70 hover:opacity-100'}
                                            `}
                                        >
                                            <div className={`w-8 h-8 rounded-full ${p.color.bg} flex items-center justify-center border-2 border-white shadow-md shrink-0`}>
                                                <User size={16} className="text-white" />
                                            </div>
                                            <div className="flex flex-col leading-none min-w-0">
                                                <span className={`font-bold text-sm truncate ${i === currentPlayer ? 'text-slate-900' : 'text-slate-600'}`}>
                                                    {p.name}
                                                </span>
                                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold whitespace-nowrap">Pos: {p.position}</span>
                                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">Score: {p.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlossyCard>

                            <div className="h-48 relative z-20">
                                <GlossyCard variant="default" className="w-full h-full flex flex-col items-center justify-center p-0 overflow-visible bg-slate-800/80">
                                    <motion.div
                                        className="relative w-full h-full flex items-center justify-center cursor-pointer"
                                        onClick={rollDice}
                                        // animate prop removed as we handle it in 3D now
                                        layout
                                    >
                                        <ThreeDice rolling={isRolling} onResult={handleDiceRollComplete} zoom={showDiceZoom} />

                                        {!isRolling && !isMoving && gameState !== 'FINISHED' && (
                                            <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none animate-bounce">
                                                <span className="px-3 py-1 bg-black/40 rounded-full text-xs text-white font-bold uppercase tracking-widest border border-white/10">Tap to Roll</span>
                                            </div>
                                        )}
                                    </motion.div>
                                </GlossyCard>
                            </div>
                        </div>

                        {/* RIGHT: Board */}
                        <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                            <GlossyCard variant="default" className="p-2 md:p-4 bg-slate-900/90 w-full aspect-square max-h-[80vh] max-w-[80vh] shadow-2xl relative">
                                <div
                                    ref={boardRef}
                                    className="w-full h-full grid grid-cols-10 grid-rows-10 relative bg-slate-900 rounded-lg overflow-hidden border border-white/5"
                                >
                                    {/* SVG Overlay */}
                                    <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible">
                                        <defs>
                                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="2" result="blur" />
                                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                            </filter>
                                        </defs>
                                        {svgLines.map((line, i) => (
                                            <g key={i}>
                                                {/* Shadow Line */}
                                                <line
                                                    x1={line.x1} y1={line.y1 + 4} x2={line.x2} y2={line.y2 + 4}
                                                    stroke="rgba(0,0,0,0.5)" strokeWidth={line.type === 'snake' ? "2%" : "3%"} strokeLinecap="round"
                                                />
                                                {/* Main Line */}
                                                <motion.line
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 0.8 }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                                                    stroke={line.type === 'snake' ? '#ef4444' : '#22c55e'}
                                                    strokeWidth={line.type === 'snake' ? "2%" : "3%"}
                                                    strokeLinecap="round"
                                                    strokeDasharray={line.type === 'snake' ? "8, 12" : "0"}
                                                    className="filter drop-shadow-md"
                                                />
                                            </g>
                                        ))}
                                    </svg>

                                    {/* Grid Cells */}
                                    {gridCells.map(num => (
                                        <div
                                            key={num}
                                            ref={el => cellsRef.current[num] = el}
                                            className={`
                                                relative flex items-center justify-center font-bold text-[10px] sm:text-xs md:text-sm lg:text-base border-[0.5px] border-white/5
                                                ${num === 100 ? 'bg-yellow-500/10 text-yellow-400' : ''}
                                                ${num === 1 ? 'bg-green-500/10 text-green-400' : ''}
                                                ${(num !== 1 && num !== 100) ? 'text-slate-600' : ''}
                                            `}
                                        >
                                            <span className={`z-0 ${num === 100 ? 'scale-125 font-black text-yellow-500' : 'opacity-60'}`}>{num}</span>
                                            {cellPoints[num] && (
                                                <div className="absolute top-0 right-0 p-[2px] text-[8px] sm:text-[10px] text-amber-300 font-black">+{cellPoints[num]}</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Players on Board */}
                                    {players.map(p => {
                                        // Don't render if at pos 1 (start) to avoid clutter, or maybe render overlapped
                                        // Actually render all.
                                        const cell = cellsRef.current[p.position];
                                        if (!cell) return null; // Should ideally position absolutely based on calculations, but grid layout handles it if we map correctly.
                                        // WAIT: The original implementation mapped players into the grid cells via filtering. Let's stick to that for simplicity. 
                                        return null;
                                    })}

                                    {/* Overlay Players on Grid - Using CSS Grid Positioning for stability */}
                                    <div className="absolute inset-0 w-full h-full pointer-events-none grid grid-cols-10 grid-rows-10">
                                        {gridCells.map(num => (
                                            <div key={`p-container-${num}`} className="relative flex items-center justify-center">
                                                <div className="flex flex-wrap justify-center items-center w-full h-full p-0.5 gap-0.5">
                                                    {players.filter(p => p.position === num).map(p => (
                                                        <motion.div
                                                            layoutId={`player-${p.id}`}
                                                            key={p.id}
                                                            className={`
                                                                 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 rounded-full ${p.color.bg} border border-white shadow-lg z-20 
                                                                 ${p.color.shadow}
                                                             `}
                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                        >
                                                            {players[currentPlayer].id === p.id && (
                                                                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-50" />
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlossyCard>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {/* Win Modal */}
                {gameState === 'FINISHED' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlossyCard variant="orange" className="border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                                <RibbonHeader text="WINNER!" color="red" />
                                <div className="p-8 text-center flex flex-col items-center gap-6">
                                    <div className="text-8xl filter drop-shadow-xl">🏆</div>

                                    <div className="bg-black/20 rounded-xl px-12 py-4 border border-white/10">
                                        <p className={`text-4xl font-black ${players[currentPlayer].color.text} drop-shadow-md`}>
                                            {players[currentPlayer].name}
                                        </p>
                                    </div>

                                    <GlossyButton onClick={startGame} variant="white" size="xl" className="w-full text-orange-600">
                                        Play Again
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}

                {/* Question Modal */}
                {showQuestionModal && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlossyCard variant={pendingMove?.type === 'ladder' ? 'green' : pendingMove?.type === 'snake' ? 'red' : 'blue'}>
                                <RibbonHeader
                                    text={pendingMove?.type === 'ladder' ? 'LADDER CHALLENGE!' : pendingMove?.type === 'snake' ? 'SNAKE DEFENSE!' : 'MOVEMENT CHALLENGE!'}
                                    color={pendingMove?.type === 'ladder' ? 'green' : pendingMove?.type === 'snake' ? 'red' : 'blue'}
                                />

                                <div className="p-8 text-center">
                                    <h2 className="text-2xl md:text-3xl font-black text-white mb-8 drop-shadow-md">{currentQuestion.q}</h2>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <GlossyButton onClick={() => handleQuestionAnswer(true)} variant="green" size="lg" icon={<Check size={24} />} className="flex-col h-auto py-6 gap-2">
                                            Correct
                                        </GlossyButton>
                                        <GlossyButton onClick={() => handleQuestionAnswer(false)} variant="red" size="lg" icon={<X size={24} />} className="flex-col h-auto py-6 gap-2">
                                            Wrong
                                        </GlossyButton>
                                    </div>

                                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Answer</p>
                                        <p className="text-xl font-bold text-white blur-md hover:blur-none transition-all cursor-help">{currentQuestion.a}</p>
                                    </div>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}

                {/* Teacher Mode Modal */}
                {showTeacherMode && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-2xl max-h-[90vh] flex flex-col"
                        >
                            <GlossyCard variant="default" className="flex flex-col h-full bg-slate-900 border-slate-700">
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Settings className="text-slate-400" />
                                        <h2 className="text-2xl font-black text-white">Edit Questions</h2>
                                    </div>
                                    <GlossyButton onClick={() => setShowTeacherMode(false)} variant="default" size="sm" className="w-8 h-8 p-0 flex items-center justify-center">
                                        <X size={16} />
                                    </GlossyButton>
                                </div>

                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-6 shrink-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            value={newQuestion.q}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, q: e.target.value })}
                                            placeholder="Question"
                                            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                value={newQuestion.a}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, a: e.target.value })}
                                                placeholder="Answer"
                                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                            />
                                            <GlossyButton
                                                onClick={() => {
                                                    if (newQuestion.q && newQuestion.a) {
                                                        const updated = [...questions, { ...newQuestion, id: Date.now() }];
                                                        setQuestions(updated);
                                                        localStorage.setItem('snakes_questions', JSON.stringify(updated));
                                                        setNewQuestion({ q: '', a: '' });
                                                    }
                                                }}
                                                disabled={!newQuestion.q || !newQuestion.a}
                                                variant="green"
                                                size="sm"
                                            >
                                                ADD
                                            </GlossyButton>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                    {questions.map((q, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-white/10 transition">
                                            <div>
                                                <div className="font-bold text-white mb-1">{q.q}</div>
                                                <div className="text-sm text-green-400 font-bold">A: {q.a}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const updated = questions.filter((_, idx) => idx !== i);
                                                    setQuestions(updated);
                                                    localStorage.setItem('snakes_questions', JSON.stringify(updated));
                                                }}
                                                className="px-3 py-1 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default SnakesAndLadders;
