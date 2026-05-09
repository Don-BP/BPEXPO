import ThreeDice from '../games/ThreeDice';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, Settings, Check, X, User, BookMarked, Trash2 } from 'lucide-react';
import { soundManager } from '../games/soundManager';
import { TT, TTBtn, TTCard, TTHeader, TTGameHeader, TTModal } from '../games/TTGameComponents';
import confetti from 'canvas-confetti';
import SnakeSVG, { SNAKE_PALETTES, type SnakePalette } from './SnakeSVG';
import LadderSVG from './LadderSVG';
import Scoreboard from './Scoreboard';

const ACCENT = '#43A047';

const DEFAULT_QUESTIONS = [
    { id: 1, q: "What color is the sky?", a: "Blue" },
    { id: 2, q: "What is 5 + 5?", a: "10" },
    { id: 3, q: "Name a fruit that is red.", a: "Apple" },
    { id: 4, q: "What animal says 'Meow'?", a: "Cat" },
    { id: 5, q: "Opposite of Hot?", a: "Cold" },
];

const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#FBBF24'];

const generateRandomBoard = (boardSize: number, cols: number) => {
    // count: 5→3, 7→4, 8→5, 10→6
    const count = Math.max(2, Math.round(cols * 0.6));
    const minSpan = cols;
    const maxSpan = Math.min(Math.floor(boardSize * 0.5), cols * 3);
    const usedPositions = new Set([1, boardSize]);
    const ladders: { start: number; end: number }[] = [];
    const snakes: { start: number; end: number }[] = [];

    // Divide the valid start ranges into `count` equal zones so elements
    // are spread evenly across the board rather than clumping.
    const lStartMin = 2, lStartMax = boardSize - cols - 1;
    const lSlot = Math.max(1, Math.floor((lStartMax - lStartMin) / count));

    const sStartMin = cols + 2, sStartMax = boardSize - 1;
    const sSlot = Math.max(1, Math.floor((sStartMax - sStartMin) / count));

    for (let z = 0; z < count; z++) {
        // Ladder: one per zone
        const lMin = lStartMin + z * lSlot;
        const lMax = z === count - 1 ? lStartMax : lMin + lSlot - 1;
        for (let attempt = 0; attempt < 80; attempt++) {
            const start = lMin + Math.floor(Math.random() * Math.max(1, lMax - lMin + 1));
            const span = minSpan + Math.floor(Math.random() * Math.max(1, maxSpan - minSpan + 1));
            const end = start + span;
            if (end < boardSize && !usedPositions.has(start) && !usedPositions.has(end) &&
                Math.floor((end - 1) / cols) > Math.floor((start - 1) / cols)) {
                ladders.push({ start, end });
                usedPositions.add(start);
                usedPositions.add(end);
                break;
            }
        }

        // Snake: one per zone
        const sMin = sStartMin + z * sSlot;
        const sMax = z === count - 1 ? sStartMax : sMin + sSlot - 1;
        for (let attempt = 0; attempt < 80; attempt++) {
            const start = sMin + Math.floor(Math.random() * Math.max(1, sMax - sMin + 1));
            const span = minSpan + Math.floor(Math.random() * Math.max(1, Math.min(maxSpan, start - 2) - minSpan + 1));
            const end = start - span;
            if (end > 1 && !usedPositions.has(start) && !usedPositions.has(end) &&
                Math.floor((end - 1) / cols) < Math.floor((start - 1) / cols)) {
                snakes.push({ start, end });
                usedPositions.add(start);
                usedPositions.add(end);
                break;
            }
        }
    }

    if (ladders.length < count || snakes.length < count) {
        console.warn(`generateRandomBoard: only placed ${ladders.length} ladders and ${snakes.length} snakes`);
    }

    return { ladders, snakes };
};

interface Props { isFullscreen: boolean; onGoHome?: () => void; }

const STAR_PATH = (() => {
    const size = 30, cx = 15, cy = 15, outerR = 14, innerR = outerR * 0.48, pts = 8;
    let d = '';
    for (let i = 0; i < pts * 2; i++) {
        const angle = (i * Math.PI) / pts - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        d += (i === 0 ? 'M' : 'L') + `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)} `;
    }
    return d + 'Z';
})();

const StarBadge: React.FC<{ value: number; size?: number }> = ({ value, size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 30 30" style={{ display: 'block' }}>
        <path d={STAR_PATH} fill="#FFA000" />
        <text x={15} y={15.5} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fontWeight="900" fill="white" fontFamily="Poppins, sans-serif">
            +{value}
        </text>
    </svg>
);

const SnakesAndLaddersGame: React.FC<Props> = ({ isFullscreen, onGoHome }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'FINISHED'>('SETUP');
    const [teamCount, setTeamCount] = useState(2);
    const [players, setPlayers] = useState<{ id: number; name: string; position: number; score: number; color: string }[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [diceValue, setDiceValue] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [snakeCoords, setSnakeCoords] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
    const [ladderCoords, setLadderCoords] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
    const [snakePalettes, setSnakePalettes] = useState<SnakePalette[]>([]);
    const [cellSize, setCellSize] = useState(60);
    const [gridSize, setGridSize] = useState(10);
    const boardSize = gridSize * gridSize;
    const boardRef = useRef<HTMLDivElement>(null);
    const [boardMounted, setBoardMounted] = useState(false);
    const boardCallbackRef = useCallback((el: HTMLDivElement | null) => {
        boardRef.current = el;
        setBoardMounted(!!el);
    }, []);
    const cellsRef = useRef<Record<number, HTMLDivElement | null>>({});
    const [snakes, setSnakes] = useState<{ start: number; end: number }[]>([]);
    const [ladders, setLadders] = useState<{ start: number; end: number }[]>([]);
    const [cellPoints, setCellPoints] = useState<Record<number, number>>({});
    const [questions, setQuestions] = useState<{ id: number; q: string; a: string }[]>(() => {
        const saved = localStorage.getItem('snakes_questions');
        return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    });
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: string } | null>(null);
    const [pendingMove, setPendingMove] = useState<{ type: string; target: number; start: number; revert: number } | null>(null);
    const [showTeacherMode, setShowTeacherMode] = useState(false);
    const [showDiceZoom, setShowDiceZoom] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ q: '', a: '' });
    const [setName, setSetName] = useState('');
    const [savedSets, setSavedSets] = useState<{ name: string; questions: { id: number; q: string; a: string }[] }[]>(() => {
        const saved = localStorage.getItem('snakes_question_sets');
        return saved ? JSON.parse(saved) : [];
    });

    const calculateCoords = useCallback(() => {
        if (!boardRef.current) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        const cs = boardRect.width / gridSize;
        setCellSize(cs);

        const getCellCenter = (num: number) => {
            const cell = cellsRef.current[num];
            if (!cell) return null;
            const rect = cell.getBoundingClientRect();
            return {
                x: rect.left - boardRect.left + rect.width / 2,
                y: rect.top - boardRect.top + rect.height / 2,
            };
        };

        const sc = snakes.map(s => {
            const head = getCellCenter(s.start);
            const tail = getCellCenter(s.end);
            return head && tail ? { x1: head.x, y1: head.y, x2: tail.x, y2: tail.y } : null;
        }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

        const lc = ladders.map(l => {
            const bottom = getCellCenter(l.start);
            const top = getCellCenter(l.end);
            return bottom && top ? { x1: bottom.x, y1: bottom.y, x2: top.x, y2: top.y } : null;
        }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

        setSnakeCoords(sc);
        setLadderCoords(lc);
    }, [snakes, ladders, gridSize]);

    useLayoutEffect(() => {
        if (gameState === 'PLAYING' && boardMounted) {
            calculateCoords();
            window.addEventListener('resize', calculateCoords);
            return () => window.removeEventListener('resize', calculateCoords);
        }
    }, [gameState, ladders, snakes, boardMounted, calculateCoords]);

    const startGame = () => {
        const { snakes: ns, ladders: nl } = generateRandomBoard(boardSize, gridSize);
        setSnakes(ns); setLadders(nl);
        setSnakeCoords([]);
        setLadderCoords([]);
        const shuffled = [...SNAKE_PALETTES].sort(() => Math.random() - 0.5);
        setSnakePalettes(shuffled.slice(0, ns.length));
        const points: Record<number, number> = {};
        for (let i = 2; i < boardSize; i++) {
            if (Math.random() > 0.6) { const vals = [1, 2, 3, 5]; points[i] = vals[Math.floor(Math.random() * vals.length)]; }
        }
        setCellPoints(points);
        const newPlayers = Array.from({ length: teamCount }, (_, i) => ({ id: i, name: `Player ${i + 1}`, position: 1, score: 0, color: PLAYER_COLORS[i] }));
        setPlayers(newPlayers);
        setCurrentPlayer(0);
        setDiceValue(null);
        setGameState('PLAYING');
        soundManager.play('start');
    };

    const rollDice = () => {
        if (gameState === 'FINISHED' || isRolling || isMoving) return;
        soundManager.play('click');
        setShowDiceZoom(false);
        setIsRolling(true);
    };

    const handleDiceRollComplete = async (value: number) => {
        setIsRolling(false);
        setDiceValue(value);
        setShowDiceZoom(true);
        soundManager.play('pop');
        movePlayer(value);
    };

    const movePlayer = async (steps: number) => {
        setIsMoving(true);
        const player = players[currentPlayer];
        const targetPos = Math.min(player.position + steps, boardSize);
        await new Promise(r => setTimeout(r, 500));
        updatePlayerPosition(currentPlayer, targetPos);
        soundManager.play('pop');
        await new Promise(r => setTimeout(r, 600));
        checkSpecial(targetPos, player.position);
    };

    const checkSpecial = async (pos: number, oldPos: number) => {
        const ladder = ladders.find(l => l.start === pos);
        const snake = snakes.find(s => s.start === pos);
        if (cellPoints[pos]) {
            setPlayers(prev => { const next = [...prev]; next[currentPlayer].score += cellPoints[pos]; return next; });
        }
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQuestion(randomQ);
        const newPendingMove = {
            type: snake ? 'snake' : ladder ? 'ladder' : 'normal',
            target: ladder ? ladder.end : snake ? snake.end : pos,
            start: pos, revert: oldPos,
        };
        setPendingMove(newPendingMove);
        setShowQuestionModal(true);
    };

    const handleQuestionAnswer = async (correct: boolean) => {
        setShowQuestionModal(false);
        const move = pendingMove;
        setPendingMove(null);
        if (move?.type === 'ladder') {
            if (correct) { soundManager.play('correct'); await new Promise(r => setTimeout(r, 500)); updatePlayerPosition(currentPlayer, move.target); finishTurn(move.target); }
            else { soundManager.play('wrong'); finishTurn(move.start); }
        } else if (move?.type === 'snake') {
            if (correct) { soundManager.play('correct'); finishTurn(move.start); }
            else { soundManager.play('wrong'); await new Promise(r => setTimeout(r, 500)); updatePlayerPosition(currentPlayer, move.target); finishTurn(move.target); }
        } else {
            if (correct) { soundManager.play('correct'); finishTurn(move?.target ?? 0); }
            else { soundManager.play('wrong'); await new Promise(r => setTimeout(r, 500)); updatePlayerPosition(currentPlayer, move?.revert ?? 0); finishTurn(move?.revert ?? 0); }
        }
    };

    const finishTurn = (pos: number) => {
        if (pos === boardSize) {
            soundManager.play('win');
            confetti({ particleCount: 200, spread: 100 });
            setGameState('FINISHED');
            setIsMoving(false);
        } else {
            setIsMoving(false);
            setCurrentPlayer(prev => (prev + 1) % teamCount);
        }
    };

    const updatePlayerPosition = (pIndex: number, newPos: number) => {
        setPlayers(prev => { const next = [...prev]; next[pIndex] = { ...next[pIndex], position: newPos }; return next; });
    };

    const saveSet = () => {
        if (!setName.trim() || questions.length === 0) return;
        const updated = [...savedSets, { name: setName.trim(), questions }];
        setSavedSets(updated);
        localStorage.setItem('snakes_question_sets', JSON.stringify(updated));
        setSetName('');
    };

    const loadSet = (set: { name: string; questions: { id: number; q: string; a: string }[] }) => {
        setQuestions(set.questions);
        localStorage.setItem('snakes_questions', JSON.stringify(set.questions));
    };

    const deleteSet = (index: number) => {
        const updated = savedSets.filter((_, i) => i !== index);
        setSavedSets(updated);
        localStorage.setItem('snakes_question_sets', JSON.stringify(updated));
    };

    const gridCells: number[] = [];
    for (let row = gridSize - 1; row >= 0; row--) {
        const start = row * gridSize + 1;
        const layer = Array.from({ length: gridSize }, (_, i) => start + i);
        if (row % 2 !== 0) layer.reverse();
        gridCells.push(...layer);
    }

    return (
        <div style={{ width: '100%', height: '100%', background: TT.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}>
            <TTGameHeader
                color={ACCENT}
                left={<span style={{ fontWeight: 900, fontSize: '1.05em', color: ACCENT }}>SNAKES & LADDERS</span>}
                center={
                    gameState === 'PLAYING' && players[currentPlayer] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: players[currentPlayer].color, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.9em', color: TT.text }}>Turn: <strong style={{ color: players[currentPlayer].color }}>{players[currentPlayer].name}</strong></span>
                        </div>
                    ) : null
                }
                right={
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', paddingRight: (isFullscreen && onGoHome) ? '52px' : 0 }}>
                        <TTBtn onClick={() => setShowScoreboard(true)} variant="yellow" size="sm">🏅</TTBtn>
                        <TTBtn onClick={() => setShowTeacherMode(true)} variant="default" size="sm" icon={<Settings size={16} />} />
                        <TTBtn onClick={() => setGameState('SETUP')} variant="pink" size="sm" icon={<RefreshCw size={16} />} />
                    </div>
                }
            />

            {isFullscreen && onGoHome && (
                <button onClick={onGoHome} title="Exit Fullscreen"
                    style={{ position: 'fixed', top: 10, right: 14, zIndex: 100, width: 36, height: 36, borderRadius: '50%', padding: 0, fontSize: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3d6cb5', background: 'linear-gradient(to bottom, #ffffff, #fffde7)', border: '3px solid #FDD835', boxShadow: '0 4px 0 #F9A825, 0 4px 8px rgba(0,0,0,0.12)', transition: 'transform 0.1s, box-shadow 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 0 #F9A825, 0 6px 12px rgba(0,0,0,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 #F9A825, 0 4px 8px rgba(0,0,0,0.12)'; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 1px 0 #F9A825, 0 2px 4px rgba(0,0,0,0.1)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 0 #F9A825, 0 6px 12px rgba(0,0,0,0.15)'; }}
                >✕</button>
            )}

            <AnimatePresence mode="wait">
                {gameState === 'SETUP' ? (
                    <motion.div key="setup"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    >
                        <TTCard style={{ width: '100%', maxWidth: '460px' }}>
                            <TTHeader text="SNAKES & LADDERS" color={ACCENT} icon={<TrendingUp size={18} />} />
                            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Board Size</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                                        {[5, 7, 8, 10].map(n => (
                                            <TTBtn key={n} onClick={() => setGridSize(n)} variant={gridSize === n ? "green" : "default"} style={{ opacity: gridSize !== n ? 0.6 : 1 }}>{n}×{n}</TTBtn>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="number" min={3} max={12} step={1}
                                            value={gridSize}
                                            onChange={e => {
                                                const v = parseInt(e.target.value) || 3;
                                                setGridSize(Math.max(3, Math.min(12, v)));
                                            }}
                                            style={{ flex: 1, background: 'white', border: `2px solid ${TT.border}`, borderRadius: '10px', padding: '8px 12px', fontSize: '0.9em', fontWeight: 700, color: TT.text, outline: 'none', fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}
                                        />
                                        <span style={{ fontSize: '0.75em', color: TT.textLight, fontWeight: 600, whiteSpace: 'nowrap' }}>{gridSize}×{gridSize} = {boardSize} spaces</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Select Players</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {[2, 3, 4].map(count => (
                                            <TTBtn key={count} onClick={() => setTeamCount(count)} variant={teamCount === count ? "green" : "default"} style={{ opacity: teamCount !== count ? 0.6 : 1 }}>{count}</TTBtn>
                                        ))}
                                    </div>
                                </div>
                                <TTBtn onClick={startGame} variant="green" size="xl" style={{ width: '100%' }}>START GAME</TTBtn>
                            </div>
                        </TTCard>
                    </motion.div>
                ) : (
                    <div key="playing" style={{ flex: 1, display: 'flex', gap: '8px', padding: '8px', overflow: 'hidden' }}>
                        {/* Left: Players + Dice */}
                        <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                            <TTCard style={{ flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <TTHeader text="PLAYERS" color={ACCENT} size="sm" />
                                <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {players.map((p, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '10px',
                                            background: i === currentPlayer ? 'white' : 'rgba(0,0,0,0.04)',
                                            border: `1px solid ${i === currentPlayer ? '#FDD835' : 'transparent'}`,
                                            boxShadow: i === currentPlayer ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                            transition: 'all 0.3s',
                                        }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: p.color, border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <User size={14} style={{ color: 'white' }} />
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.1em', color: i === currentPlayer ? TT.text : TT.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                <span style={{ fontSize: '2em', fontWeight: 900, color: '#F9A825', background: '#FFF9C4', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '3px' }}>+{p.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TTCard>

                            <div style={{ height: '170px', flexShrink: 0, position: 'relative', zIndex: 20 }}>
                                <TTCard style={{ width: '100%', height: '100%', padding: 0, overflow: 'visible', background: '#263238', cursor: 'pointer' }} onClick={rollDice}>
                                    <ThreeDice rolling={isRolling} onResult={handleDiceRollComplete} zoom={showDiceZoom} />
                                    {!isRolling && !isMoving && gameState !== 'FINISHED' && (
                                        <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
                                            <span style={{ padding: '2px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: '20px', fontSize: '0.65em', color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tap to Roll</span>
                                        </div>
                                    )}
                                </TTCard>
                            </div>
                        </div>

                        {/* Right: Board */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <TTCard style={{ padding: '6px', background: '#FAFAFA', width: '100%', aspectRatio: '1', maxHeight: '100%', maxWidth: '100%', alignSelf: 'center' }}>
                                <div ref={boardCallbackRef} className="w-full h-full relative rounded-lg overflow-hidden"
                                    style={{ background: '#F0F0F0', border: '1px solid #E0E0E0', display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
                                    <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible">
                                        <defs>
                                            <filter id="woodGrain" x="-5%" y="-5%" width="110%" height="110%">
                                                <feTurbulence type="fractalNoise" baseFrequency="0.02 0.8"
                                                    numOctaves="3" seed="5" result="noise" />
                                                <feColorMatrix in="noise" type="matrix"
                                                    values="0 0 0 0 0.55  0 0 0 0 0.37  0 0 0 0 0.24  0 0 0 0.28 0"
                                                    result="coloredNoise" />
                                                <feComposite in="coloredNoise" in2="SourceGraphic"
                                                    operator="in" result="maskedNoise" />
                                                <feBlend in="SourceGraphic" in2="maskedNoise" mode="multiply" />
                                            </filter>
                                        </defs>
                                        {ladderCoords.map((c, i) => (
                                            <LadderSVG key={`ladder-${i}`}
                                                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                                                cellSize={cellSize}
                                            />
                                        ))}
                                        {snakeCoords.map((c, i) => (
                                            <SnakeSVG key={`snake-${i}`}
                                                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                                                cellSize={cellSize}
                                                palette={snakePalettes[i] ?? SNAKE_PALETTES[0]}
                                            />
                                        ))}
                                    </svg>

                                    {gridCells.map(num => (
                                        <div key={num} ref={el => { cellsRef.current[num] = el; }}
                                            className="relative flex items-center justify-center"
                                            style={{
                                                borderRight: '0.5px solid #E0E0E0',
                                                borderBottom: '0.5px solid #E0E0E0',
                                                background: num === boardSize ? '#FFF9C4'
                                                    : num === 1 ? '#C8E6C9'
                                                    : Math.floor((num - 1) / gridSize) % 2 === 0 ? '#FFFDE7'
                                                    : 'white',
                                            }}>
                                            <span style={{
                                                fontWeight: 900,
                                                fontSize: 'clamp(11px, 2.5vw, 24px)',
                                                color: num === boardSize ? '#F9A825' : num === 1 ? '#2E7D32' : '#5D4037',
                                                letterSpacing: '-0.02em',
                                            }}>
                                                {num}
                                            </span>
                                            {cellPoints[num] && (
                                                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                                                    <StarBadge value={cellPoints[num]} size={Math.floor(Math.min(Math.max(cellSize * 0.6, 28), 50))} />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="absolute inset-0 w-full h-full pointer-events-none"
                                        style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
                                        {gridCells.map(num => (
                                            <div key={`p-${num}`} className="relative flex items-center justify-center">
                                                <div className="flex flex-wrap justify-center items-center w-full h-full p-0.5 gap-0.5">
                                                    {players.filter(p => p.position === num).map(p => (
                                                        <motion.div
                                                            layoutId={`player-${p.id}`}
                                                            key={p.id}
                                                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 border-white z-20"
                                                            style={{ backgroundColor: p.color, boxShadow: `0 2px 6px ${p.color}66`, position: 'relative', flexShrink: 0 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                        >
                                                            {players[currentPlayer]?.id === p.id && (
                                                                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-50" />
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TTCard>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                {gameState === 'FINISHED' && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: '400px' }}>
                            <TTCard style={{ border: '3px solid #FDD835' }}>
                                <TTHeader text="WINNER!" color="#E53935" />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontSize: '5em' }}>🏆</div>
                                    <div style={{ background: TT.bg, borderRadius: '16px', padding: '12px 40px', border: `3px solid ${players[currentPlayer]?.color ?? ACCENT}` }}>
                                        <p style={{ fontSize: '1.8em', fontWeight: 900, color: players[currentPlayer]?.color ?? ACCENT }}>{players[currentPlayer]?.name}</p>
                                    </div>
                                    <TTBtn onClick={startGame} variant="green" size="xl" style={{ width: '100%' }}>Play Again</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Question Modal */}
            <AnimatePresence>
                {showQuestionModal && currentQuestion && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: '460px' }}>
                            <TTCard>
                                <TTHeader
                                    text={pendingMove?.type === 'ladder' ? 'LADDER CHALLENGE!' : pendingMove?.type === 'snake' ? 'SNAKE DEFENSE!' : 'MOVEMENT CHALLENGE!'}
                                    color={pendingMove?.type === 'ladder' ? '#43A047' : pendingMove?.type === 'snake' ? '#E53935' : '#1E88E5'}
                                />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h2 style={{ fontSize: '1.5em', fontWeight: 900, color: TT.text, textAlign: 'center', lineHeight: 1.3 }}>{currentQuestion.q}</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <TTBtn onClick={() => handleQuestionAnswer(true)} variant="green" size="lg" icon={<Check size={22} />}>Correct</TTBtn>
                                        <TTBtn onClick={() => handleQuestionAnswer(false)} variant="red" size="lg" icon={<X size={22} />}>Wrong</TTBtn>
                                    </div>
                                    <div style={{ background: TT.bg, padding: '12px 16px', borderRadius: '12px', border: `1px solid ${TT.border}`, textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.7em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Answer</p>
                                        <p className="blur-md hover:blur-none transition-all cursor-help" style={{ fontSize: '1.1em', fontWeight: 700, color: TT.text }}>{currentQuestion.a}</p>
                                    </div>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Teacher Mode Modal */}
            <AnimatePresence>
                {showTeacherMode && (
                    <TTModal onClick={() => setShowTeacherMode(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <TTCard style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                                <TTHeader text="EDIT QUESTIONS" color={ACCENT} icon={<Settings size={16} />} />
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflow: 'hidden' }}>
                                    <div style={{ background: '#F5F5F5', padding: '14px', borderRadius: '12px', border: '1px solid #E0E0E0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                            <input value={newQuestion.q} onChange={e => setNewQuestion({ ...newQuestion, q: e.target.value })} placeholder="Question"
                                                style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '10px 12px', color: TT.text, outline: 'none', fontFamily: 'Poppins, sans-serif' }} />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input value={newQuestion.a} onChange={e => setNewQuestion({ ...newQuestion, a: e.target.value })} placeholder="Answer"
                                                    style={{ flex: 1, background: 'white', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '10px 12px', color: TT.text, outline: 'none', fontFamily: 'Poppins, sans-serif' }} />
                                                <TTBtn onClick={() => { if (newQuestion.q && newQuestion.a) { const u = [...questions, { ...newQuestion, id: Date.now() }]; setQuestions(u); localStorage.setItem('snakes_questions', JSON.stringify(u)); setNewQuestion({ q: '', a: '' }); } }}
                                                    disabled={!newQuestion.q || !newQuestion.a} variant="green" size="sm">ADD</TTBtn>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                        {/* Save / Load Set */}
                                        <div style={{ background: '#E8F5E9', padding: '12px', borderRadius: '12px', border: '2px solid #C8E6C9', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: '#1B5E20', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Save as Set</label>
                                            {/* Load row */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select
                                                    defaultValue=""
                                                    onChange={e => { const s = savedSets.find(x => x.name === e.target.value); if (s) loadSet(s); e.target.value = ''; }}
                                                    style={{ flex: 1, minWidth: 0, background: 'white', border: '2px solid #A5D6A7', borderRadius: '10px', padding: '8px 12px', color: TT.text, fontWeight: 700, outline: 'none', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                                >
                                                    <option value="" disabled>Load a saved set…</option>
                                                    {savedSets.map((s, i) => <option key={i} value={s.name}>{s.name} ({s.questions.length} questions)</option>)}
                                                </select>
                                                <TTBtn
                                                    onClick={() => { const i = savedSets.findIndex(s => s.name === setName.trim()); if (i >= 0) deleteSet(i); else alert('Enter the set name to delete.'); }}
                                                    variant="red" size="sm" icon={<Trash2 size={12} />}
                                                />
                                            </div>
                                            {/* Save row */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input value={setName} onChange={e => setSetName(e.target.value)} placeholder="Set name…"
                                                    onKeyDown={e => { if (e.key === 'Enter') saveSet(); }}
                                                    style={{ flex: 1, minWidth: 0, background: 'white', border: '2px solid #A5D6A7', borderRadius: '10px', padding: '8px 12px', color: TT.text, fontWeight: 700, outline: 'none', fontFamily: 'Poppins, sans-serif' }} />
                                                <TTBtn onClick={saveSet} disabled={!setName.trim() || questions.length === 0} variant="green" size="sm" icon={<BookMarked size={14} />}>Save</TTBtn>
                                            </div>
                                            {questions.length === 0 && <p style={{ margin: 0, fontSize: '0.72em', color: '#388E3C' }}>Add questions above before saving a set.</p>}
                                        </div>

                                        {/* Current Questions */}
                                        <div style={{ flexShrink: 0 }}>
                                        <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                                            Current Questions {questions.length > 0 && `(${questions.length})`}
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {questions.map((q, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E0E0E0' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: TT.text, fontSize: '0.9em' }}>{q.q}</div>
                                                    <div style={{ fontWeight: 700, color: ACCENT, fontSize: '0.8em' }}>A: {q.a}</div>
                                                </div>
                                                <button onClick={() => { const u = questions.filter((_, idx) => idx !== i); setQuestions(u); localStorage.setItem('snakes_questions', JSON.stringify(u)); }}
                                                    style={{ padding: '4px 10px', fontSize: '0.72em', fontWeight: 700, color: '#EF5350', background: '#FFEBEE', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                                                    DELETE
                                                </button>
                                            </div>
                                        ))}
                                        </div>
                                        </div>

                                    </div>
                                </div>
                                <div style={{ padding: '12px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end' }}>
                                    <TTBtn onClick={() => setShowTeacherMode(false)} variant="green">DONE</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {showScoreboard && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
                    <Scoreboard isFullscreen={true} returnFrom="Snakes & Ladders" onReturnFrom={() => setShowScoreboard(false)} />
                </div>
            )}
        </div>
    );
};

export default SnakesAndLaddersGame;
