import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, Volume2, VolumeX, RotateCw, Edit, Sparkles } from 'lucide-react';
import { soundManager } from '../games/soundManager';
import { TT, TTBtn, TTCard, TTHeader, TTGameHeader, TTModal } from '../games/TTGameComponents';

const ACCENT = '#8E24AA';

const DEFAULT_SEGMENTS = [
    { text: "What's your name?", color: "#EF4444" },
    { text: "How are you?", color: "#F97316" },
    { text: "How old are you?", color: "#EAB308" },
    { text: "What color is this?", color: "#22C55E" },
    { text: "Do you like pizza?", color: "#06B6D4" },
    { text: "Can you swim?", color: "#3B82F6" },
    { text: "Stand up!", color: "#A855F7" },
    { text: "Sit down!", color: "#EC4899" },
];

interface Segment { text: string; color: string; }
interface SavedSetup { name: string; segments: Segment[]; }
interface Props { isFullscreen: boolean; onGoToScoreboard?: () => void; }

const SAVED_SETUPS_KEY = 'spinSpeakSavedSetups';

const SpinAndSpeakGame: React.FC<Props> = ({ isFullscreen, onGoToScoreboard }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [segments, setSegments] = useState<Segment[]>(() => {
        const saved = localStorage.getItem('spinSpeakSegments');
        return saved ? JSON.parse(saved) : DEFAULT_SEGMENTS;
    });
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isMuted, setIsMuted] = useState(() => soundManager.muted);
    const [editInput, setEditInput] = useState("");
    const [editColor, setEditColor] = useState("#3B82F6");
    const [savedSetups, setSavedSetups] = useState<SavedSetup[]>(() => {
        try { const r = localStorage.getItem(SAVED_SETUPS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
    });
    const [setupName, setSetupName] = useState('');
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setContainerSize({ width: el.clientWidth, height: el.clientHeight });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        localStorage.setItem('spinSpeakSegments', JSON.stringify(segments));
        if (!isSpinning && containerSize.width > 0) drawWheel(rotation);
    }, [segments, rotation, containerSize]);

    const drawWheel = (currentRotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#FDD835';
        ctx.fill();
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#F9A825';
        ctx.stroke();

        const totalSegments = segments.length;
        const arcSize = (2 * Math.PI) / totalSegments;

        const fontSize = Math.max(11, Math.floor(radius * 0.09));
        const hubR = Math.max(22, radius * 0.12);
        const hubInner = Math.max(15, radius * 0.085);
        const ptrW = Math.max(12, radius * 0.065);
        const ptrH = Math.max(5, radius * 0.03);

        segments.forEach((segment, i) => {
            const angle = currentRotation + (i * arcSize);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "white";
            ctx.font = `bold ${fontSize}px 'Poppins', sans-serif`;
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            const maxTextWidth = radius - hubR - fontSize;
            const lineH = fontSize * 1.3;
            const words = segment.text.split(' ');
            const lines: string[] = [];
            let cur = words[0] ?? '';
            for (let w = 1; w < words.length; w++) {
                const test = cur + ' ' + words[w];
                if (ctx.measureText(test).width <= maxTextWidth) cur = test;
                else { lines.push(cur); cur = words[w]; }
            }
            lines.push(cur);
            const startY = -(lines.length - 1) * lineH / 2 + fontSize * 0.35;
            lines.forEach((line, li) => ctx.fillText(line, radius - fontSize * 0.8, startY + li * lineH));
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, hubR, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubInner, 0, 2 * Math.PI);
        ctx.fillStyle = ACCENT;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(centerX + ptrW, centerY - radius - ptrW);
        ctx.lineTo(centerX - ptrW, centerY - radius - ptrW);
        ctx.lineTo(centerX, centerY - radius + ptrH);
        ctx.fillStyle = '#FDD835';
        ctx.fill();
        ctx.strokeStyle = '#F9A825';
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const spinWheel = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSelectedSegment(null);
        soundManager.play('switch');

        let currentRot = rotation;
        const spinDuration = 4000;
        const spinForce = Math.random() * 10 + 20;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / spinDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentSpeed = spinForce * (1 - ease);
            currentRot += currentSpeed * 0.1;
            drawWheel(currentRot);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                setRotation(currentRot % (2 * Math.PI));
                determineWinner(currentRot % (2 * Math.PI));
            }
        };
        requestAnimationFrame(animate);
    };

    const determineWinner = (finalRotation: number) => {
        const totalSegments = segments.length;
        const arcSize = (2 * Math.PI) / totalSegments;
        const pointerAngle = (3 * Math.PI) / 2;

        for (let i = 0; i < totalSegments; i++) {
            let start = (finalRotation + i * arcSize) % (2 * Math.PI);
            let end = (start + arcSize) % (2 * Math.PI);
            if (start < 0) start += 2 * Math.PI;
            if (end < 0) end += 2 * Math.PI;
            let isMatch = false;
            if (start < end) {
                if (pointerAngle >= start && pointerAngle < end) isMatch = true;
            } else {
                if (pointerAngle >= start || pointerAngle < end) isMatch = true;
            }
            if (isMatch) {
                setTimeout(() => {
                    setSelectedSegment(segments[i]);
                    soundManager.play('win');
                }, 500);
                return;
            }
        }
    };

    const saveSetup = () => {
        const name = setupName.trim();
        if (!name) { alert('Please enter a name for this setup.'); return; }
        setSavedSetups(prev => {
            const updated = [...prev];
            const i = updated.findIndex(s => s.name === name);
            const entry = { name, segments: [...segments] };
            if (i >= 0) updated[i] = entry; else updated.push(entry);
            try { localStorage.setItem(SAVED_SETUPS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
        });
        setSetupName('');
    };

    const loadSetup = (setup: SavedSetup) => {
        setSegments([...setup.segments]);
        setShowEditor(false);
        soundManager.play('switch');
    };

    const deleteSetup = (name: string) => {
        setSavedSetups(prev => {
            const updated = prev.filter(s => s.name !== name);
            try { localStorage.setItem(SAVED_SETUPS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
        });
    };

    const addSegment = () => {
        if (!editInput) return;
        setSegments([...segments, { text: editInput, color: editColor }]);
        setEditInput("");
        setEditColor('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    };

    const removeSegment = (index: number) => {
        if (segments.length <= 1) return;
        setSegments(segments.filter((_, i) => i !== index));
    };

    const toggleMute = () => {
        const newMuted = soundManager.toggleMute();
        setIsMuted(newMuted);
    };

    return (
        <div style={{ width: '100%', height: '100%', background: TT.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}>
            <TTGameHeader
                color={ACCENT}
                left={<span style={{ fontWeight: 900, fontSize: '1.1em', color: ACCENT }}>SPIN & SPEAK</span>}
                right={
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', paddingRight: isFullscreen ? '52px' : 0 }}>
                        <TTBtn onClick={onGoToScoreboard} variant="yellow" size="sm">🏅</TTBtn>
                        <TTBtn onClick={toggleMute} variant={isMuted ? "red" : "orange"} size="sm" icon={isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />} />
                        <TTBtn onClick={() => setShowEditor(true)} variant="purple" size="sm" icon={<Edit size={16} />} />
                    </div>
                }
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', gap: '16px' }}>
                <div ref={containerRef} style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                    {(() => {
                        const sz = Math.min(containerSize.width, containerSize.height) || 300;
                        return (
                            <canvas
                                ref={canvasRef}
                                width={sz}
                                height={sz}
                                style={{ display: 'block' }}
                            />
                        );
                    })()}
                </div>
                <TTBtn
                    onClick={spinWheel}
                    disabled={isSpinning}
                    variant="purple"
                    size="xl"
                    icon={<RotateCw size={22} style={{ animation: isSpinning ? 'spin 0.8s linear infinite' : 'none' }} />}
                >
                    {isSpinning ? "SPINNING..." : "SPIN IT!"}
                </TTBtn>
            </div>

            <AnimatePresence>
                {selectedSegment && (
                    <TTModal onClick={() => setSelectedSegment(null)}>
                        <motion.div
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            style={{ width: '100%', maxWidth: 'min(90vw, 620px)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <TTCard>
                                <TTHeader text="YOUR RESULT!" color={ACCENT} size="lg" />
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                    <Sparkles style={{ color: '#F9A825', width: '48px', height: '48px' }} />
                                    <div style={{ background: selectedSegment.color, padding: '24px 28px', borderRadius: '16px', width: '100%', textAlign: 'center', boxShadow: '0 5px 0 rgba(0,0,0,0.2)' }}>
                                        <h2 style={{ fontSize: 'clamp(1.4em, 5vw, 2.4em)', fontWeight: 900, color: 'white', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'break-word', margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{selectedSegment.text}</h2>
                                    </div>
                                    <TTBtn onClick={() => setSelectedSegment(null)} variant="purple" size="xl">AWESOME!</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showEditor && (
                    <TTModal onClick={() => setShowEditor(false)}>
                        <motion.div
                            initial={{ y: 50 }} animate={{ y: 0 }}
                            style={{ width: '100%', maxWidth: '440px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <TTCard style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
                                <TTHeader text="WHEEL EDITOR" color={ACCENT} />
                                <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            value={editInput}
                                            onChange={e => setEditInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addSegment()}
                                            placeholder="Type a new option..."
                                            style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '10px 14px', color: TT.text, fontWeight: 700, border: `2px solid ${TT.border}`, outline: 'none', fontFamily: 'Poppins, sans-serif' }}
                                        />
                                        <input
                                            type="color"
                                            value={editColor}
                                            onChange={e => setEditColor(e.target.value)}
                                            style={{ width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer', border: '2px solid white', padding: '2px', boxSizing: 'border-box' }}
                                        />
                                        <button
                                            onClick={addSegment}
                                            style={{ width: '44px', height: '44px', background: '#66BB6A', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 #2E7D32', color: 'white', flexShrink: 0 }}
                                        >
                                            <Plus size={22} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {segments.map((seg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FAFAFA', padding: '10px 12px', borderRadius: '12px', border: '1px solid #F0F0F0' }}
                                            >
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: seg.color, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', flexShrink: 0 }} />
                                                <span style={{ flex: 1, fontWeight: 700, color: TT.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95em' }}>{seg.text}</span>
                                                <button
                                                    onClick={() => removeSegment(i)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BDBDBD', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#EF5350')}
                                                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#BDBDBD')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ padding: '12px 16px', borderTop: `2px solid ${TT.border}`, background: TT.bg, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '0.8em', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Setups</div>
                                    {/* Load row */}
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <select
                                            defaultValue=""
                                            onChange={e => { if (e.target.value) { const s = savedSetups.find(x => x.name === e.target.value); if (s) loadSetup(s); } e.target.value = ''; }}
                                            style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '8px 10px', color: TT.text, fontWeight: 600, border: `2px solid ${TT.border}`, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '0.9em', cursor: 'pointer' }}
                                        >
                                            <option value="" disabled>Load a saved setup…</option>
                                            {savedSetups.map(s => <option key={s.name} value={s.name}>{s.name} ({s.segments.length} items)</option>)}
                                        </select>
                                        <button
                                            onClick={() => { const name = setupName.trim(); if (!name) { alert('Enter a name to delete.'); return; } deleteSetup(name); }}
                                            title="Delete setup by name"
                                            style={{ height: '38px', width: '38px', background: '#EF5350', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 #B71C1C', color: 'white', flexShrink: 0 }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                    {/* Save row */}
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            value={setupName}
                                            onChange={e => setSetupName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && saveSetup()}
                                            placeholder="Setup name..."
                                            style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '8px 12px', color: TT.text, fontWeight: 600, border: `2px solid ${TT.border}`, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '0.9em' }}
                                        />
                                        <button
                                            onClick={saveSetup}
                                            style={{ height: '38px', padding: '0 14px', background: '#8E24AA', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 #6A0080', color: 'white', fontWeight: 700, fontSize: '0.85em', gap: '4px', flexShrink: 0 }}
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                    </div>
                                    <TTBtn onClick={() => setShowEditor(false)} variant="purple" size="lg" style={{ width: '100%' }} icon={<Save size={18} />}>DONE</TTBtn>
                                </div>
                            </TTCard>
                        </motion.div>
                    </TTModal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpinAndSpeakGame;
