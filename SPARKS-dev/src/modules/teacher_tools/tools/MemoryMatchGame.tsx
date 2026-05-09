import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, Brain, Sparkles, Settings, BookMarked, Trash2, BookOpen, ImageIcon, X, ChevronLeft, Info } from 'lucide-react';
import { soundManager } from '../games/soundManager';
import confetti from 'canvas-confetti';
import { TT, TTBtn, TTCard, TTHeader, TTGameHeader, TTModal } from '../games/TTGameComponents';
import { getAllDecks } from '../../../utils/tango-bridge';
import Scoreboard from './Scoreboard';
import type { FlashCard } from '../../../utils/db';
import { CATEGORIES } from '../../tango/components/TangoSetupScreen';

const CATEGORY_IMAGE: Record<string, string> = Object.fromEntries(
    CATEGORIES.map((c: { id: string; image: string }) => [c.id, c.image])
);
const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
    CATEGORIES.map((c: { id: string; name: string }) => [c.id, c.name])
);

const ACCENT = '#5E35B1';

const DEFAULT_PAIRS = [
    { a: 'Dog', b: '🐶', id: 'dog' }, { a: 'Cat', b: '🐱', id: 'cat' },
    { a: 'Mouse', b: '🐭', id: 'mouse' }, { a: 'Hamster', b: '🐹', id: 'hamster' },
    { a: 'Rabbit', b: '🐰', id: 'rabbit' }, { a: 'Fox', b: '🦊', id: 'fox' },
    { a: 'Bear', b: '🐻', id: 'bear' }, { a: 'Panda', b: '🐼', id: 'panda' },
    { a: 'Koala', b: '🐨', id: 'koala' }, { a: 'Tiger', b: '🐯', id: 'tiger' },
    { a: 'Lion', b: '🦁', id: 'lion' }, { a: 'Cow', b: '🐮', id: 'cow' },
    { a: 'Pig', b: '🐷', id: 'pig' }, { a: 'Frog', b: '🐸', id: 'frog' },
    { a: 'Monkey', b: '🐵', id: 'monkey' }, { a: 'Bird', b: '🐦', id: 'bird' },
    { a: 'Duck', b: '🦆', id: 'duck' }, { a: 'Owl', b: '🦉', id: 'owl' },
];

type GameMode = 'image-match' | 'word-image';
interface Card { matchId: string | number; content: string; label?: string; state: 'hidden' | 'flipped' | 'matched'; uniqueId: number; }

function imageMatchCard(pair: { a: string; b: string }): { content: string; label?: string } {
    const aImg = isImg(pair.a), bImg = isImg(pair.b);
    if (!aImg && bImg)  return { content: pair.b, label: pair.a };
    if (aImg  && !bImg) return { content: pair.a, label: pair.b };
    if (!aImg && !bImg) return { content: pair.b, label: pair.a };
    return { content: pair.b };
}
interface SavedBoard { name: string; pairs: { a: string; b: string; id: string | number }[]; }
interface Props { isFullscreen: boolean; }

function isImg(v: string) { return v.startsWith('img::'); }
function imgSrc(v: string) { return v.slice(5); }

const MemoryMatchGame: React.FC<Props> = ({ isFullscreen }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'FINISHED'>('SETUP');
    const [gameMode, setGameMode] = useState<GameMode>('image-match');
    const [gridSize, setGridSize] = useState(16);
    const [teamCount, setTeamCount] = useState(2);
    const [customPairs, setCustomPairs] = useState<{ a: string; b: string; id: string | number }[]>(() => {
        const saved = localStorage.getItem('memory_match_pairs');
        return saved ? JSON.parse(saved) : [];
    });
    const [savedBoards, setSavedBoards] = useState<SavedBoard[]>(() => {
        const saved = localStorage.getItem('memory_match_boards');
        return saved ? JSON.parse(saved) : [];
    });
    const [showEditor, setShowEditor] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [newPair, setNewPair] = useState({ a: '', b: '' });
    const [boardName, setBoardName] = useState('');
    const [vocabDecks, setVocabDecks] = useState<Record<string, FlashCard[]>>({});
    const [wbPickerOpen, setWbPickerOpen] = useState(false);
    const [wbPickerView, setWbPickerView] = useState<'sets' | 'cards'>('sets');
    const [wbPickerSet, setWbPickerSet] = useState('');
    const [wbPickerSlot, setWbPickerSlot] = useState<'pair' | 'a' | 'b'>('pair');
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [teams, setTeams] = useState<{ name: string; score: number }[]>([]);
    const [currentTeam, setCurrentTeam] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputA = useRef<HTMLInputElement>(null);
    const fileInputB = useRef<HTMLInputElement>(null);

    useEffect(() => { getAllDecks().then(setVocabDecks); }, []);

    const startGame = () => {
        const newTeams = Array.from({ length: teamCount }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }));
        setTeams(newTeams);
        setCurrentTeam(0);

        const pairCount = gridSize / 2;
        const sourcePairs = customPairs.length >= pairCount ? customPairs : [...customPairs, ...DEFAULT_PAIRS];
        const selectedPairs: { a: string; b: string; id: string | number }[] = [];
        for (let i = 0; i < pairCount; i++) selectedPairs.push(sourcePairs[i % sourcePairs.length]);

        const deck: Card[] = [];
        selectedPairs.forEach(pair => {
            if (gameMode === 'image-match') {
                const { content, label } = imageMatchCard(pair);
                deck.push({ matchId: pair.id, content, label, state: 'hidden', uniqueId: Math.random() });
                deck.push({ matchId: pair.id, content, label, state: 'hidden', uniqueId: Math.random() });
            } else {
                deck.push({ matchId: pair.id, content: pair.a, state: 'hidden', uniqueId: Math.random() });
                deck.push({ matchId: pair.id, content: pair.b, state: 'hidden', uniqueId: Math.random() });
            }
        });

        setCards(deck.sort(() => Math.random() - 0.5));
        setFlippedIndices([]);
        setIsLocked(false);
        setGameState('PLAYING');
        setMessage(`${newTeams[0].name}'s Turn`);
        soundManager.play('start');
    };

    const handleCardClick = (index: number) => {
        if (isLocked || cards[index].state !== 'hidden') return;
        if (flippedIndices.includes(index)) return;
        soundManager.play('pop');
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);
        setCards(prev => { const c = [...prev]; c[index] = { ...c[index], state: 'flipped' }; return c; });
        if (newFlipped.length === 2) { setIsLocked(true); checkForMatch(newFlipped[0], newFlipped[1]); }
    };

    const checkForMatch = (idx1: number, idx2: number) => {
        const card1 = cards[idx1];
        const card2 = cards[idx2];
        if (card1.matchId === card2.matchId) {
            setTimeout(() => {
                soundManager.play('correct');
                setCards(prev => {
                    const c = [...prev];
                    c[idx1] = { ...c[idx1], state: 'matched' };
                    c[idx2] = { ...c[idx2], state: 'matched' };
                    const allMatched = c.every(card => card.state === 'matched');
                    if (allMatched) {
                        setTimeout(() => { soundManager.play('win'); setGameState('FINISHED'); confetti({ particleCount: 200, spread: 100 }); }, 500);
                    }
                    return c;
                });
                setTeams(prev => { const t = [...prev]; t[currentTeam].score += 1; return t; });
                setFlippedIndices([]);
                setIsLocked(false);
                setMessage(`${teams[currentTeam]?.name} found a match! Go again!`);
            }, 600);
        } else {
            setTimeout(() => {
                soundManager.play('wrong');
                setCards(prev => {
                    const c = [...prev];
                    c[idx1] = { ...c[idx1], state: 'hidden' };
                    c[idx2] = { ...c[idx2], state: 'hidden' };
                    return c;
                });
                setFlippedIndices([]);
                setIsLocked(false);
                setCurrentTeam(prev => {
                    const next = (prev + 1) % teamCount;
                    setMessage(`${teams[next]?.name}'s Turn`);
                    return next;
                });
            }, 1200);
        }
    };

    const savePairs = (pairs: { a: string; b: string; id: string | number }[]) => {
        setCustomPairs(pairs);
        localStorage.setItem('memory_match_pairs', JSON.stringify(pairs));
    };

    const saveBoard = () => {
        if (!boardName.trim() || customPairs.length === 0) return;
        const updated = [...savedBoards, { name: boardName.trim(), pairs: customPairs }];
        setSavedBoards(updated);
        localStorage.setItem('memory_match_boards', JSON.stringify(updated));
        setBoardName('');
    };

    const loadBoard = (board: SavedBoard) => savePairs(board.pairs);

    const deleteBoard = (index: number) => {
        const updated = savedBoards.filter((_, i) => i !== index);
        setSavedBoards(updated);
        localStorage.setItem('memory_match_boards', JSON.stringify(updated));
    };

    const handleSlotUpload = (slot: 'a' | 'b', file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            const src = e.target?.result as string;
            setNewPair(p => ({ ...p, [slot]: `img::${src}` }));
        };
        reader.readAsDataURL(file);
    };

    const openWbPicker = (slot: 'pair' | 'a' | 'b') => {
        setWbPickerSlot(slot);
        setWbPickerView('sets');
        setWbPickerOpen(true);
    };

    const selectVocabCard = (card: FlashCard) => {
        if (!card.image) return;
        if (wbPickerSlot === 'pair') {
            if (!card.text) return;
            savePairs([...customPairs, { a: card.text, b: `img::${card.image}`, id: card.tangoId ?? Date.now() }]);
        } else if (wbPickerSlot === 'b') {
            setNewPair(p => ({ ...p, b: `img::${card.image}`, a: p.a || card.text || '' }));
        } else {
            setNewPair(p => ({ ...p, [wbPickerSlot]: `img::${card.image}` }));
        }
        setWbPickerOpen(false);
        setWbPickerView('sets');
    };

    const gridCols = Math.sqrt(gridSize) % 1 === 0 ? Math.sqrt(gridSize) : (gridSize === 20 ? 5 : 6);

    const renderCardContent = (content: string, matched: boolean, label?: string) => {
        const textColor = matched ? 'white' : TT.text;
        const labelColor = matched ? 'rgba(255,255,255,0.9)' : TT.textLight;
        if (isImg(content)) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '2px', padding: '4px', boxSizing: 'border-box' }}>
                    <img src={imgSrc(content)} alt={label ?? ''} style={{ flex: 1, minHeight: 0, maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                    {label && <span style={{ fontSize: '0.62em', fontWeight: 800, color: textColor, textAlign: 'center', lineHeight: 1.1, flexShrink: 0 }}>{label}</span>}
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '2px' }}>
                <span style={{ fontWeight: 900, fontSize: content.length > 8 ? '0.65em' : '1.3em', color: textColor, textAlign: 'center', userSelect: 'none' }}>{content}</span>
                {label && <span style={{ fontSize: '0.6em', fontWeight: 700, color: labelColor, textAlign: 'center', userSelect: 'none' }}>{label}</span>}
            </div>
        );
    };

    const renderPairValue = (v: string, color: string) =>
        isImg(v)
            ? <img src={imgSrc(v)} alt="" style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '7px', border: '1px solid #E0E0E0', flexShrink: 0 }} />
            : <span style={{ fontWeight: 700, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>;

    const renderSlot = (slot: 'a' | 'b') => {
        const value = newPair[slot];
        const ref = slot === 'a' ? fileInputA : fileInputB;
        const isImageMatch = gameMode === 'image-match';
        const label = slot === 'a'
            ? (isImageMatch ? 'Word / Label' : 'Word Card')
            : (isImageMatch ? 'Image' : 'Image Card');
        const textOnly = slot === 'a' && isImageMatch;
        return (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files?.[0]) handleSlotUpload(slot, e.target.files[0]); e.target.value = ''; }} />
                {isImg(value) ? (
                    <div style={{ position: 'relative', background: '#F5F5F5', borderRadius: '10px', border: '2px solid #D1C4E9', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={imgSrc(value)} alt="" style={{ maxHeight: '60px', maxWidth: '90%', objectFit: 'contain' }} />
                        <button onClick={() => setNewPair(p => ({ ...p, [slot]: '' }))}
                            style={{ position: 'absolute', top: '3px', right: '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#E53935', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={11} />
                        </button>
                    </div>
                ) : (
                    <input value={value} onChange={e => setNewPair(p => ({ ...p, [slot]: e.target.value }))} placeholder={label}
                        onKeyDown={e => { if (e.key === 'Enter' && newPair.a && newPair.b) { savePairs([...customPairs, { ...newPair, id: Date.now() }]); setNewPair({ a: '', b: '' }); } }}
                        style={{ width: '100%', background: 'white', border: '2px solid #E0E0E0', borderRadius: '10px', padding: '9px 12px', color: TT.text, fontWeight: 700, outline: 'none', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box' }} />
                )}
                {!textOnly && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => ref.current?.click()}
                            style={{ flex: 1, padding: '4px', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72em', color: TT.textLight, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <ImageIcon size={11} /> Upload
                        </button>
                        <button onClick={() => openWbPicker(slot)}
                            style={{ flex: 1, padding: '4px', background: '#E0F2F1', border: '1px solid #80CBC4', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72em', color: '#00695C', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <BookOpen size={11} /> Word Box
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ width: '100%', height: '100%', background: TT.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}>
            <TTGameHeader
                color={ACCENT}
                left={<span style={{ fontWeight: 900, fontSize: '1.05em', color: ACCENT }}>MEMORY MATCH</span>}
                center={
                    gameState === 'PLAYING' ? (
                        <motion.span key={message} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            style={{ fontWeight: 900, fontSize: '0.95em', color: ACCENT }}>
                            {message}
                        </motion.span>
                    ) : null
                }
                right={
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', paddingRight: isFullscreen ? '52px' : 0 }}>
                        <TTBtn onClick={() => setShowScoreboard(true)} variant="yellow" size="sm">🏅</TTBtn>
                        <TTBtn onClick={() => setShowInfo(true)} variant="indigo" size="sm" icon={<Info size={16} />} />
                        {isFullscreen && <TTBtn onClick={() => setShowEditor(true)} variant="purple" size="sm" icon={<Settings size={16} />} />}
                        <TTBtn onClick={() => setGameState('SETUP')} variant="green" size="sm" icon={<RefreshCw size={16} />} />
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {gameState === 'SETUP' ? (
                    <motion.div key="setup"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    >
                        <TTCard style={{ width: '100%', maxWidth: '440px' }}>
                            <TTHeader text="MEMORY MATCH" color={ACCENT} icon={<Brain size={18} />} />
                            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Grid Size</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {[16, 20, 24, 30, 36].map(size => (
                                            <TTBtn key={size} onClick={() => setGridSize(size)} variant={gridSize === size ? "indigo" : "default"} style={{ flex: 1, minWidth: '55px' }}>{size}</TTBtn>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Teams</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[2, 3, 4].map(count => (
                                            <TTBtn key={count} onClick={() => setTeamCount(count)} variant={teamCount === count ? "indigo" : "default"} style={{ flex: 1 }}>{count} Teams</TTBtn>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Mode</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <TTBtn onClick={() => setGameMode('image-match')} variant={gameMode === 'image-match' ? 'indigo' : 'default'} style={{ flex: 1 }}>🖼 Image Match</TTBtn>
                                        <TTBtn onClick={() => setGameMode('word-image')} variant={gameMode === 'word-image' ? 'indigo' : 'default'} style={{ flex: 1 }}>🔤 Word–Image</TTBtn>
                                    </div>
                                </div>
                                <TTBtn onClick={startGame} variant="green" size="xl" style={{ width: '100%' }}>Start Game</TTBtn>
                            </div>
                        </TTCard>
                    </motion.div>
                ) : (
                    <div key="playing" style={{ flex: 1, display: 'flex', gap: '8px', padding: '8px', overflow: 'hidden' }}>
                        {/* Left Scoreboard */}
                        <TTCard style={{ width: '200px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden auto', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: TT.textLight, fontWeight: 700, fontSize: '0.75em', textTransform: 'uppercase', letterSpacing: '0.08em', justifyContent: 'center' }}>
                                <Trophy size={14} /> SCOREBOARD
                            </div>
                            {teams.map((team, i) => (
                                <div key={i} style={{
                                    padding: '8px 12px', borderRadius: '12px', border: `2px solid ${i === currentTeam ? ACCENT : 'transparent'}`,
                                    background: i === currentTeam ? '#EDE7F6' : 'rgba(255,255,255,0.5)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    opacity: i === currentTeam ? 1 : 0.6, transition: 'all 0.2s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: i === currentTeam ? ACCENT : '#9E9E9E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8em' }}>{i + 1}</div>
                                        <span style={{ fontWeight: 700, fontSize: '0.85em', color: i === currentTeam ? '#311B92' : TT.textLight }}>{team.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 900, fontSize: '2em', color: i === currentTeam ? ACCENT : TT.textLight }}>{team.score}</span>
                                </div>
                            ))}
                        </TTCard>

                        {/* Right Grid */}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <TTCard style={{ width: '100%', height: '100%', padding: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridAutoRows: 'minmax(0, 1fr)', gap: '6px', width: '100%', height: '100%' }}>
                                    {cards.map((card, i) => (
                                        <motion.div key={card.uniqueId}
                                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.02 }}
                                            className="perspective-1000"
                                            style={{ cursor: card.state === 'hidden' ? 'pointer' : 'default' }}
                                            onClick={() => handleCardClick(i)}
                                        >
                                            <motion.div className="transform-style-3d"
                                                style={{ width: '100%', height: '100%', position: 'relative', transition: 'transform 0.5s' }}
                                                animate={{ rotateY: card.state === 'flipped' || card.state === 'matched' ? 180 : 0 }}
                                            >
                                                {/* Front (hidden) */}
                                                <div className="backface-hidden" style={{ position: 'absolute', inset: 0, borderRadius: '10px', background: `linear-gradient(to bottom right, ${ACCENT}, #7E57C2)`, border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    <Brain style={{ color: 'rgba(255,255,255,0.3)', width: '40%', height: '40%' }} />
                                                </div>
                                                {/* Back (revealed) */}
                                                <div className="backface-hidden rotate-y-180" style={{
                                                    position: 'absolute', inset: 0, borderRadius: '10px',
                                                    background: card.state === 'matched' ? 'linear-gradient(to bottom right, #66BB6A, #43A047)' : 'linear-gradient(to bottom, white, #F5F5F5)',
                                                    border: `3px solid ${card.state === 'matched' ? '#2E7D32' : '#E0E0E0'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px',
                                                }}>
                                                    {renderCardContent(card.content, card.state === 'matched', card.label)}
                                                    {card.state === 'matched' && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '2px', right: '4px' }}>
                                                            <Sparkles size={14} style={{ color: '#FDD835' }} />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    ))}
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
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: '440px' }}>
                            <TTCard style={{ border: '3px solid #FDD835' }}>
                                <TTHeader text="GAME OVER!" color="#E53935" />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                        style={{ background: '#FDD835', borderRadius: '50%', width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 #F9A825' }}>
                                        <Trophy size={36} style={{ color: 'white' }} />
                                    </motion.div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                        {[...teams].sort((a, b) => b.score - a.score).map((team, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: i === 0 ? '#FFF9C4' : '#F5F5F5', border: `2px solid ${i === 0 ? '#FDD835' : 'transparent'}` }}>
                                                <span style={{ fontWeight: 900, fontSize: '1.05em', color: TT.text }}>{i === 0 ? '👑 ' : ''}{team.name}</span>
                                                <span style={{ fontWeight: 900, fontSize: '1.1em', color: i === 0 ? '#F9A825' : TT.textLight }}>{team.score} matches</span>
                                            </div>
                                        ))}
                                    </div>
                                    <TTBtn onClick={() => setGameState('SETUP')} variant="indigo" size="xl" style={{ width: '100%' }}>New Game</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <TTModal onClick={() => { setShowEditor(false); setWbPickerOpen(false); }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ width: '100%', maxWidth: '520px', height: '82vh' }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <TTHeader text="CARD EDITOR" color="#8E24AA" icon={<Settings size={16} />} />

                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '14px', gap: '10px' }}>

                                    {/* New Pair */}
                                    <div style={{ background: '#F5F5F5', padding: '12px', borderRadius: '12px', border: '2px solid #E0E0E0', flexShrink: 0 }}>
                                        <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>New Pair</label>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            {renderSlot('a')}
                                            {renderSlot('b')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <TTBtn onClick={() => { if (newPair.a && newPair.b) { savePairs([...customPairs, { ...newPair, id: Date.now() }]); setNewPair({ a: '', b: '' }); } }}
                                                disabled={!newPair.a || !newPair.b} variant="green" size="sm" style={{ flex: 1 }}>+ Add Pair</TTBtn>
                                            <TTBtn onClick={() => openWbPicker('pair')}
                                                variant="teal" size="sm" icon={<BookOpen size={14} />} style={{ flex: 1 }}>Add from Word Box</TTBtn>
                                        </div>
                                    </div>

                                    {/* Scrollable body */}
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                        {/* Save / Load Board */}
                                        <div style={{ background: '#EDE7F6', padding: '12px', borderRadius: '12px', border: '2px solid #CE93D8', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Save as Board</label>
                                            {/* Load row */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select
                                                    defaultValue=""
                                                    onChange={e => { const b = savedBoards.find(x => x.name === e.target.value); if (b) loadBoard(b); e.target.value = ''; }}
                                                    style={{ flex: 1, minWidth: 0, background: 'white', border: '2px solid #CE93D8', borderRadius: '10px', padding: '9px 12px', color: TT.text, fontWeight: 700, outline: 'none', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                                >
                                                    <option value="" disabled>Load a saved board…</option>
                                                    {savedBoards.map((b, i) => <option key={i} value={b.name}>{b.name} ({b.pairs.length} pairs)</option>)}
                                                </select>
                                                <TTBtn
                                                    onClick={() => { const i = savedBoards.findIndex(b => b.name === boardName.trim()); if (i >= 0) deleteBoard(i); else alert('Enter the board name to delete.'); }}
                                                    variant="red" size="sm" icon={<Trash2 size={12} />}
                                                />
                                            </div>
                                            {/* Save row */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input value={boardName} onChange={e => setBoardName(e.target.value)} placeholder="Board name…"
                                                    onKeyDown={e => { if (e.key === 'Enter') saveBoard(); }}
                                                    style={{ flex: 1, minWidth: 0, background: 'white', border: '2px solid #CE93D8', borderRadius: '10px', padding: '9px 12px', color: TT.text, fontWeight: 700, outline: 'none', fontFamily: 'Poppins, sans-serif' }} />
                                                <TTBtn onClick={saveBoard} disabled={!boardName.trim() || customPairs.length === 0} variant="purple" size="sm" icon={<BookMarked size={14} />}>Save</TTBtn>
                                            </div>
                                            {customPairs.length === 0 && <p style={{ margin: 0, fontSize: '0.72em', color: '#AB47BC' }}>Add pairs above before saving a board.</p>}
                                        </div>

                                        {/* Current Pairs */}
                                        <div style={{ flexShrink: 0 }}>
                                            <label style={{ display: 'block', fontSize: '0.7em', fontWeight: 700, color: TT.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                                                Current Pairs {customPairs.length > 0 && `(${customPairs.length})`}
                                            </label>
                                            {customPairs.length === 0 ? (
                                                <div style={{ textAlign: 'center', color: TT.textLight, padding: '32px 16px', border: '2px dashed #E0E0E0', borderRadius: '12px', fontStyle: 'italic', fontSize: '0.9em' }}>No custom pairs. Using defaults.</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {customPairs.map((pair, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #E0E0E0', minHeight: '48px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                                                {renderPairValue(pair.a, ACCENT)}
                                                                <span style={{ color: '#BDBDBD', flexShrink: 0 }}>↔</span>
                                                                {renderPairValue(pair.b, '#8E24AA')}
                                                            </div>
                                                            <TTBtn onClick={() => savePairs(customPairs.filter((_, idx) => idx !== i))} variant="red" size="sm" icon={<Trash2 size={12} />} style={{ flexShrink: 0, marginLeft: '8px' }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '12px', background: '#FAFAFA', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end' }}>
                                    <TTBtn onClick={() => { setShowEditor(false); setWbPickerOpen(false); }} variant="indigo">DONE</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Info Modal */}
            <AnimatePresence>
                {showInfo && (
                    <TTModal onClick={() => setShowInfo(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ width: '100%', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                            <TTCard style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ background: '#5E35B1', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>
                                    <span style={{ fontWeight: 900, fontSize: '1em', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}><Brain size={18} /> How to Play</span>
                                    <button onClick={() => setShowInfo(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                                </div>
                                <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'Poppins, sans-serif' }}>

                                    {/* Goal */}
                                    <div style={{ background: '#EDE7F6', borderRadius: '12px', padding: '12px 14px', border: '2px solid #D1C4E9' }}>
                                        <div style={{ fontWeight: 800, color: '#4A148C', marginBottom: '6px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🎯 Goal</div>
                                        <div style={{ color: '#3E2723', fontSize: '0.9em', lineHeight: 1.5 }}>Flip cards two at a time to find matching pairs. The team with the most matches wins!</div>
                                    </div>

                                    {/* Modes */}
                                    <div style={{ background: '#F3F0FF', borderRadius: '12px', padding: '12px 14px', border: '2px solid #D1C4E9' }}>
                                        <div style={{ fontWeight: 800, color: '#4A148C', marginBottom: '8px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🃏 Game Modes</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', border: '2px solid #B39DDB' }}>
                                                <div style={{ fontWeight: 800, color: '#5E35B1', fontSize: '0.85em', marginBottom: '3px' }}>🖼 Image Match <span style={{ background: '#5E35B1', color: 'white', fontSize: '0.75em', padding: '1px 7px', borderRadius: '20px', marginLeft: '4px' }}>Default</span></div>
                                                <div style={{ color: '#5D4037', fontSize: '0.83em', lineHeight: 1.5 }}>Both cards show the <strong>same image + word</strong>. Students flip two identical picture+word cards to make a match. Great for vocabulary!</div>
                                            </div>
                                            <div style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', border: '2px solid #B39DDB' }}>
                                                <div style={{ fontWeight: 800, color: '#5E35B1', fontSize: '0.85em', marginBottom: '3px' }}>🔤 Word–Image</div>
                                                <div style={{ color: '#5D4037', fontSize: '0.83em', lineHeight: 1.5 }}>One card shows a <strong>word</strong>, its pair shows the <strong>image</strong>. Students match the written word to the correct picture.</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Setup */}
                                    <div style={{ background: '#F3F0FF', borderRadius: '12px', padding: '12px 14px', border: '2px solid #D1C4E9' }}>
                                        <div style={{ fontWeight: 800, color: '#4A148C', marginBottom: '8px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚙️ Setting Up a Board</div>
                                        <ol style={{ margin: 0, paddingLeft: '18px', color: '#3E2723', fontSize: '0.85em', lineHeight: 1.8 }}>
                                            <li>Open the tool in <strong>fullscreen</strong> and tap the <strong>⚙ gear icon</strong></li>
                                            <li>Add pairs by typing text into <strong>Card 1</strong> and <strong>Card 2</strong></li>
                                            <li>Or tap <strong>Upload</strong> to use your own photos</li>
                                            <li>Or tap <strong>Word Box</strong> to pick from vocabulary sets</li>
                                            <li>Give your board a name and tap <strong>Save</strong> to reuse it later</li>
                                        </ol>
                                    </div>

                                    {/* Tips */}
                                    <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '12px 14px', border: '2px solid #C8E6C9' }}>
                                        <div style={{ fontWeight: 800, color: '#1B5E20', marginBottom: '6px', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Tips</div>
                                        <ul style={{ margin: 0, paddingLeft: '18px', color: '#3E2723', fontSize: '0.85em', lineHeight: 1.8 }}>
                                            <li>If a team finds a match, they <strong>go again</strong></li>
                                            <li>Smaller grids (16) work well for younger students</li>
                                            <li>Word Box pairs automatically fill both the image and word label</li>
                                        </ul>
                                    </div>

                                </div>
                                <div style={{ padding: '10px 14px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                                    <TTBtn onClick={() => setShowInfo(false)} variant="indigo">Got it!</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            {/* Word Box Picker — portalled to document.body, above TTModal at 10000 */}
            {showEditor && wbPickerOpen && ReactDOM.createPortal(
                <div onClick={() => setWbPickerOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div onClick={e => e.stopPropagation()}
                        style={{ width: '100%', maxWidth: '520px', height: '78vh', background: 'white', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>

                        {/* Picker Header */}
                        <div style={{ background: '#00897B', color: 'white', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>
                            {wbPickerView === 'cards' && (
                                <button onClick={() => setWbPickerView('sets')}
                                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <ChevronLeft size={14} /> Back
                                </button>
                            )}
                            <span style={{ fontWeight: 900, fontSize: '0.95em', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1, textAlign: wbPickerView === 'sets' ? 'center' : 'left' }}>
                                {wbPickerView === 'sets'
                                    ? (wbPickerSlot === 'pair' ? '📚 Word Box — Add Pairs' : `📚 Word Box — Pick for Card ${wbPickerSlot === 'a' ? '1' : '2'}`)
                                    : wbPickerSet}
                            </span>
                            <button onClick={() => setWbPickerOpen(false)}
                                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center' }}>
                                <X size={14} />
                            </button>
                        </div>

                        {/* Picker Grid */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'grid', gap: '8px', alignContent: 'start',
                            gridTemplateColumns: wbPickerView === 'sets' ? 'repeat(auto-fill, minmax(96px, 1fr))' : 'repeat(auto-fill, minmax(88px, 1fr))' }}>
                            {wbPickerView === 'sets'
                                ? Object.entries(vocabDecks).map(([name, deckCards]) => {
                                    const catId = name.startsWith('Tango: ') ? name.slice(7) : null;
                                    const cover = (catId && CATEGORY_IMAGE[catId]) ?? deckCards.find(c => c.image)?.image;
                                    return (
                                        <div key={name} onClick={() => { setWbPickerSet(name); setWbPickerView('cards'); }}
                                            style={{ cursor: 'pointer', background: '#F5F5F5', borderRadius: '12px', border: '2px solid #E0E0E0', padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'border-color 0.15s, background 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#26A69A'; e.currentTarget.style.background = '#E0F2F1'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.background = '#F5F5F5'; }}>
                                            {cover
                                                ? <img src={cover} alt="" style={{ width: '54px', height: '54px', objectFit: 'contain', borderRadius: '8px' }} />
                                                : <div style={{ width: '54px', height: '54px', borderRadius: '8px', background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em' }}>📁</div>}
                                            <span style={{ fontSize: '0.68em', fontWeight: 700, color: TT.text, textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.3 }}>{(catId && CATEGORY_NAME[catId]) ?? name}</span>
                                        </div>
                                    );
                                })
                                : (vocabDecks[wbPickerSet] ?? []).filter(c => c.image && c.text).map((card, i) => (
                                    <div key={i} onClick={() => selectVocabCard(card)}
                                        style={{ cursor: 'pointer', background: '#F5F5F5', borderRadius: '12px', border: '2px solid #E0E0E0', padding: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'border-color 0.15s, background 0.15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#26A69A'; e.currentTarget.style.background = '#E0F2F1'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.background = '#F5F5F5'; }}>
                                        <img src={card.image!} alt={card.text} style={{ width: '58px', height: '58px', objectFit: 'contain' }} />
                                        <span style={{ fontSize: '0.7em', fontWeight: 700, color: TT.text, textAlign: 'center' }}>{card.text}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>,
            document.body
            )}
            {showScoreboard && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
                    <Scoreboard isFullscreen={true} returnFrom="Memory Match" onReturnFrom={() => setShowScoreboard(false)} />
                </div>
            )}
        </div>
    );
};

export default MemoryMatchGame;
