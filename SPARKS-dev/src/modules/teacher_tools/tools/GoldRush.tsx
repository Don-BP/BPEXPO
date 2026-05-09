import React, { useState, useEffect } from 'react';
import { TTBtn, THEMES } from '../games/TTGameComponents';
import SparkleBackground from '../../../components/common/SparkleBackground';
import './Scoreboard.css';

// ─── Sound ────────────────────────────────────────────────────────────────────

type SoundType = 'tap' | 'thud' | 'grind' | 'forge' | 'ding' | 'shimmer' | 'vent';

const playSound = (type: SoundType) => {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;

  switch (type) {
    case 'tap':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
      break;
    case 'thud':
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
      break;
    case 'grind':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
      break;
    case 'forge':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
      break;
    case 'ding': {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now);
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      gain2.gain.setValueAtTime(0.3, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.start(now); osc2.stop(now + 1);
      osc.start(now); osc.stop(now + 1);
      break;
    }
    case 'shimmer':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 1.5);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
      osc.start(now); osc.stop(now + 1.5);
      break;
    case 'vent': {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 1000;
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);
      noise.start(now);
      osc.start(now); osc.stop(now + 0.8);
      break;
    }
  }
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const RockIcon: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const absVal = Math.abs(value);
  let scale = absVal === 0 ? 0.4 : Math.min(3.5, 0.6 + Math.pow((Math.max(1, absVal) - 1) / 4, 2) * 2.6);
  const style: React.CSSProperties = { transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' };

  if (value <= 0) return (
    <svg viewBox="0 0 100 100" className={`w-12 h-12 drop-shadow-xl ${className}`} style={style}>
      <path d="M50 10 L80 30 L90 70 L60 95 L20 85 L10 40 Z" fill="#2d3436" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
      <path d="M40 20 L60 40 L50 80 L30 50 Z" fill="#636e72" />
      <circle cx="70" cy="50" r="6" fill="#a29bfe" className="animate-pulse" stroke="#000" strokeWidth="2" />
      <circle cx="30" cy="70" r="4" fill="#a29bfe" className="animate-pulse delay-75" stroke="#000" strokeWidth="2" />
    </svg>
  );
  if (value === 1) return (
    <svg viewBox="0 0 100 100" className={`w-10 h-10 drop-shadow-md ${className}`} style={style}>
      <path d="M50 20 C70 10, 90 40, 80 70 C70 90, 30 90, 20 60 C10 40, 30 30, 50 20" fill="#FFD700" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
      <path d="M45 25 C60 20, 75 40, 65 60" fill="#FFF3A1" opacity="0.8" />
    </svg>
  );
  if (value <= 4) return (
    <svg viewBox="0 0 100 100" className={`w-14 h-14 drop-shadow-lg ${className}`} style={style}>
      <path d="M20 50 L40 20 L70 30 L80 60 L60 90 L30 80 Z" fill="#95a5a6" stroke="#2d3436" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="40,20 60,10 55,35" fill="#FFD700" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="70,30 95,45 75,55" fill="#FFC312" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="60,90 85,95 70,75" fill="#FFD700" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="30,80 15,90 25,65" fill="#FFC312" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 100 100" className={`w-20 h-20 drop-shadow-2xl ${className}`} style={style}>
      <polygon points="50,10 90,40 50,95 10,40" fill="#FFD700" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="50,10 90,40 50,45" fill="#FFF3A1" />
      <polygon points="50,10 10,40 50,45" fill="#FFC312" />
      <polygon points="10,40 50,95 50,45" fill="#F39C12" />
      <polygon points="90,40 50,95 50,45" fill="#E67E22" />
    </svg>
  );
};

const MedalIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 100 100" className={`drop-shadow-lg ${className}`}>
    <path d="M50 5 L62 35 L95 35 L68 55 L78 85 L50 68 L22 85 L32 55 L5 35 L38 35 Z" fill="#FFD700" stroke="#E58E26" strokeWidth="4" strokeLinejoin="round" />
    <path d="M50 15 L59 38 L82 38 L62 52 L70 74 L50 60 L30 74 L38 52 L18 38 L41 38 Z" fill="#FFF3A1" opacity="0.6" />
  </svg>
);

const MysteryChest: React.FC<{ phase: string }> = ({ phase }) => (
  <div className={`relative ${phase === 'idle' ? 'animate-bounce-slow' : phase === 'shaking' ? 'animate-violent-shake' : 'scale-0 transition-transform duration-300'}`}>
    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-6xl font-black text-white gr-text-outline-purple drop-shadow-xl ${phase === 'shaking' ? 'animate-spin' : 'animate-pulse'}`}>?</div>
    <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-2xl">
      <rect x="10" y="40" width="80" height="50" rx="8" fill="#9C88FF" stroke="#3c2f80" strokeWidth="4" strokeLinejoin="round" />
      <path d="M10 40 C 10 5, 90 5, 90 40 Z" fill="#00d2d3" stroke="#3c2f80" strokeWidth="4" strokeLinejoin="round" />
      <rect x="40" y="30" width="20" height="25" rx="4" fill="#c8d6e5" stroke="#3c2f80" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="50" cy="45" r="4" fill="#3c2f80" />
    </svg>
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: number;
  name: string;
  medals: number;
  moldPoints: number;
  animPhase: string;
  rockVal: number;
  colorIdx: number;
}

const colorThemes = [
  { bg: 'bg-[#4CB5F5]', border: 'border-[#1E73BE]', shadow: 'shadow-[0_8px_0_#1E73BE] md:shadow-[0_12px_0_#1E73BE]', hoverShadow: 'hover:shadow-[0_6px_0_#1E73BE]' },
  { bg: 'bg-[#ff6b81]', border: 'border-[#ff4757]', shadow: 'shadow-[0_8px_0_#ff4757] md:shadow-[0_12px_0_#ff4757]', hoverShadow: 'hover:shadow-[0_6px_0_#ff4757]' },
  { bg: 'bg-[#2ED573]', border: 'border-[#1e8449]', shadow: 'shadow-[0_8px_0_#1e8449] md:shadow-[0_12px_0_#1e8449]', hoverShadow: 'hover:shadow-[0_6px_0_#1e8449]' },
  { bg: 'bg-[#ffa502]', border: 'border-[#e67e22]', shadow: 'shadow-[0_8px_0_#e67e22] md:shadow-[0_12px_0_#e67e22]', hoverShadow: 'hover:shadow-[0_6px_0_#e67e22]' },
  { bg: 'bg-[#9C88FF]', border: 'border-[#5f27cd]', shadow: 'shadow-[0_8px_0_#5f27cd] md:shadow-[0_12px_0_#5f27cd]', hoverShadow: 'hover:shadow-[0_6px_0_#5f27cd]' },
  { bg: 'bg-[#1dd1a1]', border: 'border-[#01a3a4]', shadow: 'shadow-[0_8px_0_#01a3a4] md:shadow-[0_12px_0_#01a3a4]', hoverShadow: 'hover:shadow-[0_6px_0_#01a3a4]' },
  { bg: 'bg-[#ff7f50]', border: 'border-[#d35400]', shadow: 'shadow-[0_8px_0_#d35400] md:shadow-[0_12px_0_#d35400]', hoverShadow: 'hover:shadow-[0_6px_0_#d35400]' },
  { bg: 'bg-[#ff9ff3]', border: 'border-[#f368e0]', shadow: 'shadow-[0_8px_0_#f368e0] md:shadow-[0_12px_0_#f368e0]', hoverShadow: 'hover:shadow-[0_6px_0_#f368e0]' },
  { bg: 'bg-[#badc58]', border: 'border-[#6ab04c]', shadow: 'shadow-[0_8px_0_#6ab04c] md:shadow-[0_12px_0_#6ab04c]', hoverShadow: 'hover:shadow-[0_6px_0_#6ab04c]' },
  { bg: 'bg-[#7ed6df]', border: 'border-[#22a6b3]', shadow: 'shadow-[0_8px_0_#22a6b3] md:shadow-[0_12px_0_#22a6b3]', hoverShadow: 'hover:shadow-[0_6px_0_#22a6b3]' },
];

// ─── TeamCard ─────────────────────────────────────────────────────────────────

const TeamCard: React.FC<{ team: Team; onClick: () => void; onRemove: (e: React.MouseEvent) => void; onRename: (name: string) => void }> = ({ team, onClick, onRemove, onRename }) => {
  const theme = colorThemes[team.colorIdx % colorThemes.length];
  return (
    <div
      onClick={onClick}
      className={`relative ${theme.bg} border-4 ${theme.border} rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-4 flex flex-col items-center cursor-pointer transition-transform hover:scale-[1.03] ${theme.shadow} ${theme.hoverShadow} hover:translate-y-1 group anim-${team.animPhase} h-full min-h-0`}
    >
      <button
        onClick={onRemove}
        className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-white border-4 border-[#ff4757] text-[#ff4757] rounded-full opacity-0 group-hover:opacity-100 hover:bg-[#ff4757] hover:text-white transition-all flex items-center justify-center font-black text-lg shadow-md z-50"
      >
        ✕
      </button>

      <input
        className="gr-team-name-input mb-1 md:mb-2 w-full text-center text-white shrink-0 bg-transparent border-none outline-none"
        defaultValue={team.name}
        onClick={e => e.stopPropagation()}
        onBlur={e => { const v = e.target.value.trim(); if (v) onRename(v); else e.target.value = team.name; }}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      />

      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3 bg-[#FFECA1] border-4 border-[#F2A900] py-1 px-3 md:py-2 md:px-5 rounded-full shadow-md shrink-0">
        <MedalIcon className="w-5 h-5 md:w-7 md:h-7 -ml-2 md:-ml-3" />
        <span className={`text-xl md:text-3xl font-black text-[#D9534F] tracking-tighter leading-none ${team.animPhase === 'settling' ? 'gr-medal-count-pulse gr-text-outline-red' : ''}`}>
          {team.medals}
        </span>
      </div>

      <div className="relative w-full flex-1 flex flex-col items-center justify-end machine-body mt-auto min-h-0 pb-1 md:pb-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 opacity-0 rock-drop pointer-events-none">
          {team.animPhase === 'dropping' && <RockIcon value={team.rockVal} className="w-10 h-10 md:w-16 md:h-16" />}
        </div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-30 opacity-0 medal-eject pointer-events-none">
          {team.animPhase === 'forging' && <MedalIcon className="w-14 h-14 md:w-20 md:h-20" />}
        </div>

        <div className="relative z-10 h-[45%] min-h-0 w-[60%] max-w-[14rem] flex justify-center items-end">
          <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMax meet" className="w-full h-full drop-shadow-md">
            <path d="M10 5 L90 5 L70 45 L30 45 Z" fill="#b2bec3" stroke="#2d3436" strokeWidth="4" strokeLinejoin="round" />
            <rect x="30" y="45" width="40" height="15" fill="#636e72" stroke="#2d3436" strokeWidth="4" rx="2" />
            <g className="grinder-gear" style={{ transformOrigin: '40px 25px' }}>
              <circle cx="40" cy="25" r="14" fill="#ff7675" stroke="#2d3436" strokeWidth="4" />
              <line x1="20" y1="25" x2="60" y2="25" stroke="#2d3436" strokeWidth="4" />
              <line x1="40" y1="5" x2="40" y2="45" stroke="#2d3436" strokeWidth="4" />
            </g>
            <g className="grinder-gear" style={{ transformOrigin: '60px 30px', animationDirection: 'reverse' } as React.CSSProperties}>
              <circle cx="60" cy="30" r="12" fill="#74b9ff" stroke="#2d3436" strokeWidth="4" />
              <line x1="45" y1="15" x2="75" y2="45" stroke="#2d3436" strokeWidth="4" />
              <line x1="45" y1="45" x2="75" y2="15" stroke="#2d3436" strokeWidth="4" />
            </g>
          </svg>
        </div>

        <div className="particle-layer">
          {(['d1', 'd2', 'd3', 'd4'] as const).map(cls => (
            <div key={cls} className={`dust ${cls} ${team.rockVal < 0 || team.animPhase === 'venting' ? 'dust-slag' : 'dust-gold'}`} />
          ))}
        </div>

        <div className="relative pot-slam h-[55%] min-h-0 w-[80%] max-w-[18rem] flex justify-center items-start mt-1">
          <svg viewBox="0 0 100 85" preserveAspectRatio="xMidYMin meet" className="w-full h-full drop-shadow-lg z-0">
            <defs>
              <clipPath id={`bowl-clip-${team.id}`}>
                <path d="M 25 30 C 10 85, 90 85, 75 30 Z" />
              </clipPath>
            </defs>
            <ellipse cx="50" cy="30" rx="25" ry="8" fill="#a4b0be" stroke="#2f3542" strokeWidth="4" />
            <g clipPath={`url(#bowl-clip-${team.id})`}>
              <rect x="0" y="0" width="100" height="100" fill="#2d3436" opacity="0.8" />
              <g
                className={`transition-transform duration-300 ease-out ${team.animPhase === 'venting' ? 'mold-fluid' : ''}`}
                style={{ transform: `translateY(${(1 - team.moldPoints / 5) * 52}px)` }}
              >
                <rect x="0" y="30" width="100" height="70" fill="#F39C12" />
                <ellipse cx="50" cy="30" rx="35" ry="8" fill="#FFD700" />
                <circle cx="35" cy="45" r="4" fill="#FFF3A1" opacity="0.7" />
                <circle cx="65" cy="55" r="3" fill="#FFF3A1" opacity="0.7" />
                <circle cx="50" cy="65" r="5" fill="#FFF3A1" opacity="0.7" />
              </g>
            </g>
            <path d="M 25 30 C 10 85, 90 85, 75 30" fill="none" stroke="#2f3542" strokeWidth="4" strokeLinecap="round" />
            <path d="M 25 30 C 25 38, 75 38, 75 30" fill="none" stroke="#2f3542" strokeWidth="4" />
            <path d="M 32 45 C 32 60, 40 70, 48 72" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

interface GoldRushProps {
  onBackToScoreboard: () => void;
  onBackToHub: () => void;
  returnFrom?: string;
  onReturnFrom?: () => void;
  winScore: number;
  bonusAmount: number;
  activeTheme: string;
  onWinScoreChange: (v: number) => void;
  onBonusAmountChange: (v: number) => void;
  onThemeChange: (theme: string) => void;
  onReset: () => void;
  onGoToPlinko: () => void;
}

const GoldRush: React.FC<GoldRushProps> = ({
  onBackToScoreboard, onBackToHub, returnFrom, onReturnFrom,
  winScore, bonusAmount, activeTheme,
  onWinScoreChange, onBonusAmountChange, onThemeChange,
  onReset, onGoToPlinko,
}) => {
  useEffect(() => {
    const id = 'gr-pixel-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Red Dragons',   medals: 0, moldPoints: 0, animPhase: 'idle', rockVal: 0, colorIdx: 1 },
    { id: 2, name: 'Blue Falcons',  medals: 0, moldPoints: 0, animPhase: 'idle', rockVal: 0, colorIdx: 0 },
    { id: 3, name: 'Green Turtles', medals: 0, moldPoints: 0, animPhase: 'idle', rockVal: 0, colorIdx: 2 },
    { id: 4, name: 'Gold Stars',    medals: 0, moldPoints: 0, animPhase: 'idle', rockVal: 0, colorIdx: 3 },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [mysteryState, setMysteryState] = useState<{ active: boolean; phase: string; value: number }>({ active: false, phase: 'idle', value: 0 });
  const [offeredPoints, setOfferedPoints] = useState(1);

  const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const updateTeamState = (id: number, updates: Partial<Team>) =>
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  const addTeam = () => {
    if (teams.length >= 10) return;
    const newId = Math.max(0, ...teams.map(t => t.id)) + 1;
    const used = teams.map(t => t.colorIdx);
    const nextColor = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find(i => !used.includes(i)) ?? 0;
    setTeams(prev => [...prev, { id: newId, name: `Team ${newId}`, medals: 0, moldPoints: 0, animPhase: 'idle', rockVal: 0, colorIdx: nextColor }]);
    playSound('tap');
  };

  const removeLastTeam = () => {
    if (teams.length <= 1) return;
    setTeams(prev => prev.slice(0, -1));
    playSound('tap');
  };

  const handleRename = (id: number, name: string) =>
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t));

  const removeTeam = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTeams(prev => prev.filter(t => t.id !== id));
    playSound('tap');
  };

  const processPoints = async (targetTeamId: number, points: number) => {
    setIsProcessing(true);
    setSelectedTeamId(null);

    updateTeamState(targetTeamId, { animPhase: 'dropping', rockVal: points });
    playSound('thud');
    await wait(600);

    const team = teams.find(t => t.id === targetTeamId);
    let currentMold = team?.moldPoints ?? 0;
    let currentMedals = team?.medals ?? 0;

    if (points > 0) {
      updateTeamState(targetTeamId, { animPhase: 'grinding' });
      for (let i = 0; i < points; i++) {
        playSound('grind');
        currentMold++;
        updateTeamState(targetTeamId, { moldPoints: currentMold });
        playSound('tap');
        await wait(250);

        if (currentMold >= 5) {
          updateTeamState(targetTeamId, { animPhase: 'forging', moldPoints: 5 });
          playSound('forge');
          await wait(600);
          playSound('ding');
          currentMedals++;
          currentMold = 0;
          updateTeamState(targetTeamId, { animPhase: 'idle', moldPoints: 0, medals: currentMedals });
          await wait(800);
          if (i < points - 1) updateTeamState(targetTeamId, { animPhase: 'grinding' });
        }
      }
    } else {
      updateTeamState(targetTeamId, { animPhase: 'venting' });
      const drainCount = Math.abs(points) || 1;
      for (let i = 0; i < drainCount; i++) {
        playSound('grind');
        if (i === 0 && points < 0) playSound('vent');
        if (currentMold > 0 && points < 0) {
          currentMold--;
          updateTeamState(targetTeamId, { moldPoints: currentMold });
        }
        await wait(250);
      }
    }

    updateTeamState(targetTeamId, { animPhase: 'settling', moldPoints: currentMold, medals: currentMedals });
    await wait(300);
    updateTeamState(targetTeamId, { animPhase: 'idle', rockVal: 0 });
    setIsProcessing(false);
  };

  const triggerMysterySequence = async (targetTeamId: number) => {
    setIsProcessing(true);
    setSelectedTeamId(null);
    const isPositive = Math.random() > 0.3;
    const val = isPositive ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 6) - 5;

    setMysteryState({ active: true, phase: 'idle', value: 0 });
    playSound('tap');
    await wait(200);
    setMysteryState(prev => ({ ...prev, phase: 'shaking' }));
    playSound('shimmer');
    await wait(600);
    setMysteryState(prev => ({ ...prev, phase: 'revealed', value: val }));
    playSound('ding');
    await wait(1000);
    setMysteryState({ active: false, phase: 'idle', value: 0 });
    await processPoints(targetTeamId, val);
  };

  const gridCols = teams.length <= 4 ? teams.length : teams.length <= 6 ? 3 : 4;
  const gridRows = teams.length <= 4 ? 1 : teams.length <= 8 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-50 gr-font-cartoon overflow-hidden flex flex-col" style={{ backgroundColor: '#1e3875' }}>
      <SparkleBackground />

      {/* Header — matches Scoreboard controls bar layout */}
      <header className="scoreboard-fullscreen-controls relative z-10">
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
          <TTBtn onClick={onBackToHub} variant="default" size="sm">← Hub</TTBtn>
          <TTBtn onClick={onBackToScoreboard} variant="blue" size="sm">← Scoreboard</TTBtn>
        </div>
        <div className="sb-control-group">
          <label>Teams:</label>
          <TTBtn onClick={removeLastTeam} disabled={teams.length <= 1} variant="red" size="sm" style={{ width: 32, height: 32, padding: 0, minHeight: 32, borderRadius: '50%' }}>−</TTBtn>
          <span className="sb-count">{teams.length}</span>
          <TTBtn onClick={addTeam} disabled={teams.length >= 10 || isProcessing} variant="green" size="sm" style={{ width: 32, height: 32, padding: 0, minHeight: 32, borderRadius: '50%' }}>+</TTBtn>
        </div>
        <div className="sb-control-group">
          <label>Theme:</label>
          <select value={activeTheme} onChange={e => onThemeChange(e.target.value)}>
            {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="sb-control-group">
          <label>Win at:</label>
          <input type="number" className="sb-num-input" value={winScore} min={0} max={999}
            onChange={e => onWinScoreChange(parseInt(e.target.value) || 0)} />
        </div>
        <div className="sb-control-group">
          <label>+Pts:</label>
          <input type="number" className="sb-num-input" value={bonusAmount} min={1} max={99}
            onChange={e => onBonusAmountChange(parseInt(e.target.value) || 1)} />
        </div>
        <TTBtn onClick={onGoToPlinko} variant="teal" size="sm">🎳 Plinko</TTBtn>
        <TTBtn onClick={onReset} variant="pink" size="sm">↺ Reset</TTBtn>
        {returnFrom && onReturnFrom && (
          <TTBtn onClick={onReturnFrom} variant="default" size="sm">↩️ {returnFrom}</TTBtn>
        )}
        <button onClick={onBackToHub} title="Exit Fullscreen"
          style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', padding: 0, flexShrink: 0, fontSize: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3d6cb5', background: 'linear-gradient(to bottom, #ffffff, #fffde7)', border: '3px solid #FDD835', boxShadow: '0 4px 0 #F9A825, 0 4px 8px rgba(0,0,0,0.12)', transition: 'transform 0.1s, box-shadow 0.1s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(calc(-50% - 2px))'; e.currentTarget.style.boxShadow = '0 6px 0 #F9A825, 0 6px 12px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%)'; e.currentTarget.style.boxShadow = '0 4px 0 #F9A825, 0 4px 8px rgba(0,0,0,0.12)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(calc(-50% + 3px))'; e.currentTarget.style.boxShadow = '0 1px 0 #F9A825, 0 2px 4px rgba(0,0,0,0.1)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(calc(-50% - 2px))'; e.currentTarget.style.boxShadow = '0 6px 0 #F9A825, 0 6px 12px rgba(0,0,0,0.15)'; }}
        >✕</button>
      </header>

      {/* Board */}
      <main
        className="flex-1 w-full max-w-[1800px] mx-auto p-2 md:p-4 grid gap-2 md:gap-4 relative z-10 min-h-0"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }}
      >
        {teams.map((team, index) => (
          <div key={team.id} className="h-full min-h-0" style={index === 8 && teams.length >= 9 ? { gridColumn: '2' } : undefined}>
            <TeamCard
              team={team}
              onClick={() => {
                if (!isProcessing) {
                  playSound('tap');
                  setOfferedPoints(Math.floor(Math.random() * 3) + 1);
                  setSelectedTeamId(team.id);
                }
              }}
              onRemove={e => removeTeam(team.id, e)}
              onRename={name => handleRename(team.id, name)}
            />
          </div>
        ))}
      </main>

      {/* Point Selection Modal */}
      {selectedTeamId !== null && !isProcessing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={() => setSelectedTeamId(null)}>
          <div
            className="bg-[#4CB5F5] border-4 border-[#1E73BE] p-4 md:p-8 rounded-[2.5rem] shadow-[0_15px_0_#1E73BE,0_20px_40px_rgba(0,0,0,0.4)] w-full max-w-2xl max-h-[90vh] flex flex-col gr-animate-pop-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex gap-4 md:gap-8 flex-1 min-h-[14rem] md:min-h-[18rem]">
              <button
                onClick={() => { playSound('tap'); processPoints(selectedTeamId, offeredPoints); }}
                className="flex-1 bg-[#FFECA1] hover:bg-[#FFDF70] border-4 border-[#F2A900] flex flex-col items-center justify-center rounded-3xl shadow-[0_8px_0_#F2A900] active:shadow-none active:translate-y-2 transition-all p-4"
              >
                <span className="text-6xl md:text-8xl font-black text-[#D9534F] gr-text-outline-red">+{offeredPoints}</span>
                <RockIcon value={offeredPoints} className="w-16 h-16 md:w-24 md:h-24 mt-4 drop-shadow-xl" />
              </button>
              <button
                onClick={() => triggerMysterySequence(selectedTeamId)}
                className="flex-1 bg-[#9C88FF] hover:bg-[#8c7ae6] border-4 border-[#5f27cd] flex flex-col items-center justify-center rounded-3xl shadow-[0_8px_0_#5f27cd] active:shadow-none active:translate-y-2 transition-all group overflow-hidden relative p-4"
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full transform -translate-x-full group-hover:gr-animate-sweep" />
                <span className="text-6xl md:text-8xl font-black text-white gr-text-outline-purple drop-shadow-md relative z-10 group-hover:animate-pulse">?</span>
                <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-28 md:h-28 drop-shadow-2xl mt-2 relative z-10 group-hover:animate-bounce">
                  <rect x="10" y="40" width="80" height="50" rx="8" fill="#00d2d3" stroke="#3c2f80" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M10 40 C 10 5, 90 5, 90 40 Z" fill="#ff9ff3" stroke="#3c2f80" strokeWidth="4" strokeLinejoin="round" />
                  <rect x="40" y="30" width="20" height="25" rx="4" fill="#c8d6e5" stroke="#3c2f80" strokeWidth="4" strokeLinejoin="round" />
                  <circle cx="50" cy="45" r="4" fill="#3c2f80" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mystery Sequence Overlay */}
      {mysteryState.active && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          <MysteryChest phase={mysteryState.phase} />
          {mysteryState.phase === 'revealed' && (
            <div className="absolute flex flex-col items-center gr-animate-burst-up">
              <RockIcon value={mysteryState.value} className="w-32 h-32 md:w-40 md:h-40 mb-4" />
              <div className={`text-6xl md:text-8xl font-black gr-text-outline-thick drop-shadow-2xl ${mysteryState.value > 0 ? 'text-[#FFD700]' : 'text-[#ff4757]'}`}>
                {mysteryState.value > 0 ? `+${mysteryState.value}` : mysteryState.value}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scoped CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;800&display=swap');

        .gr-font-cartoon { font-family: 'Fredoka', sans-serif; }

        .gr-team-name-input {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(0.5rem, 1.3vw, 0.9rem);
          line-height: 1.6;
          cursor: text;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
        }
        .gr-team-name-input::selection { background: rgba(255,255,255,0.4); }

        .gr-bg-sunburst {
          background: repeating-conic-gradient(
            from 0deg, #D0F0FF 0deg 15deg, #E1F5FF 15deg 30deg
          );
        }

        .gr-text-outline-red    { text-shadow: 0 3px 0 #F2A900, 3px 0 0 #F2A900, -3px 0 0 #F2A900, 0 -3px 0 #F2A900, 2px 2px 0 #F2A900, -2px -2px 0 #F2A900; }
        .gr-text-outline-purple { text-shadow: 0 3px 0 #5f27cd, 3px 0 0 #5f27cd, -3px 0 0 #5f27cd, 0 -3px 0 #5f27cd, 2px 2px 0 #5f27cd, -2px -2px 0 #5f27cd; }
        .gr-text-outline-thick  { text-shadow: 0 4px 0 #2d3436, 4px 0 0 #2d3436, -4px 0 0 #2d3436, 0 -4px 0 #2d3436, 3px 3px 0 #2d3436, -3px -3px 0 #2d3436, 0 8px 0 #2d3436; }

        @keyframes gr-pop-in       { 0%   { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes gr-burst-up     { 0%   { transform: translateY(100px) scale(0); opacity: 0; } 50% { transform: translateY(-20px) scale(1.2); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes gr-bounce-slow  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes gr-violent-shake { 0%, 100% { transform: translateX(0) scale(1.5); } 10%,30%,50%,70%,90% { transform: translateX(-10px) rotate(-3deg) scale(1.5); } 20%,40%,60%,80% { transform: translateX(10px) rotate(3deg) scale(1.5); } }
        @keyframes gr-medal-pulse  { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        @keyframes gr-drop-arc     { 0% { transform: translateY(-100px) scale(1); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(20px) scale(0.5); opacity: 0; } }
        @keyframes gr-spin-fast    { 100% { transform: rotate(360deg); } }
        @keyframes gr-machine-shake { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px) translateY(2px); } }
        @keyframes gr-dust-fall    { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(150px) scale(0.2); opacity: 0; } }
        @keyframes gr-slam         { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1) translateY(8px); } }
        @keyframes gr-medal-shoot  { 0% { transform: translateY(30px) scale(0.5) rotate(0); opacity: 0; } 20% { opacity: 1; } 50% { transform: translateY(-80px) scale(1.2) rotate(720deg); } 100% { transform: translateY(0) scale(1) rotate(1440deg); opacity: 1; } }
        @keyframes gr-fluid-vent   { 0%, 100% { filter: saturate(1); } 20%, 80% { filter: saturate(0) brightness(0.4); } }

        .gr-animate-pop-in    { animation: gr-pop-in 0.2s ease-out forwards; }
        .gr-animate-burst-up  { animation: gr-burst-up 0.5s ease-out forwards; }
        .animate-bounce-slow  { animation: gr-bounce-slow 2s ease-in-out infinite; }
        .animate-violent-shake { animation: gr-violent-shake 0.3s linear infinite; }
        .gr-medal-count-pulse { animation: gr-medal-pulse 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }

        .anim-dropping .rock-drop  { animation: gr-drop-arc 0.6s cubic-bezier(0.5,0,1,1) forwards; opacity: 1; }
        .anim-grinding .grinder-gear, .anim-venting .grinder-gear { animation: gr-spin-fast 1s linear infinite; }
        .anim-grinding .machine-body, .anim-venting .machine-body  { animation: gr-machine-shake 0.1s linear infinite; }
        .anim-forging .pot-slam    { animation: gr-slam 0.6s ease-in forwards; }
        .anim-forging .medal-eject { animation: gr-medal-shoot 1.5s ease-out forwards; }
        .anim-venting .mold-fluid  { animation: gr-fluid-vent 1.2s ease-in-out forwards; }

        .particle-layer { position: absolute; inset: 0; z-index: 25; pointer-events: none; opacity: 0; transition: opacity 0.2s; }
        .anim-grinding .particle-layer, .anim-venting .particle-layer { opacity: 1; }
        .dust { position: absolute; width: 8px; height: 8px; border-radius: 50%; border: 2px solid #E58E26; top: 40%; left: 50%; opacity: 0; }
        .dust-gold { background: #FFD700; }
        .dust-slag { background: #2d3436; border-color: #000; }
        .anim-grinding .d1, .anim-venting .d1 { animation: gr-dust-fall 0.4s linear infinite;       margin-left: -12px; }
        .anim-grinding .d2, .anim-venting .d2 { animation: gr-dust-fall 0.3s linear infinite 0.1s;  margin-left:   4px; }
        .anim-grinding .d3, .anim-venting .d3 { animation: gr-dust-fall 0.5s linear infinite 0.2s;  margin-left:  -4px; }
        .anim-grinding .d4, .anim-venting .d4 { animation: gr-dust-fall 0.4s linear infinite 0.3s;  margin-left:  12px; }
      `}</style>
    </div>
  );
};

export default GoldRush;
