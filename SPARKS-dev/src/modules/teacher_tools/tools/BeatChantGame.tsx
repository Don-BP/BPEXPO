import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCcw, ChevronRight, X, Music, FastForward, Info,
    Volume2, VolumeX, Settings, Plus, Save, Edit3, Sparkles,
    CheckCircle2, Shuffle, Award, Zap, QrCode, Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../games/soundManager';

// ── Inline Neon Design System ─────────────────────────────────────────────────

type NeonCardVariant = 'blue' | 'purple' | 'green' | 'yellow' | 'dark' | 'default';

const NEON_CARD: Record<NeonCardVariant, { container: string; border: string; shadow: string }> = {
    blue:    { container: 'bg-[#2885FF]',         border: 'border-4 border-[#8DC3FF]',  shadow: 'shadow-[0_8px_0_#004E98,0_12px_20px_rgba(0,0,0,0.3)]' },
    purple:  { container: 'bg-[#7B2CBF]',         border: 'border-4 border-[#C77DFF]',  shadow: 'shadow-[0_8px_0_#3C096C,0_12px_20px_rgba(0,0,0,0.3)]' },
    green:   { container: 'bg-[#66BB6A]',         border: 'border-4 border-[#A5D6A7]',  shadow: 'shadow-[0_8px_0_#1B5E20,0_12px_20px_rgba(0,0,0,0.3)]' },
    yellow:  { container: 'bg-[#FBC02D]',         border: 'border-4 border-[#FFF59D]',  shadow: 'shadow-[0_8px_0_#F57F17,0_12px_20px_rgba(0,0,0,0.3)]' },
    dark:    { container: 'bg-[#1f2937]',         border: 'border-4 border-[#374151]',  shadow: 'shadow-[0_8px_0_#111827]' },
    default: { container: 'bg-[#1f2937]/80 backdrop-blur-md', border: 'border-4 border-white/10', shadow: 'shadow-2xl' },
};

interface NCProps { children: React.ReactNode; className?: string; variant?: NeonCardVariant; onClick?: () => void; }
const NeonCard: React.FC<NCProps> = ({ children, className = '', variant = 'blue', onClick }) => {
    const s = NEON_CARD[variant] || NEON_CARD.blue;
    return (
        <motion.div onClick={onClick} className={`relative rounded-3xl p-1 ${s.shadow} ${className}`}>
            <div className={`relative px-6 py-6 w-full h-full rounded-[20px] ${s.container} ${s.border} flex flex-col items-center box-border`}>
                <div className="absolute inset-x-2 top-2 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-[14px] pointer-events-none" />
                <div className="relative z-10 w-full">{children}</div>
            </div>
        </motion.div>
    );
};

type NBVariant = 'blue' | 'pink' | 'yellow' | 'orange' | 'green' | 'default';
const NEON_BTN: Record<NBVariant, string> = {
    blue:    'bg-[#2885FF] border-[#8DC3FF] shadow-[0_6px_0_#004E98,0_10px_0_rgba(0,0,0,0.2)]',
    pink:    'bg-[#E943D5] border-[#FF99F5] shadow-[0_6px_0_#A60098,0_10px_0_rgba(0,0,0,0.2)]',
    yellow:  'bg-[#FBC02D] border-[#FFF59D] shadow-[0_6px_0_#F57F17,0_10px_0_rgba(0,0,0,0.2)]',
    orange:  'bg-[#F55926] border-[#FFAB91] shadow-[0_6px_0_#BF360C,0_10px_0_rgba(0,0,0,0.2)]',
    green:   'bg-[#66BB6A] border-[#A5D6A7] shadow-[0_6px_0_#1B5E20,0_10px_0_rgba(0,0,0,0.2)]',
    default: 'bg-white/10 border-white/20 shadow-[0_6px_0_rgba(0,0,0,0.3)]',
};
interface NBProps { children: React.ReactNode; onClick?: () => void; variant?: NBVariant; size?: 'sm' | 'md' | 'lg'; className?: string; disabled?: boolean; }
const NeonButton: React.FC<NBProps> = ({ children, onClick, variant = 'blue', size = 'md', className = '', disabled }) => {
    const s = NEON_BTN[variant] || NEON_BTN.blue;
    const sz = { sm: 'px-4 py-1 text-sm min-w-[80px]', md: 'px-8 py-3 text-xl min-w-[140px]', lg: 'px-10 py-4 text-2xl min-w-[180px]' };
    return (
        <motion.button whileHover={disabled ? {} : { scale: 1.05, filter: 'brightness(1.1)' }} whileTap={disabled ? {} : { scale: 0.95, y: 4 }}
            onClick={disabled ? undefined : onClick} disabled={disabled}
            className={`relative rounded-full font-black text-white uppercase tracking-wider border-t-4 border-l-2 border-r-2 border-b-0 ${s} ${sz[size]} ${className}`}>
            <div className="absolute top-1 left-2 right-2 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
            <span className="drop-shadow-md relative z-10">{children}</span>
        </motion.button>
    );
};

const NeonProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'green' }) => {
    const bars: Record<string, string> = { green: 'bg-[#76e66e]', purple: 'bg-[#c084fc]', yellow: 'bg-[#fcd34d]' };
    return (
        <div className="flex-1 h-8 relative rounded-full bg-[#2d1b4e] border-2 border-white/20 overflow-hidden shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ type: 'spring', stiffness: 50 }}
                className={`h-full rounded-full ${bars[color] || bars.green} shadow-[0_2px_10px_rgba(0,0,0,0.2)] relative`}>
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-full pointer-events-none" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-between px-4 font-bold text-white drop-shadow-md z-10">
                <span className="text-sm opacity-80 uppercase tracking-widest">Energy</span>
                <span className="text-sm">{value}%</span>
            </div>
        </div>
    );
};

// ── Difficulty theme ──────────────────────────────────────────────────────────
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'Easy':       return { variant: 'green'  as NeonCardVariant, text: 'text-green-300',  bg: 'bg-green-900/50',  accent: 'text-green-400',  glow: 'shadow-[0_0_80px_rgba(34,197,94,0.2)]',   grad: 'from-green-600/20 to-emerald-600/20'  };
        case 'Medium':     return { variant: 'blue'   as NeonCardVariant, text: 'text-blue-300',   bg: 'bg-blue-900/50',   accent: 'text-blue-400',   glow: 'shadow-[0_0_80px_rgba(37,99,235,0.2)]',  grad: 'from-blue-600/20 to-indigo-600/20'    };
        case 'Hard':       return { variant: 'purple' as NeonCardVariant, text: 'text-purple-300', bg: 'bg-purple-900/50', accent: 'text-purple-400', glow: 'shadow-[0_0_80px_rgba(168,85,247,0.2)]', grad: 'from-purple-600/20 to-pink-600/20'    };
        case 'Impossible': return { variant: 'yellow' as NeonCardVariant, text: 'text-yellow-300', bg: 'bg-yellow-900/50', accent: 'text-yellow-400', glow: 'shadow-[0_0_80px_rgba(250,204,21,0.2)]',  grad: 'from-yellow-600/20 to-orange-600/20'  };
        default:           return { variant: 'blue'   as NeonCardVariant, text: 'text-blue-300',   bg: 'bg-blue-900/50',   accent: 'text-blue-400',   glow: 'shadow-[0_0_80px_rgba(37,99,235,0.2)]',  grad: 'from-blue-600/20 to-indigo-600/20'    };
    }
};

// ── Data ──────────────────────────────────────────────────────────────────────

const CHANT_BG_IMAGES = [
    'apple_worm.png', 'bee.png', 'bike_square.png', 'boombox.png',
    'bubbles.png', 'cola.png', 'flower_head.png', 'icecream.png',
    'paper_plane.png', 'rc_car.png', 'stickman.png', 'tv_smash.png',
    'weener_dog.png',
];

const INITIAL_PACKS = [
    { id: 'animals-easy', name: 'Animals', difficulty: 'Easy', category: 'Thematic', startingBPM: 100, accelerationRate: 3.5, words: [{ text: 'Cat', icon: '🐱', color: '#FF9999' }, { text: 'Dog', icon: '🐶', color: '#99FF99' }, { text: 'Bird', icon: '🐦', color: '#9999FF' }, { text: 'Fish', icon: '🐠', color: '#FFFF99' }, { text: 'Lion', icon: '🦁', color: '#FFCC99' }, { text: 'Tiger', icon: '🐯', color: '#FFCC99' }, { text: 'Bear', icon: '🐻', color: '#C0C0C0' }, { text: 'Frog', icon: '🐸', color: '#99FF99' }] },
    { id: 'mext-grade3', name: 'MEXT Gr. 3 Basic', difficulty: 'Medium', category: 'MEXT', startingBPM: 120, accelerationRate: 4.5, words: [{ text: 'Hello', icon: '👋', color: '#FF6B6B' }, { text: 'Apple', icon: '🍎', color: '#FF6B6B' }, { text: 'Book', icon: '📖', color: '#4facfe' }, { text: 'Pencil', icon: '✏️', color: '#f6d365' }, { text: 'Thank you', icon: '🙏', color: '#84fab0' }, { text: 'Red', icon: '🟥', color: '#FF0000' }, { text: 'Blue', icon: '🟦', color: '#0000FF' }, { text: 'One', icon: '1️⃣', color: '#FFFFFF' }] },
    { id: 'mext-grade5-food', name: 'Lunch Time!', difficulty: 'Hard', category: 'MEXT', startingBPM: 135, accelerationRate: 6, words: [{ text: 'Rice', icon: '🍚', color: '#FFFFFF' }, { text: 'Bread', icon: '🍞', color: '#F4A460' }, { text: 'Soup', icon: '🥣', color: '#FF6347' }, { text: 'Milk', icon: '🥛', color: '#F0F8FF' }, { text: 'Salad', icon: '🥗', color: '#32CD32' }, { text: 'Pizza', icon: '🍕', color: '#FFA500' }, { text: 'Pasta', icon: '🍝', color: '#FFFFE0' }, { text: 'Fruit', icon: '🍎', color: '#FF4500' }] },
    { id: 'phonics-blends', name: 'Blend Master', difficulty: 'Impossible', category: 'Phonics', startingBPM: 155, accelerationRate: 10, words: [{ text: 'Star', icon: '⭐', color: '#FFD700' }, { text: 'Stop', icon: '🛑', color: '#FF0000' }, { text: 'Step', icon: '👣', color: '#8B4513' }, { text: 'Stay', icon: '🏠', color: '#4169E1' }, { text: 'Stick', icon: '🥢', color: '#DAA520' }, { text: 'Stone', icon: '🪨', color: '#808080' }, { text: 'Stump', icon: '🪵', color: '#A0522D' }, { text: 'Store', icon: '🏪', color: '#FF69B4' }] },
    { id: 'body-parts-medium', name: 'Body Boogie', difficulty: 'Medium', category: 'Thematic', startingBPM: 125, accelerationRate: 5, words: [{ text: 'Head', icon: '🙆', color: '#FFDAB9' }, { text: 'Shoulder', icon: '💪', color: '#FFDAB9' }, { text: 'Knee', icon: '🦵', color: '#FFDAB9' }, { text: 'Toe', icon: '🦶', color: '#FFDAB9' }, { text: 'Eye', icon: '👁️', color: '#87CEEB' }, { text: 'Ear', icon: '👂', color: '#FFDAB9' }, { text: 'Mouth', icon: '👄', color: '#FF0000' }, { text: 'Nose', icon: '👃', color: '#FFDAB9' }] },
    { id: 'weather-hard', name: 'Storm Chaser', difficulty: 'Hard', category: 'Thematic', startingBPM: 145, accelerationRate: 8, words: [{ text: 'Sunny', icon: '☀️', color: '#FFD700' }, { text: 'Rainy', icon: '🌧️', color: '#4682B4' }, { text: 'Cloudy', icon: '☁️', color: '#D3D3D3' }, { text: 'Snowy', icon: '❄️', color: '#F0FFFF' }, { text: 'Windy', icon: '🌬️', color: '#ADD8E6' }, { text: 'Stormy', icon: '⚡', color: '#4B0082' }, { text: 'Rainbow', icon: '🌈', color: '#FF1493' }, { text: 'Foggy', icon: '🌫️', color: '#778899' }] },
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

type Pack = {
    id: string; name: string; difficulty: string; category: string;
    startingBPM: number; accelerationRate: number;
    words: { text: string; icon: string; color: string }[];
    roundWords?: Record<number, { text: string; icon: string }[]>;
    randomizeCards?: boolean; isModified?: boolean;
};

interface Props { isFullscreen: boolean; onGoHome?: () => void; }

const BeatChantGame: React.FC<Props> = ({ onGoHome }) => {
    const [gameState, setGameState] = useState<'menu' | 'settings' | 'countdown' | 'playing' | 'round-end' | 'level-end' | 'creator'>('menu');
    const [selectedPack, setSelectedPack] = useState<Pack>(INITIAL_PACKS[0]);
    const [gameWords, setGameWords] = useState<{ text: string; icon: string; color?: string }[]>([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(5);
    const [currentBPM, setCurrentBPM] = useState(100);
    const [activeSlot, setActiveSlot] = useState(-1);
    const [countdown, setCountdown] = useState(8);
    const [isMuted, setIsMuted] = useState(() => soundManager.muted);
    const [enableDrumLoop, setEnableDrumLoop] = useState(true);
    const [showBPMMeter, setShowBPMMeter] = useState(true);
    const [roundPause, setRoundPause] = useState(true);
    const [lockBPM, setLockBPM] = useState(false);
    const [customPacks, setCustomPacks] = useState<Pack[]>([]);
    const [overriddenDefaults, setOverriddenDefaults] = useState<Record<string, Pack>>({});
    const [editingPackId, setEditingPackId] = useState<string | null>(null);
    const [roundImages, setRoundImages] = useState<any[]>([]);
    const [beatPulse, setBeatPulse] = useState(0);
    const [fadingOut, setFadingOut] = useState(false);

    const displayPacks = useMemo((): Pack[] => {
        const processed = INITIAL_PACKS.map(pack =>
            overriddenDefaults[pack.id] ? { ...overriddenDefaults[pack.id], isModified: true } : pack
        );
        return [...processed, ...customPacks];
    }, [customPacks, overriddenDefaults]);

    const [creatorData, setCreatorData] = useState({
        name: '', startingBPM: 120, difficulty: 'Medium', randomizeCards: true,
        roundWords: { 1: Array(8).fill({ text: '', icon: '❓' }), 2: Array(8).fill({ text: '', icon: '❓' }), 3: Array(8).fill({ text: '', icon: '❓' }), 4: Array(8).fill({ text: '', icon: '❓' }), 5: Array(8).fill({ text: '', icon: '❓' }) },
    });
    const [currentCreatorRound, setCurrentCreatorRound] = useState(1);

    const timerRef = useRef<number | null>(null);
    const beatIndexRef = useRef(0);
    const roundPauseRef = useRef(roundPause);
    const handleNextRoundRef = useRef<(() => void) | null>(null);
    const startRoundRef = useRef<((bpm?: number, continuous?: boolean) => void) | null>(null);

    useEffect(() => { roundPauseRef.current = roundPause; }, [roundPause]);

    const playSound = useCallback((type: string) => {
        if (!isMuted) soundManager.play(type);
    }, [isMuted]);

    const stopGame = useCallback((stopAudio = true) => {
        if (timerRef.current) { cancelAnimationFrame(timerRef.current); timerRef.current = null; }
        soundManager.stopLoop();
        if (stopAudio) soundManager.stopBGM();
    }, []);

    const handleExit = useCallback((targetState: string = 'menu') => {
        stopGame();
        setFadingOut(true);
        soundManager.playBGM(`${import.meta.env.BASE_URL}audio/beat_chant_bgm/exit_win_loop.mp3`, 92, 92);
        setTimeout(() => {
            setGameState(targetState as any);
            setFadingOut(false);
            soundManager.stopBGM();
        }, 3000);
    }, [stopGame]);

    const triggerConfetti = useCallback((type: string = 'round') => {
        if (type === 'round') {
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, colors: ['#4ade80', '#fbbf24', '#60a5fa'], zIndex: 200 });
        } else {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) { clearInterval(interval); return; }
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } });
            }, 250);
        }
    }, []);

    const startRound = useCallback((bpm: number = currentBPM, continuous: boolean = false) => {
        stopGame(!continuous);
        beatIndexRef.current = -1;
        setActiveSlot(-1);
        setCountdown(8);
        setGameState('countdown');

        const roundSpecificWords = selectedPack.roundWords?.[currentRound];
        const round1Words = selectedPack.roundWords?.[1] || selectedPack.words;
        const hasSpecificWords = roundSpecificWords && roundSpecificWords.some((w: any) => w.text.trim() !== '');
        let wordsToUse = hasSpecificWords ? [...roundSpecificWords] : [...round1Words];
        let finalWords = selectedPack.randomizeCards !== false ? shuffleArray(wordsToUse) : wordsToUse;
        setGameWords(finalWords);

        const shuffledImgs = shuffleArray(CHANT_BG_IMAGES);
        const quadrants = [{ xRange: [0, 15], yRange: [0, 15] }, { xRange: [75, 90], yRange: [0, 15] }, { xRange: [0, 15], yRange: [75, 90] }, { xRange: [75, 90], yRange: [75, 90] }];
        const shuffledQ = shuffleArray(quadrants);
        const selectedImgs = shuffledImgs.slice(0, 4).map((img: string, i: number) => {
            const quad = shuffledQ[i];
            return {
                url: `${import.meta.env.BASE_URL}chant_bg_art/${img}`,
                x: `${quad.xRange[0] + Math.random() * (quad.xRange[1] - quad.xRange[0])}%`,
                y: `${quad.yRange[0] + Math.random() * (quad.yRange[1] - quad.yRange[0])}%`,
                baseRotation: Math.random() * 40 - 20,
                jumpHeight: 20 + Math.random() * 30,
                twistAmount: 10 + Math.random() * 25,
                scalePulse: 1.1 + Math.random() * 0.3,
                shakeX: Math.random() * 20 - 10,
            };
        });
        setRoundImages(selectedImgs);

        const beatAudio = `${import.meta.env.BASE_URL}audio/beat_chant_bgm/beat_chant_BGM_1.mp3`;
        const SYNC_OFFSET = 0.05;
        let roundAnchorTime = 0;
        const isAlreadyPlaying = soundManager.isBGMPlaying(beatAudio);
        if (continuous && isAlreadyPlaying) {
            soundManager.setBGMTempo(bpm);
            // Pre-add SYNC_OFFSET so it cancels in the loop — prevents 50ms/round cumulative drift
            roundAnchorTime = soundManager.getAudioTime() + SYNC_OFFSET;
        } else {
            soundManager.playBGM(beatAudio, bpm, 92);
            roundAnchorTime = soundManager.getAudioTime();
        }

        const syncLoop = () => {
            const currentTime = soundManager.getAudioTime();
            if (!currentTime && !continuous) { timerRef.current = requestAnimationFrame(syncLoop); return; }
            const elapsed = (currentTime - roundAnchorTime) + SYNC_OFFSET;
            const beatDuration = 60 / (bpm * 2);
            const currentBeat = Math.floor(elapsed / beatDuration);
            if (currentBeat !== beatIndexRef.current) {
                beatIndexRef.current = currentBeat;
                setBeatPulse(prev => prev + 1);
                if (currentBeat < 8) {
                    setGameState('countdown');
                    setCountdown(8 - currentBeat);
                    playSound('metronome');
                } else if (currentBeat < 16) {
                    setGameState('playing');
                    setActiveSlot(currentBeat - 8);
                    playSound('metronome');
                } else {
                    stopGame(roundPauseRef.current);
                    setActiveSlot(-1);
                    if (roundPauseRef.current) {
                        setGameState('round-end');
                        const winAudio = `${import.meta.env.BASE_URL}audio/beat_chant_bgm/win_loop_1.mp3`;
                        soundManager.playBGM(winAudio, bpm, 92);
                        playSound('correct');
                        triggerConfetti('round');
                    } else {
                        beatIndexRef.current = -1;
                        handleNextRoundRef.current?.();
                    }
                    return;
                }
            }
            timerRef.current = requestAnimationFrame(syncLoop);
        };
        timerRef.current = requestAnimationFrame(syncLoop);
    }, [playSound, stopGame, selectedPack, triggerConfetti, currentBPM]);

    startRoundRef.current = startRound;

    const handleNextRound = useCallback(async () => {
        await soundManager.initContext();
        const nextRound = currentRound + 1;
        if (nextRound > totalRounds) {
            setGameState('level-end');
            soundManager.playBGM(`${import.meta.env.BASE_URL}audio/beat_chant_bgm/win_loop_1.mp3`, 92, 92);
            triggerConfetti('level');
        } else {
            const nextBPM = lockBPM ? currentBPM : currentBPM + selectedPack.accelerationRate;
            setCurrentRound(nextRound);
            setCurrentBPM(nextBPM);
            startRound(nextBPM, !roundPause);
        }
        playSound('start');
    }, [currentRound, selectedPack.accelerationRate, playSound, startRound, currentBPM, triggerConfetti, roundPause, lockBPM]);

    handleNextRoundRef.current = handleNextRound;

    useEffect(() => {
        soundManager.preloadBGM(`${import.meta.env.BASE_URL}audio/beat_chant_bgm/beat_chant_BGM_1.mp3`);
        soundManager.preloadBGM(`${import.meta.env.BASE_URL}audio/beat_chant_bgm/win_loop_1.mp3`);
        soundManager.preloadBGM(`${import.meta.env.BASE_URL}audio/beat_chant_bgm/exit_win_loop.mp3`);
    }, []);

    useEffect(() => {
        return () => { soundManager.stopLoop(); soundManager.stopBGM(); if (timerRef.current) cancelAnimationFrame(timerRef.current); };
    }, []);

    // Push a history entry once when leaving the menu so back button has something to pop
    useEffect(() => {
        if (gameState !== 'menu' && !window.history.state?.beatChantGame) {
            window.history.pushState({ beatChantGame: true }, '');
        }
    }, [gameState]);

    // Back button → exit sequence then return to Beat Chant menu
    useEffect(() => {
        const handlePopState = () => {
            if (fadingOut) return;
            handleExit('menu');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [handleExit, fadingOut]);

    const handleSelectPack = (pack: Pack) => {
        setSelectedPack(pack); setCurrentBPM(pack.startingBPM); setCurrentRound(1); setTotalRounds(5);
        setGameState('settings'); playSound('switch');
    };
    const handleRandomPack = () => { const r = displayPacks[Math.floor(Math.random() * displayPacks.length)]; handleSelectPack(r); };
    const handleRestart = async () => {
        await soundManager.initContext();
        setCurrentRound(1);
        const startBPM = selectedPack.startingBPM;
        setCurrentBPM(startBPM);
        startRound(startBPM);
    };
    const handleEditPack = (pack: Pack) => {
        let initialRoundWords: { 1: any[]; 2: any[]; 3: any[]; 4: any[]; 5: any[] } = { 1: Array(8).fill({ text: '', icon: '❓' }), 2: Array(8).fill({ text: '', icon: '❓' }), 3: Array(8).fill({ text: '', icon: '❓' }), 4: Array(8).fill({ text: '', icon: '❓' }), 5: Array(8).fill({ text: '', icon: '❓' }) };
        if (pack.roundWords) { initialRoundWords = pack.roundWords as any; }
        else if (pack.words) { initialRoundWords[1] = pack.words.map(w => ({ ...w, icon: w.icon || '❓' })); }
        setCreatorData({ name: pack.name, startingBPM: pack.startingBPM, difficulty: pack.difficulty, randomizeCards: pack.randomizeCards !== false, roundWords: initialRoundWords });
        setEditingPackId(pack.id); setGameState('creator'); playSound('switch');
    };
    const handleResetDefault = (packId: string) => {
        const n = { ...overriddenDefaults }; delete n[packId]; setOverriddenDefaults(n); setGameState('menu'); playSound('pop');
    };
    const handleSaveCopy = () => {
        const newPack: Pack = { ...creatorData, id: `custom-${Date.now()}`, category: 'Custom', accelerationRate: 5, words: (creatorData.roundWords[1] as any[]) };
        setCustomPacks([...customPacks, newPack]); setGameState('menu'); playSound('correct');
    };
    const handleSaveCustom = () => {
        if (!creatorData.name) return;
        const packData = { ...creatorData, category: 'Custom', accelerationRate: 5, words: (creatorData.roundWords[1] as any[]) };
        if (editingPackId && INITIAL_PACKS.some(p => p.id === editingPackId)) {
            const original = INITIAL_PACKS.find(p => p.id === editingPackId)!;
            setOverriddenDefaults({ ...overriddenDefaults, [editingPackId]: { ...original, ...packData, id: editingPackId, category: original.category, accelerationRate: original.accelerationRate } });
        } else if (editingPackId && customPacks.some(p => p.id === editingPackId)) {
            setCustomPacks(customPacks.map(p => p.id === editingPackId ? { ...p, ...packData, id: editingPackId } : p));
        } else {
            setCustomPacks([...customPacks, { ...packData, id: `custom-${Date.now()}` } as Pack]);
        }
        setCreatorData({ name: '', startingBPM: 120, difficulty: 'Medium', randomizeCards: true, roundWords: { 1: Array(8).fill({ text: '', icon: '❓' }), 2: Array(8).fill({ text: '', icon: '❓' }), 3: Array(8).fill({ text: '', icon: '❓' }), 4: Array(8).fill({ text: '', icon: '❓' }), 5: Array(8).fill({ text: '', icon: '❓' }) } });
        setEditingPackId(null); setCurrentCreatorRound(1); setGameState('menu'); playSound('correct');
    };
    const toggleMute = () => { const m = soundManager.toggleMute(); setIsMuted(m); };

    // ── RENDER MENU ───────────────────────────────────────────────────────────
    const renderMenu = () => (
        <div className="flex flex-col items-center gap-8 w-full max-w-6xl px-4 py-12">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-50">
                    <Zap className="text-yellow-400 rotate-12" />
                    <Zap className="text-yellow-400 -rotate-12" />
                </div>
                <h1 className="text-8xl font-black text-white mb-2 tracking-tighter italic skew-x-[-10deg]">BEAT CHANT</h1>
                <div className="flex items-center justify-center gap-4 bg-white/5 py-2 px-6 rounded-full border border-white/10 backdrop-blur-md">
                    <Sparkles className="text-yellow-400" size={20} />
                    <p className="text-blue-300 font-black uppercase tracking-[0.3em] text-sm">Brain Power Rhythm Challenge</p>
                    <Sparkles className="text-yellow-400" size={20} />
                </div>
            </motion.div>

            <div className="flex gap-4 mb-8">
                <NeonButton variant="yellow" size="md" onClick={handleRandomPack} className="flex gap-2">
                    <Shuffle size={20} /> RANDOM PLAY
                </NeonButton>
                <NeonButton variant="blue" size="md" onClick={() => { setEditingPackId(null); setGameState('creator'); }} className="flex gap-2">
                    <Plus size={20} /> CREATE NEW
                </NeonButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {displayPacks.map((pack, idx) => (
                    <motion.div key={pack.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} className="relative group">
                        <button onClick={e => { e.stopPropagation(); handleEditPack(pack); }}
                            className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                            <Edit3 size={14} />
                        </button>
                        {pack.isModified && <div className="absolute -top-2 -left-2 z-20 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white/20">EDITED</div>}
                        <NeonCard className={`cursor-pointer h-full border-2 transition-all ${selectedPack.id === pack.id ? 'border-yellow-400 ring-4 ring-yellow-400/20' : 'border-transparent opacity-90 hover:opacity-100'}`}
                            variant={getDifficultyColor(pack.difficulty).variant} onClick={() => handleSelectPack(pack)}>
                            <div className="flex flex-col h-full p-4 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 z-10">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter mb-1 w-fit ${getDifficultyColor(pack.difficulty).bg} ${getDifficultyColor(pack.difficulty).text}`}>{pack.difficulty}</span>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{pack.category}</span>
                                    </div>
                                    <Music className="text-white/20 group-hover:text-white/50 transition-colors" size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-6 group-hover:text-yellow-400 transition-colors line-clamp-1">{pack.name}</h3>
                                <div className="grid grid-cols-4 gap-2 mb-8 bg-black/40 p-3 rounded-2xl">
                                    {pack.words.slice(0, 4).map((w, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <span className="text-2xl mb-1 filter drop-shadow-md">{w.icon}</span>
                                            <span className="text-[8px] text-white/40 font-bold uppercase truncate w-full text-center">{w.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-white/80">
                                    <div className="flex items-center gap-2">
                                        <FastForward size={14} className="text-yellow-400" />
                                        <span className="text-xs font-black italic tracking-tighter">{pack.startingBPM} BPM</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </NeonCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    // ── RENDER SETTINGS ───────────────────────────────────────────────────────
    const renderSettings = () => {
        const theme = getDifficultyColor(selectedPack.difficulty);
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center w-full max-w-2xl px-4 py-8">
                <NeonCard variant={theme.variant} className={`w-full p-8 ${theme.glow} max-h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 relative">
                        <div className="absolute -top-12 -left-4 opacity-10"><Settings size={60} /></div>
                        <div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">BATTLE SETUP</h2>
                            <p className={`${theme.text} text-xs font-bold uppercase tracking-[0.2em] mt-1`}>Configure your challenge parameters</p>
                        </div>
                        <button onClick={() => setGameState('menu')} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all hover:rotate-90">
                            <X className="text-white" />
                        </button>
                    </div>

                    <div className="space-y-10">
                        <div className={`bg-gradient-to-r ${theme.grad} p-6 rounded-3xl border border-white/10 flex items-center gap-6`}>
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-6xl shadow-inner border border-white/10">
                                {selectedPack.words[0].icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{selectedPack.name}</h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-400 text-black rounded uppercase italic">{selectedPack.difficulty}</span>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-white/10 text-white rounded uppercase tracking-widest">{selectedPack.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black"><FastForward size={18} /></div>
                                    Starting Tempo
                                </label>
                                <div className="flex items-baseline gap-1 bg-yellow-400/10 px-4 py-2 rounded-xl border border-yellow-400/20">
                                    <span className="text-4xl font-black text-yellow-400 italic tabular-nums">{currentBPM}</span>
                                    <span className="text-xs font-black text-yellow-400 uppercase italic">BPM</span>
                                </div>
                            </div>
                            <input type="range" min="60" max="250" step="5" value={currentBPM} onChange={e => setCurrentBPM(parseInt(e.target.value))}
                                className="w-full h-4 bg-white/5 rounded-full appearance-none cursor-pointer accent-yellow-400 border border-white/10" />
                            <div className="flex justify-between mt-4 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                                <span>SLOW (60)</span><span>FAST (250)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center text-black"><RotateCcw size={18} /></div>
                                        Total Rounds
                                    </label>
                                    <div className="flex items-baseline gap-1 bg-green-400/10 px-4 py-2 rounded-xl border border-green-400/20">
                                        <span className="text-2xl font-black text-green-400 italic tabular-nums">{totalRounds}</span>
                                    </div>
                                </div>
                                <input type="range" min="5" max="10" step="1" value={totalRounds} onChange={e => setTotalRounds(parseInt(e.target.value))}
                                    className="w-full h-4 bg-white/5 rounded-full appearance-none cursor-pointer accent-green-400 border border-white/10" />
                                <div className="flex justify-between mt-2 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                                    <span>Standard (5)</span><span>Marathon (10)</span>
                                </div>
                            </div>
                            {[
                                { label: 'BPM Meter', state: showBPMMeter, setter: setShowBPMMeter, sub: 'Visual speed indicator' },
                                { label: 'Rhythm Track', state: enableDrumLoop, setter: setEnableDrumLoop, sub: 'Background drum loop' },
                                { label: 'Round Pause', state: roundPause, setter: setRoundPause, sub: 'Wait for click between rounds' },
                                { label: 'Lock BPM', state: lockBPM, setter: setLockBPM, sub: 'Same tempo every round' },
                            ].map((opt, i) => (
                                <button key={i} onClick={() => opt.setter(!opt.state)}
                                    className={`flex flex-col items-start p-5 rounded-3xl border-2 transition-all text-left ${opt.state ? 'bg-green-400/10 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex justify-between items-center w-full mb-1">
                                        <span className={`font-black text-sm uppercase tracking-widest ${opt.state ? 'text-white' : 'text-white/40'}`}>{opt.label}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${opt.state ? 'bg-green-400 border-green-300' : 'border-white/20'}`}>
                                            {opt.state && <CheckCircle2 size={12} className="text-green-900" />}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-white/40">{opt.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-6">
                        <NeonButton variant="yellow" size="lg" onClick={async () => { await soundManager.initContext(); startRound(); playSound('start'); }}
                            className="w-full py-6 text-3xl shadow-[0_10px_0_#92400e] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                            READY TO CHANT!
                        </NeonButton>
                        <div className="flex items-center justify-center gap-2 text-white/20">
                            <Info size={14} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">8 Beats left-to-right · {totalRounds} Rounds total</p>
                        </div>
                    </div>
                </NeonCard>
            </motion.div>
        );
    };

    // ── RENDER CREATOR ────────────────────────────────────────────────────────
    const renderCreator = () => (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center w-full max-w-4xl px-4 py-8">
            <NeonCard variant="purple" className="w-full p-6 overflow-hidden max-h-[90vh] shadow-[0_0_60px_rgba(168,85,247,0.2)] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4 shrink-0">
                    <div>
                        <h2 className="text-3xl font-black text-white italic flex items-center gap-3 tracking-tighter">
                            <div className="p-2 bg-yellow-400 rounded-xl text-black"><Edit3 size={20} /></div>
                            {editingPackId ? 'EDITOR STUDIO' : 'CREATOR STUDIO'}
                        </h2>
                        <p className="text-purple-300 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                            {editingPackId ? 'Modify existing challenge parameters' : 'Build your custom challenge pack'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {editingPackId && <NeonButton variant="blue" size="sm" onClick={handleSaveCopy} className="flex gap-2 text-[10px] py-2"><Save size={14} /> SAVE COPY</NeonButton>}
                        <button onClick={() => setGameState('menu')} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <X className="text-white" size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                            <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-1 block opacity-60">Challenge Name</label>
                            <input type="text" value={creatorData.name} onChange={e => setCreatorData({ ...creatorData, name: e.target.value })} placeholder="e.g., Household Objects"
                                className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-3 text-white font-black text-lg focus:border-yellow-400 outline-none transition-all placeholder:text-white/20" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-1 block opacity-60">BPM</label>
                            <input type="number" value={creatorData.startingBPM} onChange={e => setCreatorData({ ...creatorData, startingBPM: parseInt(e.target.value) || 0 })}
                                className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-3 text-white font-black text-lg focus:border-yellow-400 outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-1 block opacity-60">Diff</label>
                            <select value={creatorData.difficulty} onChange={e => setCreatorData({ ...creatorData, difficulty: e.target.value })}
                                className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-3 text-white font-black text-lg outline-none appearance-none cursor-pointer">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Med</option>
                                <option value="Hard">Hard</option>
                                <option value="Impossible">Imp</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex items-end">
                            <div className="w-full flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 h-[56px]">
                                <input type="checkbox" id="randomizeCards" checked={creatorData.randomizeCards} onChange={e => setCreatorData({ ...creatorData, randomizeCards: e.target.checked })}
                                    className="w-5 h-5 accent-yellow-400 cursor-pointer rounded shrink-0" />
                                <div className="flex flex-col leading-none">
                                    <label htmlFor="randomizeCards" className="text-white font-black uppercase tracking-wider cursor-pointer text-[10px]">Random Order</label>
                                    <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{creatorData.randomizeCards ? 'Shuffle ON' : 'Fixed Order'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest block opacity-60">Rounds</label>
                            <div className="text-[8px] text-white/30 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                {currentCreatorRound === 1 ? 'R1: Default' : creatorData.roundWords[currentCreatorRound].some((w: any) => w.text.trim() !== '') ? `R${currentCreatorRound}: Configured` : `R${currentCreatorRound}: Uses R1`}
                            </div>
                        </div>
                        <div className="flex space-x-1 mb-2 p-1 bg-black/40 rounded-xl border border-white/10">
                            {[1, 2, 3, 4, 5].map(rn => {
                                const hasWords = creatorData.roundWords?.[rn]?.some((w: any) => w.text.trim() !== '');
                                return (
                                    <button key={rn} onClick={() => setCurrentCreatorRound(rn)}
                                        className={`flex-1 py-2 px-1 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all ${currentCreatorRound === rn ? 'bg-purple-600 text-white shadow-lg' : 'bg-transparent text-white/30 hover:bg-white/5 hover:text-white/60'}`}>
                                        <span>R{rn}</span>
                                        {!hasWords && rn !== 1 && <span className="opacity-50 text-[8px] tracking-tight"> (R1)</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {creatorData.roundWords[currentCreatorRound].map((word: any, i: number) => (
                            <motion.div key={i} className="bg-black/60 p-2 rounded-2xl border-2 border-white/5 space-y-2 focus-within:border-yellow-400/50 transition-all">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-white/20">#{i + 1}</span>
                                    <input className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xl text-center w-8 h-8 focus:outline-none focus:border-yellow-400 p-0 transition-all"
                                        value={word.icon} placeholder="?"
                                        onChange={e => { const n = { ...creatorData.roundWords }; const l = [...n[currentCreatorRound]]; l[i] = { ...l[i], icon: e.target.value }; n[currentCreatorRound] = l; setCreatorData({ ...creatorData, roundWords: n }); }} />
                                </div>
                                <input type="text" placeholder="WORD" value={word.text}
                                    onChange={e => { const n = { ...creatorData.roundWords }; const l = [...n[currentCreatorRound]]; l[i] = { ...l[i], text: e.target.value }; n[currentCreatorRound] = l; setCreatorData({ ...creatorData, roundWords: n }); }}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg p-1.5 text-xs text-white font-black text-center focus:bg-white/10 focus:border-yellow-400 outline-none transition-all placeholder:text-white/10 uppercase" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex gap-3 shrink-0 pt-4 border-t border-white/10">
                    {editingPackId && overriddenDefaults[editingPackId] && (
                        <NeonButton variant="default" size="md" className="bg-red-500/20 border-red-500/50 text-red-300 text-xs py-3" onClick={() => handleResetDefault(editingPackId)}>
                            <RotateCcw size={14} className="mr-2 inline" /> RESET
                        </NeonButton>
                    )}
                    <NeonButton variant="yellow" size="md" onClick={handleSaveCustom}
                        disabled={!creatorData.name || (creatorData.roundWords[1] as any[]).some((w: any) => !w.text)}
                        className={`flex-1 py-3 text-lg shadow-[0_4px_0_#92400e] ${(!creatorData.name || (creatorData.roundWords[1] as any[]).some((w: any) => !w.text)) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                        <Save className="mr-2 inline" size={18} /> {editingPackId ? 'UPDATE' : 'DEPLOY'}
                    </NeonButton>
                </div>
                <p className="text-center text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-4">Make sure all 8 slots are filled before saving</p>
            </NeonCard>
        </motion.div>
    );

    // ── RENDER GAME ───────────────────────────────────────────────────────────
    const renderGame = () => (
        <div className="flex flex-col items-center w-full max-w-6xl px-4 gap-6 py-8 relative min-h-[80vh]">
            {/* Background Video */}
            <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40">
                <source src={`${import.meta.env.BASE_URL}chant_bg_art/joy_tv_static.mp4`} type="video/mp4" />
            </video>

            {/* Metronome flash */}
            <AnimatePresence>
                {activeSlot !== -1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.05, 0] }} transition={{ duration: 60 / currentBPM, repeat: Infinity }}
                        className="fixed inset-0 bg-white pointer-events-none z-0" />
                )}
            </AnimatePresence>

            {/* Corner images */}
            {roundImages.map((img, idx) => {
                const isBeating = activeSlot !== -1 || gameState === 'countdown';
                return (
                    <motion.div key={`${beatPulse}-${idx}`} className="fixed z-[1] pointer-events-none" style={{ left: img.x, top: img.y, width: '240px', height: '240px' }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.8, scale: isBeating ? [1, img.scalePulse, 1] : 1, rotate: isBeating ? [img.baseRotation, img.baseRotation + (idx % 2 === 0 ? img.twistAmount : -img.twistAmount), img.baseRotation] : img.baseRotation, y: isBeating ? [0, -img.jumpHeight, 0] : 0, x: isBeating ? [0, img.shakeX, 0] : 0 }}
                        transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.1, ease: 'easeOut' }, y: { duration: 0.15, ease: 'backOut' }, rotate: { duration: 0.1 }, x: { duration: 0.1 } }}>
                        <img src={img.url} alt="" className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]" />
                    </motion.div>
                );
            })}

            {/* Top Bar */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="w-full flex justify-between items-center mb-4 px-6 bg-white/5 p-5 rounded-[40px] border border-white/10 backdrop-blur-2xl z-20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-black shadow-[0_6px_0_#92400e]">
                        <Music size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em] bg-yellow-400/10 px-2 py-0.5 rounded italic">Round {currentRound}/{totalRounds}</span>
                            <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.3em]">{selectedPack.difficulty}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic skew-x-[-10deg]">{selectedPack.name}</h2>
                    </div>
                </div>
                {showBPMMeter && (
                    <div className="flex flex-col items-center bg-black/60 px-8 py-3 rounded-3xl border border-yellow-400/40">
                        <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1 opacity-50 z-10">Current Speed</span>
                        <div className="flex items-baseline gap-2 z-10">
                            <span className="text-4xl font-black text-yellow-400 italic tabular-nums drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{Math.round(currentBPM)}</span>
                            <span className="text-[10px] font-black text-yellow-400/60 uppercase italic">BPM</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <motion.div className="h-full bg-yellow-400" animate={{ width: `${((currentBPM - 60) / 190) * 100}%` }} />
                        </div>
                    </div>
                )}
                <div className="flex gap-3">
                    <button onClick={toggleMute} className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border-2 ${isMuted ? 'bg-red-500/10 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                        {isMuted ? <VolumeX size={24} className="text-red-400" /> : <Volume2 size={24} className="text-green-400" />}
                    </button>
                    <button onClick={() => handleExit('settings')} className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-red-500/20 border-2 border-white/10 rounded-2xl transition-all group">
                        <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full max-w-4xl mb-4 z-20 flex gap-2">
                <NeonProgressBar value={Math.round((currentRound / totalRounds) * 100)} color={currentRound > 3 ? 'purple' : 'green'} />
            </div>

            {/* Word Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl relative z-10 pb-20">
                {gameWords.map((word, index) => {
                    const isVisible = gameState !== 'countdown' || (8 - countdown) >= index;
                    return (
                        <div key={index} className="relative h-56 md:h-64">
                            <AnimatePresence>
                                {isVisible && (
                                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: activeSlot === index ? -20 : 0 }}
                                        exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', damping: 15 }} className="w-full h-full">
                                        <NeonCard variant={activeSlot === index ? 'yellow' : 'default'}
                                            className={`w-full h-full flex flex-col items-center justify-center transition-all duration-100 ${activeSlot === index ? 'ring-[12px] ring-green-400 shadow-[0_0_70px_rgba(74,222,128,0.6)] z-30' : 'ring-2 ring-white/10 grayscale-[0.3] opacity-80'}`}>
                                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none rounded-[20px]" style={{ backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 50%, white 50%, white 75%, transparent 75%, transparent)', backgroundSize: '40px 40px' }} />
                                            {word.icon && word.icon.trim() !== '' && (
                                                <motion.span
                                                    initial={{ rotate: 0, scale: 1 }}
                                                    animate={activeSlot === index ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, -15, 0], filter: ['drop-shadow(0 0 0px #4ade80)', 'drop-shadow(0 0 20px #4ade80)', 'drop-shadow(0 0 0px #4ade80)'] } : { rotate: 0, scale: 1 }}
                                                    transition={{ duration: 60 / currentBPM }} className="text-8xl md:text-9xl mb-6 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-10 block">
                                                    {word.icon}
                                                </motion.span>
                                            )}
                                            <div className={`transition-all z-10 w-full flex justify-center ${activeSlot === index ? 'bg-black text-green-400 font-black px-6 py-2 rounded-xl' : 'text-white/40 font-bold px-2'}`}>
                                                <span className={`uppercase tracking-tighter text-center ${(!word.icon || word.icon.trim() === '') ? (word.text.length < 5 ? 'text-8xl md:text-9xl' : word.text.length < 10 ? 'text-6xl md:text-8xl' : 'text-4xl md:text-6xl') : 'text-xl md:text-2xl line-clamp-1'}`}>
                                                    {word.text}
                                                </span>
                                            </div>
                                            {activeSlot === index && (
                                                <motion.div layoutId="pulse-glow" className="absolute inset-0 rounded-[24px] border-[8px] border-green-400/50 box-content z-[-1]"
                                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
                                            )}
                                        </NeonCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Countdown Overlay */}
            <AnimatePresence>
                {gameState === 'countdown' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-transparent pointer-events-none">
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.2, 1], opacity: 1 }} className="relative flex flex-col items-center">
                            <div className="absolute -top-32 flex gap-12 text-yellow-500/20">
                                <Music size={120} /><Music size={120} />
                            </div>
                            <motion.h3 key={countdown} initial={{ scale: 3, rotate: 30, opacity: 0 }} animate={{ scale: 1, rotate: countdown === 1 ? -15 : 0, opacity: 1 }}
                                className={`text-[18rem] font-black italic drop-shadow-[0_0_100px_rgba(0,0,0,0.8)] leading-none ${countdown === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {countdown === 1 ? 'GO!' : countdown}
                            </motion.h3>
                            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                                className="mt-12 bg-white/5 px-12 py-6 rounded-full border-2 border-white/10 backdrop-blur-md">
                                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-5xl font-black uppercase tracking-[0.5em] italic">
                                    {countdown === 1 ? 'RHYTHM ON!' : 'Oh-Kay-Yea-Hey!'}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Round End Modal */}
            <AnimatePresence>
                {gameState === 'round-end' && roundPause && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl px-4">
                        <NeonCard variant="blue" className="p-12 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.3)]">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={140} /></div>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center text-black mx-auto mb-6 shadow-[0_0_30px_#4ade80]">
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <span className="text-yellow-400 text-xs font-black uppercase tracking-[0.4em] mb-2 block">Level Intensity Increased</span>
                            <h3 className="text-5xl font-black text-white mb-8 italic tracking-tighter skew-x-[-10deg]">ROUND {currentRound} CLEAR</h3>
                            <div className="bg-black/40 p-6 rounded-3xl mb-10 border border-white/10 flex flex-col items-center">
                                <span className="text-blue-300 font-bold uppercase text-[10px] tracking-widest mb-2 opacity-60">Coming Next Round</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white italic tabular-nums">{lockBPM ? Math.round(currentBPM) : Math.round(currentBPM + selectedPack.accelerationRate)}</span>
                                    <span className="text-sm font-black text-yellow-400 uppercase italic">{lockBPM ? 'BPM — LOCKED' : 'BPM'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <NeonButton variant="yellow" size="lg" onClick={handleNextRound} className="w-full py-6 text-3xl shadow-[0_10px_0_#92400e]">
                                    {currentRound === totalRounds ? 'FINISH LINE' : 'PUSH TEMPO'} <ChevronRight className="inline ml-1" />
                                </NeonButton>
                                <button onClick={() => startRound()} className="text-white/20 hover:text-white transition-all py-4 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group">
                                    <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Re-practice this speed
                                </button>
                            </div>
                        </NeonCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Level End Modal */}
            <AnimatePresence>
                {gameState === 'level-end' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070814]/95 backdrop-blur-[60px] px-4">
                        <motion.div initial={{ scale: 0.7, y: 100, rotate: -10 }} animate={{ scale: 1, y: 0, rotate: 0 }} className="relative">
                            <div className="absolute inset-0 bg-yellow-400/20 blur-[150px] rounded-full" />
                            <NeonCard variant="purple" className="p-14 max-w-xl w-full text-center relative overflow-hidden border-2 border-white/20 shadow-[0_0_150px_rgba(168,85,247,0.4)]">
                                <motion.span animate={{ rotate: [0, 15, -15, 15, 0], scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                                    className="text-9xl mb-10 block drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-10">👑</motion.span>
                                <h3 className="text-7xl font-black text-white mb-2 italic tracking-tighter skew-x-[-12deg] leading-none">RHYTHM LORD!</h3>
                                <p className="text-purple-300 font-black uppercase tracking-[0.4em] text-xs mb-12 opacity-60">Maximum synchronization achieved</p>
                                <div className="grid grid-cols-2 gap-6 mb-12">
                                    <div className="bg-white/5 p-6 rounded-[32px] border-2 border-white/5 backdrop-blur-sm">
                                        <span className="text-[10px] text-white/30 font-black uppercase block mb-2 tracking-widest leading-none">PEAK FREQUENCY</span>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-5xl font-black text-yellow-400 italic tabular-nums">{Math.round(currentBPM)}</span>
                                            <span className="text-xs font-black text-yellow-400/40 uppercase">BPM</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-[32px] border-2 border-white/5 backdrop-blur-sm">
                                        <span className="text-[10px] text-white/30 font-black uppercase block mb-2 tracking-widest leading-none">SYNC RANK</span>
                                        <div className="flex items-center justify-center gap-2">
                                            <Award className="text-blue-400" size={24} />
                                            <span className="text-5xl font-black text-blue-400 italic">S++</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <NeonButton variant="yellow" size="lg" onClick={handleRestart} className="py-6 shadow-[0_8px_0_#92400e]">TRY AGAIN</NeonButton>
                                    <NeonButton variant="default" size="lg" onClick={() => handleExit('menu')} className="py-6 border-white/20 bg-white/5 shadow-[0_8px_0_rgba(0,0,0,0.3)]">HUB HOME</NeonButton>
                                </div>
                                <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/10">
                                    <button className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 border border-transparent group-hover:border-blue-500/50 transition-all"><QrCode size={20} /></div>
                                        <span className="text-[8px] font-black uppercase tracking-widest">Share QR</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-pink-500/20 group-hover:text-pink-400 border border-transparent group-hover:border-pink-500/50 transition-all"><Share2 size={20} /></div>
                                        <span className="text-[8px] font-black uppercase tracking-widest">Post Result</span>
                                    </button>
                                </div>
                            </NeonCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#05060f] flex flex-col items-center justify-center relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Animated background orbs */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div animate={{ translate: '0 50px 0', scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
                    className="absolute top-[-20%] right-[-10%] w-[100%] h-[100%] rounded-full bg-blue-600/10 blur-[250px]" />
                <motion.div animate={{ translate: '0 -50px 0', scale: [1.1, 1, 1.1] }} transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
                    className="absolute bottom-[-30%] left-[-20%] w-[100%] h-[120%] rounded-full bg-purple-700/10 blur-[250px]" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 0.8px, transparent 0)', backgroundSize: '48px 48px' }} />
            </div>

            <main className="w-full h-full flex flex-col items-center justify-center z-10">
                {gameState === 'menu' && renderMenu()}
                {gameState === 'settings' && renderSettings()}
                {gameState === 'creator' && renderCreator()}
                {(gameState === 'playing' || gameState === 'countdown' || gameState === 'round-end' || gameState === 'level-end') && renderGame()}
            </main>

            <AnimatePresence>
                {fadingOut && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 z-[200] bg-black flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-white font-black italic tracking-[1em] text-2xl uppercase"
                        >
                            BEAT CHANT
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BeatChantGame;
