import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, RefreshCw, Zap, Check, X as XIcon, RotateCcw } from 'lucide-react';
import { soundManager } from '../games/soundManager';
import { TTBtn, TTCard, TTHeader, TTGameHeader, TeamBadge, TTModal, TT } from '../games/TTGameComponents';
import confetti from 'canvas-confetti';

interface Props { isFullscreen: boolean; }

const QUESTIONS = [
    "What is the past tense of 'go'?", "Name three colors.", "How do you say 'arigato' in English?",
    "What day is today?", "Spell 'Friend'.", "What is 5 + 5?", "Name a fruit.", "Opposite of 'Hot'?",
    "Count to 10.", "What time is it?", "Name a vegetable.", "Spell 'School'.", "Do you like Natto?",
    "What is your favorite food?", "Name an animal.", "Opposite of 'Big'?", "What comes after Tuesday?",
    "Spell 'Happy'.", "How are you?", "Name a sport.", "What color is a banana?", "Say hello!",
    "Touch your head.", "Clap your hands.", "Stand up!"
];

const ACCENT = '#E53935';

const TornadoGame: React.FC<Props> = ({ isFullscreen }) => {
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'gameover'>('setup');
    const [muted, setMuted] = useState(soundManager.muted);
    const [isShaking, setIsShaking] = useState(false);
    const [questions, setQuestions] = useState<string[]>(() => {
        const saved = localStorage.getItem('tornado_all_questions');
        return saved ? JSON.parse(saved) : [...QUESTIONS];
    });
    const [showEditor, setShowEditor] = useState(false);
    const [newQ, setNewQ] = useState('');
    const [numTeams, setNumTeams] = useState(2);
    const [gridSize, setGridSize] = useState(5);
    const [teams, setTeams] = useState<{ id: number; name: string; score: number; color: string }[]>([]);
    const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
    const [grid, setGrid] = useState<any[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
    const confettiFire = useRef<confetti.CreateTypes | null>(null);
    const [boardSize, setBoardSize] = useState(0);
    const [activeModal, setActiveModal] = useState<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const s = window.getComputedStyle(containerRef.current);
                const px = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
                const py = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
                setBoardSize(Math.max(0, Math.min(clientWidth - px, clientHeight - py)));
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        const obs = new ResizeObserver(entries => {
            for (const e of entries) setBoardSize(Math.max(0, Math.min(e.contentRect.width, e.contentRect.height)));
        });
        obs.observe(containerRef.current);
        return () => { obs.disconnect(); window.removeEventListener('resize', updateSize); };
    }, [gameState]);

    // Create confetti bound to the in-component canvas (works inside Fullscreen API)
    useEffect(() => {
        if (gameState === 'playing' && confettiCanvasRef.current) {
            confettiFire.current = confetti.create(confettiCanvasRef.current, { resize: true });
        }
        return () => { confettiFire.current?.reset(); confettiFire.current = null; };
    }, [gameState]);

    const saveQuestions = (q: string[]) => {
        setQuestions(q);
        localStorage.setItem('tornado_all_questions', JSON.stringify(q));
    };

    const toggleMute = () => { const m = soundManager.toggleMute(); setMuted(m); };

    const startGame = () => {
        soundManager.play('start');
        const COLORS = ['#F43F5E', '#06B6D4', '#EAB308', '#8B5CF6'];
        const newTeams = Array(numTeams).fill(0).map((_, i) => ({ id: i, name: `Team ${i + 1}`, score: 0, color: COLORS[i] }));
        setTeams(newTeams);
        setCurrentTeamIdx(0);
        const total = gridSize * gridSize;
        const specials = generateSpecials(total);
        const newGrid = Array(total).fill(null).map((_, i) => ({
            id: i, number: i + 1, type: specials[i] || 'bonus',
            points: specials[i] === 'bonus1' ? 1 : specials[i] === 'bonus2' ? 2 : specials[i] === 'bonus5' ? 5 : specials[i] === 'penalty1' ? -1 : 0,
            revealed: false
        }));
        setGrid(newGrid); setRevealedCount(0); setGameState('playing');
    };

    const generateSpecials = (total: number) => {
        const counts = { tornado: Math.floor(total / 8), bonus5: Math.floor(total / 12), switch: Math.floor(total / 15), penalty1: Math.floor(total / 10) };
        let types: string[] = [];
        Object.entries(counts).forEach(([t, c]) => types.push(...Array(c).fill(t)));
        while (types.length < total) types.push(Math.random() > 0.7 ? 'bonus2' : 'bonus1');
        return types.sort(() => Math.random() - 0.5);
    };

    const handleSquareClick = (square: any) => {
        if (square.revealed || activeModal) return;
        soundManager.play('click');
        const pool = questions.length > 0 ? questions : QUESTIONS;
        const q = pool[Math.floor(Math.random() * pool.length)];
        setActiveModal({ type: 'question', data: { text: q, square } });
    };

    const handleAnswer = (correct: boolean) => {
        if (!activeModal) return;
        const { square } = activeModal.data;
        if (!correct) { revealSquare(square.id, false); soundManager.play('wrong'); closeModal(); nextTurn(); return; }
        closeModal(); revealSquare(square.id, true);
        triggerEffect(grid[square.id]);
    };

    const revealSquare = (id: number, success: boolean) => {
        setGrid(prev => prev.map(sq => sq.id === id ? { ...sq, revealed: true, success } : sq));
        setRevealedCount(c => c + 1);
    };

    const triggerEffect = (square: any) => {
        const team = teams[currentTeamIdx];
        let delay = 2000;
        switch (square.type) {
            case 'tornado':
                soundManager.play('tornado'); setIsShaking(true); setTimeout(() => setIsShaking(false), 1000);
                setActiveModal({ type: 'tornado', data: { team: team.name, color: team.color } });
                updateScore(currentTeamIdx, -team.score); break;
            case 'switch':
                soundManager.play('switch'); setActiveModal({ type: 'switch', data: {} }); rotateScores(); break;
            case 'bonus5':
                soundManager.play('bonus');
                confettiFire.current?.({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                setActiveModal({ type: 'special', data: { text: 'Huge Bonus!', sub: '+5 Points', icon: '🌟' } });
                updateScore(currentTeamIdx, 5); break;
            case 'penalty1':
                soundManager.play('penalty'); setIsShaking(true); setTimeout(() => setIsShaking(false), 500);
                setActiveModal({ type: 'special', data: { text: 'Oh no!', sub: '-1 Point', icon: '💣' } });
                updateScore(currentTeamIdx, -1); break;
            default:
                const pts = square.type === 'bonus2' ? 2 : 1;
                soundManager.play('correct');
                confettiFire.current?.({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: [team.color, '#ffffff'] });
                updateScore(currentTeamIdx, pts); delay = 500; break;
        }
        setTimeout(() => { closeModal(); checkGameOver() || nextTurn(); }, delay);
    };

    const updateScore = (idx: number, delta: number) => setTeams(prev => prev.map((t, i) => i === idx ? { ...t, score: Math.max(0, t.score + delta) } : t));
    const rotateScores = () => setTeams(prev => { const s = prev.map(t => t.score); const last = s.pop()!; s.unshift(last); return prev.map((t, i) => ({ ...t, score: s[i] })); });
    const closeModal = () => setActiveModal(null);
    const nextTurn = () => setCurrentTeamIdx(prev => (prev + 1) % numTeams);
    const checkGameOver = () => { if (revealedCount >= grid.length - 1) { setGameState('gameover'); soundManager.play('gameover'); return true; } return false; };

    const cellSize = boardSize > 0 ? boardSize / gridSize : 40;
    const numberFs = `${Math.max(12, Math.min(cellSize * 0.38, 64))}px`;
    const modalWidth = isFullscreen ? '80vw' : '90vw';
    const modalMax = isFullscreen ? '800px' : '600px';
    const qFontSize = isFullscreen ? 'clamp(24px, 4vw, 56px)' : 'clamp(18px, 4vw, 28px)';
    const btnFontSize = isFullscreen ? 'clamp(16px, 2.5vw, 28px)' : undefined;

    // ── SETUP ──────────────────────────────────────────────────────────────────
    if (gameState === 'setup') return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: TT.bg, overflow: 'auto', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box' }}>
            <TTCard style={{ width: '100%', maxWidth: '560px' }}>
                <TTHeader text="🌪️ TORNADO SETUP" color={ACCENT} />
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', fontSize: '0.8em', letterSpacing: '0.08em', marginBottom: '10px' }}>Number of Teams</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            {[2, 3, 4].map(n => (
                                <TTBtn key={n} variant={numTeams === n ? 'red' : 'orange'} onClick={() => setNumTeams(n)} style={{ width: 60, height: 60, fontSize: '1.4em', borderRadius: '50%', padding: 0 }}>{n}</TTBtn>
                            ))}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', fontSize: '0.8em', letterSpacing: '0.08em', marginBottom: '10px' }}>Grid Size</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            {[4, 5, 6].map(n => (
                                <TTBtn key={n} variant={gridSize === n ? 'purple' : 'default'} onClick={() => setGridSize(n)}>{n}×{n}</TTBtn>
                            ))}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                        <TTBtn onClick={startGame} variant="green" size="xl" icon={<Zap size={22} fill="currentColor" />}>START GAME</TTBtn>
                    </div>
                </div>
            </TTCard>
        </div>
    );

    // ── PLAYING ────────────────────────────────────────────────────────────────
    return (
        <motion.div
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: TT.bg, fontFamily: 'Poppins, sans-serif', position: 'relative' }}
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            {/* In-component confetti canvas — works inside the Fullscreen API */}
            <canvas ref={confettiCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} />

            <AnimatePresence>
                {activeModal?.type === 'tornado' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,0,60,0.5)' }} />
                        <motion.div animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
                            style={{ fontSize: '18rem', opacity: 0.35, filter: 'blur(4px)', userSelect: 'none' }}>🌪️</motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TTGameHeader
                color={ACCENT}
                center={
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {teams.map((t, i) => (
                            <motion.div key={t.id} animate={{ scale: currentTeamIdx === i ? 1.08 : 0.95, opacity: currentTeamIdx === i ? 1 : 0.7 }} layout>
                                <TeamBadge name={t.name} score={t.score} color={t.color} active={currentTeamIdx === i} />
                            </motion.div>
                        ))}
                    </div>
                }
                right={
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <TTBtn onClick={toggleMute} variant="orange" size="sm" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</TTBtn>
                        <TTBtn onClick={() => { if (window.confirm('Restart?')) setGameState('setup'); }} variant="red" size="sm" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}><RefreshCw size={16} /></TTBtn>
                        <TTBtn onClick={() => setShowEditor(true)} variant="blue" size="sm" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}><Settings size={16} /></TTBtn>
                    </div>
                }
            />

            <div ref={containerRef} style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflow: 'hidden', minHeight: 0, boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gap: '6px', width: boardSize, height: boardSize, opacity: boardSize > 0 ? 1 : 0, gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
                    {grid.map(sq => <TornadoCard key={sq.id} square={sq} onClick={() => handleSquareClick(sq)} fontSize={numberFs} />)}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {activeModal && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.8, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                            style={{ width: modalWidth, maxWidth: modalMax }}>
                            {activeModal.type === 'question' && (
                                <TTCard>
                                    <TTHeader text="QUESTION" color="#1E88E5" size={isFullscreen ? 'lg' : 'md'} />
                                    <div style={{ padding: isFullscreen ? '40px 48px' : '28px 32px', textAlign: 'center' }}>
                                        <p style={{ fontSize: qFontSize, fontWeight: 900, color: TT.text, marginBottom: '32px', lineHeight: 1.3, wordBreak: 'break-word' }}>{activeModal.data.text}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <TTBtn onClick={() => handleAnswer(true)} variant="green" size="xl" icon={<Check size={isFullscreen ? 28 : 20} />} style={btnFontSize ? { fontSize: btnFontSize } : {}}>CORRECT</TTBtn>
                                            <TTBtn onClick={() => handleAnswer(false)} variant="red" size="xl" icon={<XIcon size={isFullscreen ? 28 : 20} />} style={btnFontSize ? { fontSize: btnFontSize } : {}}>WRONG</TTBtn>
                                        </div>
                                    </div>
                                </TTCard>
                            )}
                            {activeModal.type === 'tornado' && (
                                <TTCard>
                                    <TTHeader text="TORNADO!" color={ACCENT} size={isFullscreen ? 'lg' : 'md'} />
                                    <div style={{ padding: '32px', textAlign: 'center' }}>
                                        <div style={{ fontSize: isFullscreen ? '8em' : '5em' }} className="animate-spin-slow">🌪️</div>
                                        <p style={{ fontSize: isFullscreen ? '1.6em' : '1.2em', fontWeight: 700, color: TT.text, marginTop: '16px' }}>
                                            <span style={{ color: ACCENT, fontWeight: 900 }}>{activeModal.data.team}</span>'s score has been wiped out!
                                        </p>
                                    </div>
                                </TTCard>
                            )}
                            {(activeModal.type === 'special' || activeModal.type === 'switch') && (
                                <TTCard>
                                    <TTHeader text={activeModal.type === 'switch' ? 'SWITCH!' : 'BONUS!'} color={activeModal.type === 'switch' ? '#8E24AA' : '#43A047'} size={isFullscreen ? 'lg' : 'md'} />
                                    <div style={{ padding: '32px', textAlign: 'center' }}>
                                        <div style={{ fontSize: isFullscreen ? '7em' : '5em' }}>{activeModal.data.icon || (activeModal.type === 'switch' ? '🔄' : '🎉')}</div>
                                        <h2 style={{ fontSize: isFullscreen ? '2.8em' : '2em', fontWeight: 900, color: TT.text, margin: '8px 0' }}>{activeModal.data.text}</h2>
                                        {activeModal.data.sub && <p style={{ fontSize: isFullscreen ? '1.8em' : '1.3em', color: TT.textLight, fontWeight: 700 }}>{activeModal.data.sub}</p>}
                                    </div>
                                </TTCard>
                            )}
                        </motion.div>
                    </TTModal>
                )}
                {gameState === 'gameover' && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '90vw', maxWidth: 500 }}>
                            <TTCard>
                                <TTHeader text="GAME OVER" color="#FB8C00" />
                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[...teams].sort((a, b) => b.score - a.score).map((t, i) => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: i === 0 ? '#FFF9C4' : '#f5f5f5', border: i === 0 ? '2px solid #FDD835' : '2px solid transparent' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1em', color: TT.text }}>{i === 0 && '👑'} {t.name}</span>
                                            <span style={{ fontWeight: 900, fontSize: '1.3em', color: TT.text }}>{t.score}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <TTBtn onClick={() => setGameState('setup')} variant="blue" style={{ flex: 1 }}>Menu</TTBtn>
                                        <TTBtn onClick={startGame} variant="green" style={{ flex: 1 }}>Play Again</TTBtn>
                                    </div>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <TTModal>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ width: '90vw', maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                                <TTHeader text="TEACHER MODE" color="#1E88E5" />
                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px', gap: '10px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input value={newQ} onChange={e => setNewQ(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && newQ.trim()) { saveQuestions([...questions, newQ.trim()]); setNewQ(''); } }}
                                            placeholder="Type new question..."
                                            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '2px solid #e0e0e0', fontFamily: 'Poppins, sans-serif', fontSize: '0.95em', outline: 'none' }} />
                                        <TTBtn variant="green" onClick={() => { if (newQ.trim()) { saveQuestions([...questions, newQ.trim()]); setNewQ(''); } }}>ADD</TTBtn>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{questions.length} questions</span>
                                        <TTBtn variant="orange" size="sm" icon={<RotateCcw size={14} />}
                                            onClick={() => { if (window.confirm('Reset to default questions?')) { saveQuestions([...QUESTIONS]); } }}>
                                            Reset Defaults
                                        </TTBtn>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', background: '#f9f9f9', padding: '8px', borderRadius: '10px' }}>
                                        {questions.length === 0 && (
                                            <p style={{ textAlign: 'center', color: '#bbb', fontStyle: 'italic', padding: '20px' }}>No questions. Add one or reset to defaults.</p>
                                        )}
                                        {questions.map((q, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', gap: '8px' }}>
                                                <span style={{ fontWeight: 600, color: TT.text, flex: 1, fontSize: '0.9em' }}>{q}</span>
                                                <TTBtn variant="red" size="sm" onClick={() => saveQuestions(questions.filter((_, idx) => idx !== i))}>DEL</TTBtn>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <TTBtn onClick={() => setShowEditor(false)} variant="blue">DONE</TTBtn>
                                    </div>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Grid Card ──────────────────────────────────────────────────────────────────
const TornadoCard: React.FC<{ square: any; onClick: () => void; fontSize: string }> = ({ square, onClick, fontSize }) => {
    const backColor = square.success === false ? '#e0e0e0'
        : square.type === 'tornado' ? '#880E4F'
        : square.type === 'penalty1' ? '#FFCDD2'
        : square.type === 'switch' ? '#E1BEE7'
        : '#C8E6C9';
    const backTextColor = square.success === false ? '#9e9e9e'
        : square.type === 'tornado' ? 'white'
        : square.type === 'penalty1' ? '#C62828'
        : square.type === 'switch' ? '#6A1B9A'
        : '#2E7D32';

    return (
        <div style={{ perspective: 1000, width: '100%', height: '100%' }}>
            <motion.div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
                animate={{ rotateY: square.revealed ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={!square.revealed ? { scale: 1.06, y: -4 } : {}}
                whileTap={!square.revealed ? { scale: 0.96 } : {}}
                onClick={onClick}
            >
                {/* Front */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '10px', background: 'linear-gradient(135deg, #42A5F5, #1565C0)', border: '3px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 0 #0D47A1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <span style={{ fontSize, fontWeight: 900, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{square.number}</span>
                </div>
                {/* Back */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '10px', background: backColor, border: `3px solid ${backTextColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 900, color: backTextColor }}>
                    {square.success === false ? '❌' : square.type === 'tornado' ? '🌪️' : square.type === 'switch' ? '🔄' : square.type === 'penalty1' ? '💣' : square.points > 0 ? `+${square.points}` : square.points}
                </div>
            </motion.div>
        </div>
    );
};

export default TornadoGame;
