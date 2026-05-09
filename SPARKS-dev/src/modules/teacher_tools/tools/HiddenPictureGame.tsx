import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, Lightbulb, Check, X, Image as ImageIcon, Settings } from 'lucide-react';
import { soundManager } from '../games/soundManager';
import confetti from 'canvas-confetti';
import { TT, TTBtn, TTCard, TTHeader, TTGameHeader, TTModal } from '../games/TTGameComponents';

const ACCENT = '#00897B';

const DEFAULT_SET = {
    name: 'Animals (Sample)',
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    questions: [
        "What color is a banana?", "Name a fruit.", "Count to 5.", "Say hello.",
        "What is it?", "Is it big?", "Can it fly?", "Do you like it?",
        "What sound does a dog make?", "Stand up.", "Sit down.", "Touch your nose.",
        "What is 1 + 1?", "Name a color.", "Spell 'CAT'.", "What time is it?",
        "Do you like pizza?", "Name an animal.", "Touch your head.", "Jump!",
        "Spin around.", "Clap your hands.", "Wink.", "Smile!",
        "Say 'Thank you'.", "Count to 10.",
    ],
};

const GRID_PRESETS = [
    { label: 'Easy',   value: '3x2',  cols: 3,  rows: 2 },
    { label: 'Normal', value: '5x4',  cols: 5,  rows: 4 },
    { label: 'Hard',   value: '8x6',  cols: 8,  rows: 6 },
    { label: 'Expert', value: '10x8', cols: 10, rows: 8 },
];

const TEAM_COLORS = ['#1E88E5', '#E53935', '#43A047', '#F9A825'];

interface Props { isFullscreen: boolean; onGoToScoreboard?: () => void; }

const HiddenPictureGame: React.FC<Props> = ({ onGoToScoreboard }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'FINISHED'>('SETUP');

    // Grid config
    const [gridPreset, setGridPreset] = useState('5x4');
    const [gridCols, setGridCols] = useState(5);
    const [gridRows, setGridRows] = useState(4);
    const [customCols, setCustomCols] = useState(5);
    const [customRows, setCustomRows] = useState(4);

    // Reveal mode
    const [revealMode, setRevealMode] = useState<'manual' | 'auto' | 'custom'>('manual');
    const [customSpeed, setCustomSpeed] = useState(2);
    const [askQuestions, setAskQuestions] = useState(true);

    // Game
    const [teamCount, setTeamCount] = useState(2);
    const [teams, setTeams] = useState<{ name: string; score: number }[]>([]);
    const [currentTeam, setCurrentTeam] = useState(0);
    const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
    const [activeTile, setActiveTile] = useState<{ index: number; question: string } | null>(null);
    const [guessing, setGuessing] = useState(false);
    const [customImages, setCustomImages] = useState<string[]>(() => {
        const saved = localStorage.getItem('hidden_picture_queue');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [showEditor, setShowEditor] = useState(false);
    const [newImageInput, setNewImageInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const unrevealedRef = useRef<number[]>([]);

    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    const totalTiles = gridCols * gridRows;
    const currentImg = customImages.length > 0 ? customImages[currentImageIdx] : DEFAULT_SET.image;

    const stopAutoReveal = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };

    const startAutoReveal = (cols: number, rows: number) => {
        const speed = revealMode === 'auto' ? 2000 : Math.max(500, (customSpeed || 2) * 1000);
        const all = Array.from({ length: cols * rows }, (_, i) => i);
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }
        unrevealedRef.current = all;
        intervalRef.current = setInterval(() => {
            if (unrevealedRef.current.length === 0) {
                stopAutoReveal();
                soundManager.play('win');
                confetti({ particleCount: 200, spread: 100 });
                setGameState('FINISHED');
                return;
            }
            const idx = unrevealedRef.current.pop()!;
            setRevealedTiles(prev => [...prev, idx]);
            soundManager.play('pop');
        }, speed);
    };

    const startGame = () => {
        stopAutoReveal();
        const cols = gridPreset === 'custom' ? customCols : gridCols;
        const rows = gridPreset === 'custom' ? customRows : gridRows;
        setGridCols(cols);
        setGridRows(rows);
        setTeams(Array.from({ length: teamCount }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 })));
        setCurrentTeam(0);
        setRevealedTiles([]);
        setGameState('PLAYING');
        soundManager.play('start');
        if (revealMode !== 'manual') startAutoReveal(cols, rows);
    };

    const handleTileClick = (index: number) => {
        if (gameState !== 'PLAYING' || revealedTiles.includes(index) || revealMode !== 'manual') return;
        if (!askQuestions) {
            soundManager.play('pop');
            setRevealedTiles(prev => {
                const next = [...prev, index];
                if (next.length === totalTiles) {
                    soundManager.play('win');
                    confetti({ particleCount: 200, spread: 100 });
                    setTimeout(() => setGameState('FINISHED'), 500);
                }
                return next;
            });
            setCurrentTeam(prev => (prev + 1) % teamCount);
            return;
        }
        setActiveTile({ index, question: DEFAULT_SET.questions[index % DEFAULT_SET.questions.length] });
        soundManager.play('pop');
    };

    const handleAnswer = (correct: boolean) => {
        if (!activeTile) return;
        if (correct) {
            soundManager.play('correct');
            setTeams(prev => { const t = [...prev]; t[currentTeam].score += 10; return t; });
            setRevealedTiles(prev => {
                const next = [...prev, activeTile.index];
                if (next.length === totalTiles) {
                    soundManager.play('win');
                    confetti({ particleCount: 200, spread: 100 });
                    setGameState('FINISHED');
                }
                return next;
            });
        } else {
            soundManager.play('wrong');
        }
        setActiveTile(null);
        setCurrentTeam(prev => (prev + 1) % teamCount);
    };

    const handleGuessReveal = () => {
        stopAutoReveal();
        setTeams(prev => { const t = [...prev]; t[currentTeam].score += 50; return t; });
        setRevealedTiles(Array.from({ length: totalTiles }, (_, i) => i));
        soundManager.play('win');
        confetti({ particleCount: 200, spread: 100 });
        setGuessing(false);
        setGameState('FINISHED');
    };

    const handleReset = () => { stopAutoReveal(); setGameState('SETUP'); };

    const addToQueue = (url: string) => {
        const u = [...customImages, url];
        setCustomImages(u);
        localStorage.setItem('hidden_picture_queue', JSON.stringify(u));
    };

    const addUrlImage = () => {
        if (!newImageInput.trim()) return;
        addToQueue(newImageInput.trim());
        setNewImageInput('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        const newUrls: string[] = [];
        let loaded = 0;
        fileArray.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                if (ev.target?.result) newUrls.push(ev.target.result as string);
                if (++loaded === fileArray.length) {
                    setCustomImages(prev => {
                        const u = [...prev, ...newUrls];
                        localStorage.setItem('hidden_picture_queue', JSON.stringify(u));
                        return u;
                    });
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    return (
        <div style={{ width: '100%', height: '100%', background: TT.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}>
            <TTGameHeader
                color={ACCENT}
                left={<span style={{ fontWeight: 900, fontSize: '1.05em', color: ACCENT }}>HIDDEN PICTURE</span>}
                center={
                    gameState === 'PLAYING' ? (
                        <motion.div key={currentTeam} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            style={{ fontWeight: 900, fontSize: '1em', color: ACCENT }}>
                            {teams[currentTeam]?.name}'s Turn
                        </motion.div>
                    ) : null
                }
                right={
                    <>
                        {onGoToScoreboard && (
                            <TTBtn onClick={onGoToScoreboard} variant="yellow" size="sm">🏅</TTBtn>
                        )}
                        <TTBtn onClick={() => setShowEditor(true)} variant="teal" size="sm" icon={<ImageIcon size={16} />} />
                        <TTBtn onClick={handleReset} variant="green" size="sm" icon={<RefreshCw size={16} />} />
                    </>
                }
            />

            <AnimatePresence mode="wait">
                {gameState === 'SETUP' ? (
                    <motion.div key="setup"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}
                    >
                        <TTCard style={{ width: '100%', maxWidth: '460px' }}>
                            <TTHeader text="HIDDEN PICTURE" color={ACCENT} icon={<ImageIcon size={18} />} />
                            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Grid */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Grid Size</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                                        {GRID_PRESETS.map(p => (
                                            <TTBtn key={p.value}
                                                onClick={() => { setGridPreset(p.value); setGridCols(p.cols); setGridRows(p.rows); }}
                                                variant={gridPreset === p.value ? 'teal' : 'default'}
                                                style={{ fontSize: '0.78em', padding: '6px 4px', flexDirection: 'column', gap: '1px' }}>
                                                {p.label}<br />
                                                <span style={{ fontSize: '0.85em', opacity: 0.75 }}>{p.cols}×{p.rows}</span>
                                            </TTBtn>
                                        ))}
                                        <TTBtn onClick={() => setGridPreset('custom')} variant={gridPreset === 'custom' ? 'teal' : 'default'} style={{ fontSize: '0.78em', padding: '6px 4px' }}>
                                            Custom
                                        </TTBtn>
                                    </div>
                                    {gridPreset === 'custom' && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.75em', fontWeight: 700, color: TT.textLight }}>Cols:</label>
                                            <input type="number" min={1} max={20} value={customCols}
                                                onChange={e => setCustomCols(Math.max(1, Math.min(20, +e.target.value)))}
                                                style={{ width: '64px', padding: '6px 8px', border: `2px solid ${TT.border}`, borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, textAlign: 'center', fontSize: '0.9em' }} />
                                            <label style={{ fontSize: '0.75em', fontWeight: 700, color: TT.textLight }}>Rows:</label>
                                            <input type="number" min={1} max={20} value={customRows}
                                                onChange={e => setCustomRows(Math.max(1, Math.min(20, +e.target.value)))}
                                                style={{ width: '64px', padding: '6px 8px', border: `2px solid ${TT.border}`, borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, textAlign: 'center', fontSize: '0.9em' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Mode */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Mode</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[
                                            { value: 'manual', label: 'Manual' },
                                            { value: 'auto',   label: 'Auto (2s)' },
                                            { value: 'custom', label: 'Custom' },
                                        ].map(m => (
                                            <TTBtn key={m.value} onClick={() => setRevealMode(m.value as typeof revealMode)}
                                                variant={revealMode === m.value ? 'teal' : 'default'} style={{ flex: 1 }}>
                                                {m.label}
                                            </TTBtn>
                                        ))}
                                    </div>
                                    {revealMode === 'custom' && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.75em', fontWeight: 700, color: TT.textLight }}>Speed (s):</label>
                                            <input type="number" min={0.5} max={30} step={0.5} value={customSpeed}
                                                onChange={e => setCustomSpeed(+e.target.value)}
                                                style={{ width: '80px', padding: '6px 8px', border: `2px solid ${TT.border}`, borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, textAlign: 'center', fontSize: '0.9em' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Questions toggle */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Click Mode</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <TTBtn onClick={() => setAskQuestions(true)} variant={askQuestions ? 'teal' : 'default'} style={{ flex: 1 }}>Ask Questions</TTBtn>
                                        <TTBtn onClick={() => setAskQuestions(false)} variant={!askQuestions ? 'teal' : 'default'} style={{ flex: 1 }}>No Questions</TTBtn>
                                    </div>
                                </div>

                                {/* Teams */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Teams</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[2, 3, 4].map(count => (
                                            <TTBtn key={count} onClick={() => setTeamCount(count)} variant={teamCount === count ? 'teal' : 'default'} style={{ flex: 1 }}>
                                                {count} Teams
                                            </TTBtn>
                                        ))}
                                    </div>
                                </div>

                                <TTBtn onClick={startGame} variant="green" size="xl" style={{ width: '100%' }}>START GAME</TTBtn>
                            </div>
                        </TTCard>
                    </motion.div>
                ) : (
                    <div key="playing" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', overflow: 'hidden' }}>
                        {/* Game Grid */}
                        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                            <TTCard style={{ width: '100%', height: '100%', padding: '6px', background: '#263238' }}>
                                <div style={{
                                    width: '100%', height: '100%', position: 'relative',
                                    borderRadius: '12px', overflow: 'hidden',
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                                    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                                }}>
                                    <img src={currentImg} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Hidden" />
                                    {Array.from({ length: totalTiles }).map((_, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{ opacity: revealedTiles.includes(i) ? 0 : 1, scale: revealedTiles.includes(i) ? 0.8 : 1 }}
                                            transition={{ duration: 0.5 }}
                                            onClick={() => handleTileClick(i)}
                                            disabled={revealedTiles.includes(i)}
                                            whileHover={{ zIndex: 10, scale: revealMode === 'manual' ? 1.05 : 1 }}
                                            whileTap={{ scale: revealMode === 'manual' ? 0.95 : 1 }}
                                            style={{ background: '#37474F', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: revealMode === 'manual' ? 'pointer' : 'default', zIndex: 10, fontSize: 'clamp(0.7em, 1.5vw, 1.2em)', fontWeight: 900, color: 'rgba(255,255,255,0.4)', borderRadius: '4px', fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            {i + 1}
                                        </motion.button>
                                    ))}
                                </div>
                            </TTCard>
                        </div>

                        {/* Bottom bar */}
                        <TTCard style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', flex: 1 }}>
                                {teams.map((team, i) => (
                                    <div key={i} style={{
                                        padding: '6px 14px', borderRadius: '12px', border: `2px solid ${i === currentTeam ? TEAM_COLORS[i] : 'transparent'}`,
                                        background: i === currentTeam ? '#E0F2F1' : 'rgba(255,255,255,0.5)',
                                        display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px', transition: 'all 0.2s',
                                    }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: i === currentTeam ? TEAM_COLORS[i] : '#9E9E9E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85em', flexShrink: 0 }}>{i + 1}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.7em', textTransform: 'uppercase', color: i === currentTeam ? ACCENT : TT.textLight }}>{team.name}</div>
                                            <div style={{ fontWeight: 900, fontSize: '1.3em', color: i === currentTeam ? ACCENT : '#9E9E9E' }}>{team.score}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                {customImages.length > 0 && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.65em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase' }}>Queue</div>
                                        <div style={{ fontWeight: 700, color: TT.text }}>{currentImageIdx + 1} / {customImages.length}</div>
                                    </div>
                                )}
                                <TTBtn onClick={() => setGuessing(true)} variant="orange" size="lg" icon={<Lightbulb size={20} />}>SOLVE</TTBtn>
                            </div>
                        </TTCard>
                    </div>
                )}
            </AnimatePresence>

            {/* Question Modal (manual mode only) */}
            <AnimatePresence>
                {activeTile && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: '560px' }}>
                            <TTCard style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                                <TTHeader text={`Question #${activeTile.index + 1}`} color={ACCENT} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '32px' }}>
                                    <p style={{ fontSize: 'clamp(1.4em, 3.5vw, 2.2em)', fontWeight: 900, color: TT.text, textAlign: 'center', lineHeight: 1.3 }}>{activeTile.question}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                                        <TTBtn onClick={() => handleAnswer(false)} variant="red" size="xl" icon={<X size={28} />}>WRONG</TTBtn>
                                        <TTBtn onClick={() => handleAnswer(true)} variant="green" size="xl" icon={<Check size={28} />}>CORRECT</TTBtn>
                                    </div>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Guess Modal */}
            <AnimatePresence>
                {guessing && (
                    <TTModal onClick={() => setGuessing(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ border: `3px solid #F9A825` }}>
                                <TTHeader text="SOLVE THE PUZZLE?" color="#F9A825" />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '72px', height: '72px', background: '#FFF9C4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Lightbulb size={36} style={{ color: '#F9A825' }} />
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: '1.05em', color: TT.text, textAlign: 'center' }}>Revealing awards <strong style={{ fontSize: '1.3em', color: '#F9A825' }}>50 points!</strong></p>
                                    <TTBtn onClick={handleGuessReveal} variant="yellow" size="xl" style={{ width: '100%' }}>YES, REVEAL IT!</TTBtn>
                                    <TTBtn onClick={() => setGuessing(false)} variant="default" size="sm" style={{ width: '100%' }}>Cancel</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                {gameState === 'FINISHED' && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: '460px' }}>
                            <TTCard style={{ border: '3px solid #FDD835' }}>
                                <TTHeader text="GAME OVER!" color="#E53935" />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                        style={{ background: '#FDD835', borderRadius: '50%', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 #F9A825' }}>
                                        <Trophy size={40} style={{ color: 'white' }} />
                                    </motion.div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                        {[...teams].sort((a, b) => b.score - a.score).map((team, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: i === 0 ? '#FFF9C4' : '#F5F5F5', border: `2px solid ${i === 0 ? '#FDD835' : 'transparent'}` }}>
                                                <span style={{ fontWeight: 900, fontSize: '1.05em', color: TT.text }}>{i === 0 ? '👑 ' : ''}{team.name}</span>
                                                <span style={{ fontWeight: 900, fontSize: '1.3em', color: i === 0 ? '#F9A825' : TT.textLight }}>{team.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <TTBtn onClick={() => setGameState('SETUP')} variant="green" size="xl" style={{ width: '100%' }}>New Game</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <TTModal onClick={() => setShowEditor(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ width: '100%', maxWidth: '580px', height: '80vh' }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <TTHeader text="IMAGE SETTINGS" color="#8E24AA" icon={<Settings size={16} />} />
                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
                                    <div style={{ background: '#F5F5F5', padding: '14px', borderRadius: '12px', border: '2px solid #E0E0E0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Add Image</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input value={newImageInput} onChange={e => setNewImageInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addUrlImage()}
                                                placeholder="https://..."
                                                style={{ flexGrow: 1, background: 'white', border: '2px solid #E0E0E0', borderRadius: '10px', padding: '10px 14px', color: TT.text, fontWeight: 700, outline: 'none', fontFamily: 'Poppins, sans-serif' }} />
                                            <TTBtn onClick={addUrlImage} disabled={!newImageInput} variant="green" size="sm">ADD URL</TTBtn>
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ width: '100%', padding: '10px', background: '#8E24AA', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9em', fontFamily: 'Poppins, sans-serif', cursor: 'pointer', boxShadow: '0 3px 0 #6A1B9A' }}
                                        >
                                            📁 Upload from Device
                                        </button>
                                    </div>
                                    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                                        {customImages.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: TT.textLight, padding: '40px', border: '2px dashed #E0E0E0', borderRadius: '12px', fontStyle: 'italic' }}>No images queued. Using default.</div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                {customImages.map((url, i) => (
                                                    <div key={i} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                                        onMouseEnter={e => (e.currentTarget.querySelector('.del-overlay') as HTMLElement).style.opacity = '1'}
                                                        onMouseLeave={e => (e.currentTarget.querySelector('.del-overlay') as HTMLElement).style.opacity = '0'}
                                                    >
                                                        <img src={url} alt={`Queue ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <div className="del-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                                            <TTBtn onClick={() => { const u = customImages.filter((_, idx) => idx !== i); setCustomImages(u); localStorage.setItem('hidden_picture_queue', JSON.stringify(u)); if (currentImageIdx === i) setCurrentImageIdx(0); }} variant="red" size="sm">DELETE</TTBtn>
                                                        </div>
                                                        <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7em', fontWeight: 700 }}>#{i + 1}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '12px', background: '#FAFAFA', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button onClick={() => { setCustomImages([]); localStorage.removeItem('hidden_picture_queue'); setCurrentImageIdx(0); }} style={{ color: '#EF5350', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85em', fontFamily: 'Poppins, sans-serif' }}>Clear Queue</button>
                                    <TTBtn onClick={() => setShowEditor(false)} variant="teal">DONE</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HiddenPictureGame;
