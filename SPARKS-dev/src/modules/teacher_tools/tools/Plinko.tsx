import React, { useState, useRef } from 'react';
import PlinkoGame from './PlinkoGame';
import { TTBtn, THEMES } from '../games/TTGameComponents';
import './Scoreboard.css';

interface Team { id: number; name: string; score: number; colorIdx: number; }

const COLORS = [
  { neon: '#ff6b6b', dark: '#c0392b' }, { neon: '#4ecdc4', dark: '#16a085' },
  { neon: '#45b7d1', dark: '#2980b9' }, { neon: '#96ceb4', dark: '#27ae60' },
  { neon: '#ffd700', dark: '#e67e22' }, { neon: '#dfe6e9', dark: '#95a5a6' },
  { neon: '#fd79a8', dark: '#e84393' }, { neon: '#a29bfe', dark: '#6c5ce7' },
  { neon: '#55efc4', dark: '#00b894' }, { neon: '#fdcb6e', dark: '#e17055' },
];

interface PlinkoProps {
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
  onGoToGoldRush: () => void;
}

const Plinko: React.FC<PlinkoProps> = ({
  onBackToScoreboard, onBackToHub, returnFrom, onReturnFrom,
  winScore, bonusAmount, activeTheme,
  onWinScoreChange, onBonusAmountChange, onThemeChange,
  onReset, onGoToGoldRush,
}) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team 1', score: 0, colorIdx: 0 },
    { id: 2, name: 'Team 2', score: 0, colorIdx: 1 },
    { id: 3, name: 'Team 3', score: 0, colorIdx: 2 },
    { id: 4, name: 'Team 4', score: 0, colorIdx: 3 },
  ]);
  const [mode, setMode] = useState<'board' | 'game' | 'result'>('board');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [earnedSlot, setEarnedSlot] = useState(0);
  const [earnedBonus, setEarnedBonus] = useState(0);

  // ── Bonus counter ──────────────────────────────────────────
  // Only yellow (confetti) peg hits count toward the bonus.
  // pegHitsRef persists across rounds; roundBonusRef resets each ball.
  const pegHitsRef = useRef(0);      // running total yellow hits (across all rounds)
  const roundBonusRef = useRef(0);   // bonus earned during the current ball
  const [pegHitsUI, setPegHitsUI] = useState(0);       // 0 .. threshold-1
  const [roundBonusUI, setRoundBonusUI] = useState(0); // for in-game display
  const [bonusThreshold, setBonusThreshold] = useState(15);

  const changeThreshold = (delta: number) => {
    const next = Math.max(3, Math.min(50, bonusThreshold + delta));
    if (next === bonusThreshold) return;
    // reset progress to avoid ghost bonuses
    pegHitsRef.current = 0;
    setPegHitsUI(0);
    setBonusThreshold(next);
  };

  const handleYellowHit = () => {
    pegHitsRef.current++;
    const cyclePos = pegHitsRef.current % bonusThreshold;
    setPegHitsUI(cyclePos);
    if (cyclePos === 0) {
      roundBonusRef.current++;
      setRoundBonusUI(roundBonusRef.current);
    }
  };

  // ── Team management ───────────────────────────────────────
  const addTeam = () => {
    if (teams.length >= 10) return;
    const newId = Math.max(0, ...teams.map(t => t.id)) + 1;
    const used = teams.map(t => t.colorIdx);
    const colorIdx = [0,1,2,3,4,5,6,7,8,9].find(i => !used.includes(i)) ?? 0;
    setTeams(prev => [...prev, { id: newId, name: `Team ${newId}`, score: 0, colorIdx }]);
  };

  const removeTeam = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  const removeLastTeam = () => {
    if (teams.length <= 1) return;
    setTeams(prev => prev.slice(0, -1));
  };

  const handleRename = (id: number, name: string) =>
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t));

  const handleChance = (id: number) => {
    roundBonusRef.current = 0;
    setRoundBonusUI(0);
    setActiveId(id);
    setMode('game');
  };

  const handleLanded = (pts: number) => {
    const bonus = roundBonusRef.current;
    roundBonusRef.current = 0;
    setRoundBonusUI(0);
    setEarnedSlot(pts);
    setEarnedBonus(bonus);
    setMode('result');
  };

  const handleBackToBoard = () => {
    if (activeId !== null) {
      const total = earnedSlot + earnedBonus;
      setTeams(prev => prev.map(t => t.id === activeId ? { ...t, score: t.score + total } : t));
    }
    setActiveId(null);
    setMode('board');
  };

  const activeTeam = teams.find(t => t.id === activeId);
  const activeColor = COLORS[(activeTeam?.colorIdx ?? 0) % COLORS.length];
  const gridCols = teams.length <= 4 ? teams.length : teams.length <= 6 ? 3 : 4;
  const gridRows = teams.length <= 4 ? 1 : teams.length <= 8 ? 2 : 3;
  const totalEarned = earnedSlot + earnedBonus;

  // ── Bonus counter badge (shared between modes) ────────────
  const BonusBadge = ({ showThresholdControls }: { showThresholdControls?: boolean }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
      style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)' }}>
      <span className="text-sm font-bold" style={{ color: '#ffcc00' }}>
        ⭐ {pegHitsUI}/{bonusThreshold}
      </span>
      {roundBonusUI > 0 && (
        <span className="text-xs font-black text-green-400 animate-pulse">+{roundBonusUI} bonus!</span>
      )}
      {showThresholdControls && (
        <div className="flex items-center gap-1 ml-1">
          <button onClick={() => changeThreshold(-1)}
            className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center hover:bg-white/20 transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}>−</button>
          <button onClick={() => changeThreshold(1)}
            className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center hover:bg-white/20 transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}>+</button>
        </div>
      )}
    </div>
  );

  // ── Game / Result ──────────────────────────────────────────
  if (mode === 'game' || mode === 'result') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#050505' }}>
        <header className="flex items-center justify-between px-4 py-2.5 shrink-0 gap-2 flex-wrap"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <button onClick={onBackToHub}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-3 py-1.5 text-sm font-bold transition-colors">
              ← Hub
            </button>
            <button onClick={() => { setMode('board'); setActiveId(null); }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-3 py-1.5 text-sm font-bold transition-colors">
              ← Board
            </button>
          </div>

          <div className="font-bold text-base text-white/80 text-center">
            <span style={{ color: activeColor.neon, textShadow: `0 0 10px ${activeColor.neon}60` }}>
              {activeTeam?.name}
            </span>
            {' '}— drop the ball!
          </div>

          <BonusBadge />
        </header>

        <div className="flex-1 relative min-h-0">
          {mode === 'game' && <PlinkoGame onBallLanded={handleLanded} onYellowHit={handleYellowHit} />}

          {mode === 'result' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: '#050505' }}>
              {/* Points ring */}
              <div className="flex items-center justify-center rounded-full mb-2"
                style={{
                  width: 200, height: 200,
                  background: 'radial-gradient(circle, rgba(255,204,0,0.12) 0%, transparent 70%)',
                  boxShadow: '0 0 60px rgba(255,204,0,0.2), 0 0 120px rgba(255,204,0,0.06)',
                  border: '2px solid rgba(255,204,0,0.3)',
                }}>
                <span style={{ fontSize: '5rem', fontWeight: 900, color: '#ffcc00', textShadow: '0 0 30px #ffcc00' }}>
                  +{totalEarned}
                </span>
              </div>

              {/* Breakdown if there was a bonus */}
              {earnedBonus > 0 && (
                <div className="flex flex-col items-center gap-1 text-sm">
                  <span className="text-white/50">Slot: +{earnedSlot}</span>
                  <span className="text-green-400 font-bold">⭐ Bonus: +{earnedBonus}</span>
                </div>
              )}

              <p className="text-white/70 text-lg text-center">
                <span style={{ color: activeColor.neon, fontWeight: 700 }}>{activeTeam?.name}</span>
                {' '}scored{' '}
                <span style={{ color: '#ffcc00', fontWeight: 700 }}>{totalEarned}</span>
                {' '}point{totalEarned !== 1 ? 's' : ''}!
              </p>

              <button onClick={handleBackToBoard}
                className="px-8 py-3 rounded-full font-black text-lg transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ffcc00, #ff9900)', color: '#0a0a1a', boxShadow: '0 4px 20px rgba(255,204,0,0.35)' }}>
                ← Back to Board
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Board ──────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

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
          <TTBtn onClick={addTeam} disabled={teams.length >= 10} variant="green" size="sm" style={{ width: 32, height: 32, padding: 0, minHeight: 32, borderRadius: '50%' }}>+</TTBtn>
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
        <TTBtn onClick={onGoToGoldRush} variant="orange" size="sm">⛏️ Gold Rush</TTBtn>
        <TTBtn onClick={onReset} variant="pink" size="sm">↺ Reset</TTBtn>
        {returnFrom && onReturnFrom && (
          <TTBtn onClick={onReturnFrom} variant="default" size="sm">↩️ {returnFrom}</TTBtn>
        )}
        <BonusBadge showThresholdControls />
        <button onClick={onBackToHub} title="Exit Fullscreen"
          style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', padding: 0, flexShrink: 0, fontSize: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3d6cb5', background: 'linear-gradient(to bottom, #ffffff, #fffde7)', border: '3px solid #FDD835', boxShadow: '0 4px 0 #F9A825, 0 4px 8px rgba(0,0,0,0.12)', transition: 'transform 0.1s, box-shadow 0.1s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(calc(-50% - 2px))'; e.currentTarget.style.boxShadow = '0 6px 0 #F9A825, 0 6px 12px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%)'; e.currentTarget.style.boxShadow = '0 4px 0 #F9A825, 0 4px 8px rgba(0,0,0,0.12)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(calc(-50% + 3px))'; e.currentTarget.style.boxShadow = '0 1px 0 #F9A825, 0 2px 4px rgba(0,0,0,0.1)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(calc(-50% - 2px))'; e.currentTarget.style.boxShadow = '0 6px 0 #F9A825, 0 6px 12px rgba(0,0,0,0.15)'; }}
        >✕</button>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-[1800px] mx-auto p-3 grid gap-3 min-h-0"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }}>
        {teams.map((team, index) => {
          const col = COLORS[team.colorIdx % COLORS.length];
          return (
            <div key={team.id} className="h-full min-h-0"
              style={index === 8 && teams.length >= 9 ? { gridColumn: '2' } : undefined}>
              <div className="relative h-full rounded-2xl flex flex-col items-center p-3 md:p-4 group"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  border: `2px solid ${col.neon}35`,
                  boxShadow: `0 0 20px ${col.neon}10, inset 0 0 30px rgba(0,0,0,0.2)`,
                }}>
                <button onClick={e => removeTeam(team.id, e)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-white border-4 border-[#ff4757] text-[#ff4757] rounded-full opacity-0 group-hover:opacity-100 hover:bg-[#ff4757] hover:text-white transition-all flex items-center justify-center font-black text-sm shadow-md z-50">
                  ✕
                </button>

                <input
                  className="w-full text-center bg-transparent border-none outline-none font-bold text-base md:text-lg shrink-0 mb-1"
                  style={{ color: col.neon, textShadow: `0 0 8px ${col.neon}50` }}
                  defaultValue={team.name}
                  onBlur={e => { const v = e.target.value.trim(); if (v) handleRename(team.id, v); else e.target.value = team.name; }}
                  onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                />

                <div className="font-black flex-1 flex items-center justify-center"
                  style={{ fontSize: ([
                    'clamp(5rem,16vw,13rem)',
                    'clamp(3.5rem,11vw,9rem)',
                    'clamp(2.5rem,7vw,6rem)',
                    'clamp(1.8rem,5vw,4rem)',
                  ])[gridCols - 1] ?? 'clamp(1.8rem,5vw,4rem)', color: col.neon, textShadow: `0 0 25px ${col.neon}, 0 0 50px ${col.neon}50` }}>
                  {team.score}
                </div>

                <button onClick={() => handleChance(team.id)}
                  className="w-full py-2.5 rounded-xl font-black text-sm md:text-base transition-all hover:scale-[1.03] active:scale-95 shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${col.neon}, ${col.dark})`,
                    color: '#0a0a1a',
                    boxShadow: `0 4px 15px ${col.neon}35`,
                    border: `2px solid ${col.dark}`,
                  }}>
                  🎲 Chance!
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default Plinko;
