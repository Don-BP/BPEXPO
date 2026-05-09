import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, X as XIcon, Settings, DollarSign } from 'lucide-react';
import { soundManager } from '../games/soundManager';
import { TT, TTBtn, TTCard, TTHeader, TTGameHeader, TTModal } from '../games/TTGameComponents';

const ACCENT = '#1565C0';

const DEFAULT_TEAMS = [
    { id: 0, name: "Team 1", score: 0, variant: 'blue' as const },
    { id: 1, name: "Team 2", score: 0, variant: 'red' as const },
    { id: 2, name: "Team 3", score: 0, variant: 'green' as const },
    { id: 3, name: "Team 4", score: 0, variant: 'yellow' as const },
];

const GAME_DATA = {
    default: {
        name: 'Mixed Review',
        categories: ['Vocabulary', 'Grammar', 'Verbs', 'Numbers', 'Culture'],
        questions: [
            ['What is a synonym of "happy"?', 'What does "noun" mean?', 'Past tense of "run"?', 'What is 15 + 23?', 'What is the capital of Japan?'],
            ["Spell: DICTIONARY", "Is this correct: \"He don't like\"?", 'Past tense of "eat"?', 'What is 100 - 47?', 'Name a Japanese festival'],
            ["What's the opposite of \"big\"?", 'Plural of "child"?', 'Past tense of "swim"?', '12 × 5 = ?', 'What is sushi?'],
            ['Use "because" in a sentence', 'What is an adjective?', 'Past tense of "go"?', 'What is 50% of 80?', 'Name 3 Japanese cities'],
            ['What does "curious" mean?', 'Fix: "She go to school"', 'Past tense of "write"?', 'What is 7 × 8?', 'What are chopsticks?'],
        ],
    },
};

interface Props { isFullscreen: boolean; }

const JeopardyGame: React.FC<Props> = ({ isFullscreen }) => {
    const [teams, setTeams] = useState(DEFAULT_TEAMS);
    const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
    const [board, setBoard] = useState<any>(() => {
        const saved = localStorage.getItem('jeopardy_board');
        return saved ? JSON.parse(saved) : GAME_DATA.default;
    });
    const [answered, setAnswered] = useState<string[]>([]);
    const [dailyDoubles, setDailyDoubles] = useState<string[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editBoard, setEditBoard] = useState<any>(null);
    const [activeEditCat, setActiveEditCat] = useState(0);
    const [activeQuestion, setActiveQuestion] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [editBoardName, setEditBoardName] = useState('');
    const [savedBoards, setSavedBoards] = useState<Record<string, any>>(() => {
        try { return JSON.parse(localStorage.getItem('jeopardy_boards') ?? '{}'); } catch { return {}; }
    });
    useEffect(() => { initGame(); }, []);

    const persistBoards = (boards: Record<string, any>) => {
        setSavedBoards(boards);
        localStorage.setItem('jeopardy_boards', JSON.stringify(boards));
    };
    const saveNamedBoard = (name: string, data: any) => {
        if (!name.trim()) return;
        persistBoards({ ...savedBoards, [name.trim()]: { ...data, name: name.trim() } });
    };
    const deleteNamedBoard = (name: string) => {
        if (!window.confirm(`Delete board "${name}"?`)) return;
        const updated = { ...savedBoards };
        delete updated[name];
        persistBoards(updated);
        setEditBoardName('');
    };
    const loadNamedBoard = (name: string) => {
        if (!name) { setEditBoard(JSON.parse(JSON.stringify(GAME_DATA.default))); setEditBoardName(''); return; }
        setEditBoard(JSON.parse(JSON.stringify(savedBoards[name])));
        setEditBoardName(name);
    };

    const initGame = (playSound = false) => {
        setTeams(DEFAULT_TEAMS.map(t => ({ ...t, score: 0 })));
        setAnswered([]);
        setCurrentTeamIdx(0);
        if (playSound) soundManager.play('start');
        const dds: string[] = [];
        while (dds.length < 2) {
            const col = Math.floor(Math.random() * 5);
            const row = Math.floor(Math.random() * 5);
            const id = `${col}-${row}`;
            if (!dds.includes(id)) dds.push(id);
        }
        setDailyDoubles(dds);
    };

    const handleTileClick = (col: number, row: number, points: number) => {
        const id = `${col}-${row}`;
        if (answered.includes(id)) return;
        const questionText = board.questions[row][col];
        const questionObj = { col, row, points, text: questionText, id };
        if (dailyDoubles.includes(id)) {
            setActiveQuestion(questionObj);
            setActiveModal('dailydouble');
            soundManager.play('daily_double');
        } else {
            setActiveQuestion(questionObj);
            setActiveModal('question');
            setShowAnswer(false);
            soundManager.play('click');
        }
    };

    const handleWagerSubmit = (amount: number) => {
        const currentScore = teams[currentTeamIdx].score;
        const maxWager = Math.max(currentScore, 1000);
        const finalWager = Math.min(Math.max(100, amount), maxWager);
        setActiveQuestion((prev: any) => ({ ...prev, points: finalWager }));
        setActiveModal('question');
    };

    const handleAnswer = (correct: boolean) => {
        const points = activeQuestion.points;
        const teamIdx = currentTeamIdx;
        setTeams(prev => prev.map((t, i) => i === teamIdx ? { ...t, score: t.score + (correct ? points : -points) } : t));
        soundManager.play(correct ? 'correct' : 'wrong');
        setAnswered(prev => [...prev, activeQuestion.id]);
        setCurrentTeamIdx(prev => (prev + 1) % teams.length);
        closeModal();
    };

    const closeModal = () => { setActiveModal(null); setActiveQuestion(null); setShowAnswer(false); };

    const numCols = board.categories.length;
    const headerRowH = isFullscreen ? '48px' : '30px';
    const dollarFs = isFullscreen ? 'clamp(36px, 5.5vw, 80px)' : '20px';
    const catFs = (len: number): string => isFullscreen
        ? (len <= 5 ? 'clamp(18px, 2.5vw, 36px)' : len <= 7 ? 'clamp(16px, 2.2vw, 32px)' : len <= 9 ? 'clamp(14px, 1.8vw, 26px)' : len <= 11 ? 'clamp(12px, 1.5vw, 22px)' : 'clamp(10px, 1.2vw, 18px)')
        : (len <= 5 ? '13px' : len <= 7 ? '12px' : len <= 9 ? '10px' : len <= 11 ? '9px' : '8px');

    return (
        <div style={{ width: '100%', height: '100%', background: TT.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}>
            <TTGameHeader
                color={ACCENT}
                left={<span style={{ fontWeight: 900, fontSize: '1.1em', color: ACCENT, letterSpacing: '0.06em' }}>JEOPARDY</span>}
                center={
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {teams.map((team, i) => (
                            <div
                                key={team.id}
                                onClick={() => setCurrentTeamIdx(i)}
                                style={{
                                    background: i === currentTeamIdx ? 'white' : 'rgba(255,255,255,0.6)',
                                    border: `2px solid ${i === currentTeamIdx ? ACCENT : 'rgba(0,0,0,0.1)'}`,
                                    borderRadius: '10px', padding: '2px 10px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    cursor: 'pointer', minWidth: '68px',
                                    transform: i === currentTeamIdx ? 'scale(1.05)' : 'scale(0.95)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {i === currentTeamIdx && <span style={{ fontSize: '0.55em', fontWeight: 800, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>▶ TURN</span>}
                                <span style={{ fontSize: '0.62em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{team.name}</span>
                                <span style={{ fontSize: '1.2em', fontWeight: 900, color: team.score < 0 ? '#E53935' : TT.text }}>${team.score}</span>
                            </div>
                        ))}
                    </div>
                }
                right={
                    <>
                        <TTBtn variant="green" size="sm" onClick={() => initGame(true)} icon={<RefreshCw size={16} />} />
                        <TTBtn variant="orange" size="sm" onClick={() => { setEditBoard(JSON.parse(JSON.stringify(board))); setEditBoardName((board as any).name ?? ''); setActiveEditCat(0); setShowEditor(true); }} icon={<Settings size={16} />} />
                    </>
                }
            />

            <div style={{ flex: 1, padding: '8px', overflow: 'hidden' }}>
                <TTCard style={{ height: '100%', padding: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gridTemplateRows: `${headerRowH} repeat(5, 1fr)`, gap: '6px', width: '100%', height: '100%' }}>
                        {board.categories.map((cat: string, i: number) => (
                            <div key={`cat-${i}`} style={{ background: ACCENT, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', overflow: 'hidden' }}>
                                <span style={{ color: 'white', fontWeight: 900, fontSize: catFs(cat.length), textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%' }}>{cat}</span>
                            </div>
                        ))}
                        {board.questions.map((rowQ: string[], rowIdx: number) =>
                            rowQ.map((_q: string, colIdx: number) => {
                                const points = (rowIdx + 1) * 100;
                                const id = `${colIdx}-${rowIdx}`;
                                const isAnswered = answered.includes(id);
                                return (
                                    <motion.button
                                        key={id}
                                        whileHover={!isAnswered ? { scale: 1.05, zIndex: 10 } : {}}
                                        whileTap={!isAnswered ? { scale: 0.95 } : {}}
                                        onClick={() => handleTileClick(colIdx, rowIdx, points)}
                                        disabled={isAnswered}
                                        style={{
                                            background: isAnswered ? '#E8EAF6' : 'linear-gradient(to bottom, #1976D2, #1565C0)',
                                            border: 'none', borderRadius: '8px',
                                            cursor: isAnswered ? 'default' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isAnswered ? 'none' : '0 3px 0 #0D47A1',
                                            fontFamily: 'Poppins, sans-serif', position: 'relative',
                                        }}
                                    >
                                        {!isAnswered && (
                                            <span style={{ color: '#FDD835', fontWeight: 900, fontSize: dollarFs, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                                ${points}
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </TTCard>
            </div>

            {/* Question Modal */}
            <AnimatePresence>
                {activeModal === 'question' && activeQuestion && (
                    <TTModal onClick={closeModal}>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ width: '90vw', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '12px', right: '16px', zIndex: 10 }}>
                                    <span style={{ background: '#FDD835', color: TT.text, fontWeight: 900, padding: '6px 18px', borderRadius: '20px', fontSize: 'clamp(14px, 2vw, 28px)', boxShadow: '0 2px 0 #F9A825' }}>${activeQuestion.points}</span>
                                </div>
                                <TTHeader text={board.categories[activeQuestion.col]} color={ACCENT} size="lg" />
                                <div style={{ flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px' }}>
                                    <h2 style={{ fontSize: 'clamp(22px, 4vw, 56px)', fontWeight: 900, color: TT.text, textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>{activeQuestion.text}</h2>
                                    <AnimatePresence>
                                        {showAnswer && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                style={{ background: '#E8F5E9', border: '2px solid #66BB6A', color: '#2E7D32', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, fontSize: 'clamp(14px, 2vw, 24px)', textAlign: 'center', width: '100%' }}>
                                                (Teacher Verification Required)
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', width: '100%', maxWidth: '640px' }}>
                                        <TTBtn onClick={() => setShowAnswer(!showAnswer)} variant="blue" size="lg" style={{ gridColumn: '1 / -1', fontSize: 'clamp(13px, 1.8vw, 22px)' }}>
                                            {showAnswer ? "Hide Answer Hints" : "Reveal Answer Hints"}
                                        </TTBtn>
                                        <TTBtn onClick={() => handleAnswer(false)} variant="red" size="lg" icon={<XIcon size={24} />} style={{ fontSize: 'clamp(14px, 2vw, 26px)' }}>WRONG</TTBtn>
                                        <div />
                                        <TTBtn onClick={() => handleAnswer(true)} variant="green" size="lg" icon={<Check size={24} />} style={{ fontSize: 'clamp(14px, 2vw, 26px)' }}>CORRECT</TTBtn>
                                    </div>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Daily Double Modal */}
            <AnimatePresence>
                {activeModal === 'dailydouble' && (
                    <TTModal>
                        <motion.div initial={{ scale: 0.5, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} style={{ width: '100%', maxWidth: '460px' }}>
                            <TTCard style={{ border: '4px solid #FDD835', boxShadow: '0 0 40px rgba(253,216,53,0.4)' }}>
                                <TTHeader text="DAILY DOUBLE!" color="#F9A825" size="lg" />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                    <p style={{ fontSize: '1.1em', fontWeight: 700, color: TT.text }}>
                                        <span style={{ background: TT.bg, padding: '2px 10px', borderRadius: '8px', fontWeight: 900 }}>{teams[currentTeamIdx].name}</span>, place your wager!
                                    </p>
                                    <div style={{ background: TT.bg, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '280px', border: `2px solid ${TT.border}` }}>
                                        <div style={{ fontSize: '0.7em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', marginBottom: '8px' }}>Max Wager: ${Math.max(teams[currentTeamIdx].score, 1000)}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <DollarSign size={24} style={{ color: '#F9A825', flexShrink: 0 }} />
                                            <input
                                                type="number"
                                                autoFocus
                                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `3px solid ${ACCENT}`, padding: '4px', fontSize: '2.5em', fontWeight: 900, color: TT.text, textAlign: 'center', outline: 'none', fontFamily: 'Poppins, sans-serif' }}
                                                placeholder="0"
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                    if (e.key === 'Enter') handleWagerSubmit(parseInt((e.target as HTMLInputElement).value) || 0);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <TTBtn onClick={() => handleWagerSubmit(1000)} variant="orange" size="sm">Max it ($1000 min)</TTBtn>
                                    <p style={{ fontSize: '0.75em', color: TT.textLight }}>Press ENTER to confirm</p>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && editBoard && (
                    <TTModal onClick={() => setShowEditor(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ width: '100%', maxWidth: '680px', height: '85vh' }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <TTHeader text="EDITOR" color="#8E24AA" icon={<Settings size={18} />} />
                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                                        {/* Save / Load row */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px', padding: '10px 12px', background: '#F3E5F5', borderRadius: '10px', border: '1px solid #CE93D8' }}>
                                        <select
                                            value={editBoardName}
                                            onChange={e => loadNamedBoard(e.target.value)}
                                            style={{ padding: '6px 10px', borderRadius: '8px', border: '2px solid #CE93D8', fontFamily: 'Poppins, sans-serif', fontSize: '0.85em', fontWeight: 600, color: TT.text, background: 'white', minWidth: '150px' }}
                                        >
                                            <option value="">-- New Board --</option>
                                            {Object.keys(savedBoards).map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Board name…"
                                            value={editBoardName}
                                            onChange={e => setEditBoardName(e.target.value)}
                                            style={{ flex: 1, minWidth: '120px', padding: '6px 10px', borderRadius: '8px', border: '2px solid #CE93D8', fontFamily: 'Poppins, sans-serif', fontSize: '0.85em', fontWeight: 600, color: TT.text, outline: 'none' }}
                                        />
                                        <TTBtn onClick={() => { const n = editBoardName.trim(); if (!n) { alert('Enter a board name first.'); return; } saveNamedBoard(n, editBoard); }} variant="blue" size="sm">💾 Save</TTBtn>
                                        {editBoardName.trim() && savedBoards[editBoardName.trim()] && (
                                            <TTBtn onClick={() => deleteNamedBoard(editBoardName.trim())} variant="red" size="sm">🗑️</TTBtn>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <p style={{ color: TT.textLight, fontWeight: 700 }}>Edit Categories & Questions</p>
                                        <TTBtn onClick={() => { if (window.confirm('Reset to default Mixed Review?')) setEditBoard(JSON.parse(JSON.stringify(GAME_DATA.default))); }} variant="red" size="sm">Reset Defaults</TTBtn>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', flexShrink: 0, marginBottom: '12px' }}>
                                        {editBoard.categories.map((cat: string, i: number) => (
                                            <button key={i} onClick={() => setActiveEditCat(i)}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                                                    background: activeEditCat === i ? '#8E24AA' : '#F5F5F5', color: activeEditCat === i ? 'white' : TT.textLight,
                                                    border: 'none', borderBottom: activeEditCat === i ? '3px solid #6A1B9A' : '3px solid #E0E0E0', fontFamily: 'Poppins, sans-serif',
                                                }}>
                                                {cat || `Category ${i + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ background: '#F3E5F5', padding: '12px', borderRadius: '12px', border: '1px solid #CE93D8' }}>
                                            <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Category Name</label>
                                            <input
                                                value={editBoard.categories[activeEditCat]}
                                                onChange={(e) => { const c = [...editBoard.categories]; c[activeEditCat] = e.target.value; setEditBoard({ ...editBoard, categories: c }); }}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #CE93D8', outline: 'none', fontWeight: 700, color: TT.text, fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        {editBoard.questions.map((row: string[], rowIdx: number) => (
                                            <div key={rowIdx} style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #E0E0E0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ width: '48px', paddingTop: '10px', fontWeight: 900, color: '#F9A825', fontSize: '0.95em', textAlign: 'center', borderRight: '1px solid #F0F0F0', flexShrink: 0 }}>${(rowIdx + 1) * 100}</div>
                                                <textarea
                                                    value={row[activeEditCat]}
                                                    onChange={(e) => {
                                                        const newQ = [...editBoard.questions];
                                                        const newRow = [...newQ[rowIdx]];
                                                        newRow[activeEditCat] = e.target.value;
                                                        newQ[rowIdx] = newRow;
                                                        setEditBoard({ ...editBoard, questions: newQ });
                                                    }}
                                                    rows={2}
                                                    style={{ flex: 1, padding: '8px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E0E0E0', outline: 'none', color: TT.text, fontWeight: 500, resize: 'none', fontFamily: 'Poppins, sans-serif' }}
                                                    placeholder={`Question for $${(rowIdx + 1) * 100}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ padding: '12px', background: '#FAFAFA', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <TTBtn onClick={() => setShowEditor(false)} variant="red">CANCEL</TTBtn>
                                    <TTBtn onClick={() => {
                                        const name = editBoardName.trim();
                                        if (name) saveNamedBoard(name, editBoard);
                                        setBoard({ ...editBoard, name });
                                        localStorage.setItem('jeopardy_board', JSON.stringify({ ...editBoard, name }));
                                        setShowEditor(false);
                                        initGame(true);
                                    }} variant="green">SAVE & RESTART</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JeopardyGame;
