import React, { useState, useEffect, useRef } from 'react';
import './Scoreboard.css';
import GoldRush from './GoldRush';
import Plinko from './Plinko';
import SparkleBackground from '../../../components/common/SparkleBackground';
import { TTBtn, THEMES } from '../games/TTGameComponents';

// ── Constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'donThemedScoreboard';
const MAX_TEAMS = 10;
const MIN_TEAMS = 1;
const DEFAULT_NAMES = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6', 'Team 7', 'Team 8', 'Team 9', 'Team 10'];
const TEAM_COLORS = ['#2a75bb', '#d9534f', '#5cb85c', '#f0ad4e', '#8e44ad', '#16a085', '#e74c3c', '#2980b9', '#27ae60', '#d35400'];

function getColumns(count: number): number {
  if (count <= 3) return count;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  if (count <= 8) return 4;
  return 4; // 9 → 3 rows (4+4+1), 10 → 3 rows (4+4+2)
}

// ── State helpers ──────────────────────────────────────────────────────────
interface SBState {
  teamCount: number; winScore: number; bonusAmount: number;
  activeTheme: string; isGameActive: boolean;
  scores: Record<number, number>;
  teamNames: Record<number, string>;
  teamAvatars: Record<number, string>;
}

function makeDefault(): SBState {
  const s: SBState = { teamCount: 4, winScore: 20, bonusAmount: 1, activeTheme: 'default', isGameActive: true, scores: {}, teamNames: {}, teamAvatars: {} };
  for (let i = 1; i <= MAX_TEAMS; i++) { s.scores[i] = 0; s.teamNames[i] = DEFAULT_NAMES[i - 1]; s.teamAvatars[i] = ''; }
  return s;
}

function loadState(): SBState {
  const base = makeDefault();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const loaded = JSON.parse(raw);
    if (loaded.isGameActive === false) { delete loaded.scores; loaded.isGameActive = true; }
    const s = { ...base, ...loaded };
    for (let i = 1; i <= MAX_TEAMS; i++) {
      if (s.scores[i] === undefined) s.scores[i] = 0;
      if (!s.teamNames[i]) s.teamNames[i] = DEFAULT_NAMES[i - 1];
      if (s.teamAvatars[i] === undefined) s.teamAvatars[i] = '';
    }
    return s;
  } catch { return base; }
}

function persist(s: SBState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function playSound(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
}

// ── Theme handlers ─────────────────────────────────────────────────────────
// Each update() receives the .score-display element; win() receives the .team card element.

function setNum(el: HTMLElement, score: number) {
  const n = el.querySelector('.score-number');
  if (n) n.textContent = String(score);
}

type UpdateFn = (el: HTMLElement, score: number, delta: number | null, winScore: number) => void;
type WinFn = (card: HTMLElement, isWinner: boolean) => void;
interface TH { update: UpdateFn; win: WinFn; }

function simpleTokenTheme(
  visualClass: string,
  makeItem: () => HTMLElement,
): TH {
  return {
    update(el, score) {
      if (!el.querySelector(`.${visualClass}`)) {
        el.innerHTML = `<div class="score-number">${score}</div><div class="${visualClass} theme-visual-container"></div>`;
      } else setNum(el, score);
      const visual = el.querySelector(`.${visualClass}`) as HTMLElement;
      const curr = visual.children.length;
      if (score > curr) {
        for (let i = curr; i < score; i++) visual.appendChild(makeItem());
      } else if (score < curr) {
        Array.from(visual.children).slice(score).forEach(c => {
          c.classList.add('animate-shrink');
          c.addEventListener('animationend', () => (c as Element).remove(), { once: true });
        });
      }
    },
    win(card, isWinner) { card.classList.toggle(`${visualClass.split('-')[0]}-winner`, isWinner); }
  };
}

const themeHandlers: Record<string, TH> = {
  default: {
    update(el, score) {
      if (!el.querySelector('.score-number')) el.innerHTML = `<div class="score-number">${score}</div>`;
      else setNum(el, score);
    },
    win(card, isWinner) { card.style.borderColor = isWinner ? 'gold' : ''; card.style.transform = isWinner ? 'scale(1.05)' : ''; }
  },
  'star-jar': {
    update(el, score, delta) {
      if (!el.querySelector('.star-jar-visual')) {
        el.innerHTML = `<div class="score-number">${score}</div><div class="star-jar-visual theme-visual-container"></div>`;
      } else setNum(el, score);
      const jar = el.querySelector('.star-jar-visual') as HTMLElement;
      if (delta === null) { jar.innerHTML = Array.from({ length: score }, () => `<span class="star-token theme-item">★</span>`).join(''); return; }
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          const fly = document.createElement('span');
          fly.className = 'flying-star'; fly.innerHTML = '★'; el.appendChild(fly); fly.classList.add('animate');
          playSound('/teacher_tools/assets/sounds/select.mp3');
          fly.addEventListener('animationend', () => {
            fly.remove();
            const star = document.createElement('span'); star.className = 'star-token theme-item animate-land'; star.innerHTML = '★'; jar.appendChild(star);
          }, { once: true });
        }
      } else {
        const kids = Array.from(jar.querySelectorAll('.theme-item:not(.shrinking)'));
        kids.slice(Math.max(0, kids.length - Math.abs(delta))).forEach(c => {
          c.classList.add('shrinking', 'animate-shrink');
          c.addEventListener('animationend', () => (c as Element).remove(), { once: true });
        });
      }
    },
    win(card, isWinner) { card.classList.toggle('star-jar-winner', isWinner); if (isWinner) card.querySelectorAll('.star-token').forEach(e => e.classList.add('dancing')); }
  },
  spring: {
    update(el, score, _, winScore) {
      if (!el.querySelector('.spring-visual')) {
        el.innerHTML = `<div class="score-number">${score}</div><div class="spring-visual theme-visual-container"><div class="spring-vine"></div><div class="spring-flowers"></div></div>`;
      } else setNum(el, score);
      const vine = el.querySelector('.spring-vine') as HTMLElement;
      const flowersC = el.querySelector('.spring-flowers') as HTMLElement;
      vine.style.height = `${Math.min(100, (score / (winScore || 20)) * 100)}%`;
      const curr = flowersC.children.length;
      if (score > curr) {
        for (let i = curr; i < score; i++) {
          const item = document.createElement('div'); item.className = 'flower theme-item animate-pop'; item.innerHTML = '🌸';
          item.style.left = `${Math.random() * 80 + 10}%`; item.style.top = `${Math.random() * 80 + 10}%`; flowersC.appendChild(item);
        }
      } else if (score < curr) {
        Array.from(flowersC.children).slice(score).forEach(c => { c.classList.add('animate-shrink'); c.addEventListener('animationend', () => (c as Element).remove(), { once: true }); });
      }
    },
    win(card, isWinner) { card.classList.toggle('spring-winner', isWinner); if (isWinner) card.querySelectorAll('.flower').forEach(e => e.classList.add('dancing')); }
  },
  science: {
    update(el, score) {
      if (!el.querySelector('.science-visual')) {
        el.innerHTML = `<div class="score-number">${score}</div><div class="science-visual theme-visual-container"><div class="science-nucleus"></div><div class="science-orbit-container"></div></div>`;
      } else setNum(el, score);
      const orbitC = el.querySelector('.science-orbit-container') as HTMLElement;
      const curr = orbitC.children.length;
      if (score > curr) {
        for (let i = curr; i < score; i++) {
          const item = document.createElement('div'); item.className = 'electron theme-item animate-pop';
          item.style.setProperty('--orbit-duration', `${(Math.random() * 2.5 + 3.5).toFixed(2)}s`);
          item.style.setProperty('--orbit-delay', `-${(Math.random() * 5).toFixed(2)}s`); orbitC.appendChild(item);
        }
      } else if (score < curr) {
        Array.from(orbitC.children).slice(score).forEach(c => { c.classList.add('animate-shrink'); c.addEventListener('animationend', () => (c as Element).remove(), { once: true }); });
      }
    },
    win(card, isWinner) { card.classList.toggle('science-winner', isWinner); if (isWinner) card.querySelectorAll('.electron').forEach(e => e.classList.add('dancing')); }
  },
  music: {
    update(el, score) {
      if (!el.querySelector('.music-visual')) {
        el.innerHTML = `<div class="score-number">${score}</div><div class="music-visual theme-visual-container"><div class="music-staff-line"></div><div class="music-staff-line"></div><div class="music-staff-line"></div><div class="music-staff-line"></div><div class="music-staff-line"></div><div class="music-notes-container"></div></div>`;
      } else setNum(el, score);
      const notesC = el.querySelector('.music-notes-container') as HTMLElement;
      const notes = ['🎵', '🎶', '🎼']; const curr = notesC.children.length;
      if (score > curr) {
        for (let i = curr; i < score; i++) {
          const item = document.createElement('div'); item.className = 'note theme-item animate-pop'; item.innerHTML = notes[Math.floor(Math.random() * 3)];
          item.style.left = `${Math.random() * 80 + 10}%`; item.style.top = `${Math.random() * 80 + 10}%`; notesC.appendChild(item);
        }
      } else if (score < curr) {
        Array.from(notesC.children).slice(score).forEach(c => { c.classList.add('animate-shrink'); c.addEventListener('animationend', () => (c as Element).remove(), { once: true }); });
      }
    },
    win(card, isWinner) { card.classList.toggle('music-winner', isWinner); if (isWinner) card.querySelectorAll('.note').forEach(e => e.classList.add('dancing')); }
  },
  'energy-bar': {
    update(el, score, delta, winScore) {
      if (!el.querySelector('.energy-bar-visual')) {
        el.innerHTML = `<div class="score-number">${score}</div><div class="energy-bar-visual theme-visual-container"><div class="energy-bar-fill"></div><div class="energy-bar-sparks"></div></div>`;
      } else setNum(el, score);
      const fill = el.querySelector('.energy-bar-fill') as HTMLElement;
      fill.style.setProperty('--fill-percent', `${Math.min(100, (score / (winScore || 20)) * 100)}%`);
      el.classList.toggle('has-points', score > 0);
      if (delta !== null && delta > 0) fill.classList.add('animate-increase');
      else if (delta !== null && delta < 0) fill.classList.add('animate-decrease');
      fill.addEventListener('animationend', () => fill.classList.remove('animate-increase', 'animate-decrease'), { once: true });
    },
    win(card, isWinner) { card.classList.toggle('energy-bar-winner', isWinner); }
  },
  animals: simpleTokenTheme('animals-visual', () => { const d = document.createElement('div'); d.className = 'paw theme-item animate-pop'; d.innerHTML = '🐾'; d.style.left = `${Math.random() * 80 + 10}%`; d.style.top = `${Math.random() * 80 + 10}%`; return d; }),
  christmas: simpleTokenTheme('christmas-visual', () => { const d = document.createElement('div'); d.className = 'gift theme-item animate-pop'; d.innerHTML = ['🎁', '🎀', '🎄'][Math.floor(Math.random() * 3)]; return d; }),
  halloween: simpleTokenTheme('halloween-visual', () => { const d = document.createElement('div'); d.className = 'ghost theme-item animate-pop'; d.innerHTML = '👻'; d.style.left = `${Math.random() * 80 + 10}%`; d.style.top = `${Math.random() * 80 + 10}%`; return d; }),
  minimalist: simpleTokenTheme('minimalist-dots', () => { const d = document.createElement('div'); d.className = 'dot theme-item animate-pop'; return d; }),
};

// ── Component ──────────────────────────────────────────────────────────────
interface ScoreboardProps { isFullscreen: boolean; returnFrom?: string; onReturnFrom?: () => void; onExitFullscreen?: () => void; }

const Scoreboard: React.FC<ScoreboardProps> = ({ isFullscreen, returnFrom, onReturnFrom, onExitFullscreen }) => {
  const [showGoldRush, setShowGoldRush] = useState(false);
  const [showPlinko, setShowPlinko] = useState(false);
  const initial = loadState();
  const [teamCount, setTeamCount] = useState(initial.teamCount);
  const [winScore, setWinScore] = useState(initial.winScore);
  const [bonusAmount, setBonusAmount] = useState(initial.bonusAmount);
  const [activeTheme, setActiveTheme] = useState(initial.activeTheme);
  const [isGameActive, setIsGameActive] = useState(initial.isGameActive);
  const [scores, setScores] = useState<Record<number, number>>(initial.scores);
  const [teamNames, setTeamNames] = useState<Record<number, string>>(initial.teamNames);
  const [teamAvatars, setTeamAvatars] = useState<Record<number, string>>(initial.teamAvatars);
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState<{ name: string; color: string; avatar: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const stateRef = useRef<SBState>(initial);
  const scoreDisplayRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const teamCardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiFrameRef = useRef<number | null>(null);
  const prevThemeRef = useRef(initial.activeTheme);

  // Keep stateRef in sync
  stateRef.current.teamCount = teamCount;
  stateRef.current.winScore = winScore;
  stateRef.current.bonusAmount = bonusAmount;
  stateRef.current.activeTheme = activeTheme;
  stateRef.current.isGameActive = isGameActive;
  stateRef.current.scores = scores;
  stateRef.current.teamNames = teamNames;
  stateRef.current.teamAvatars = teamAvatars;

  // ── Theme CSS loading ────────────────────────────────────
  useEffect(() => {
    let link = document.getElementById('sb-theme-link') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link'); link.id = 'sb-theme-link'; link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = activeTheme !== 'default' ? `/teacher_tools/themes/${activeTheme}.css` : '';
    if (isFullscreen && activeTheme !== 'default') document.body.classList.add(`theme-${activeTheme}`);
    return () => { document.body.classList.remove(`theme-${activeTheme}`); };
  }, [activeTheme, isFullscreen]);

  // ── Initialize / re-initialize score displays ────────────
  useEffect(() => {
    if (!isFullscreen) return;
    const themeChanged = prevThemeRef.current !== activeTheme;
    prevThemeRef.current = activeTheme;
    const t = setTimeout(() => {
      for (let i = 1; i <= stateRef.current.teamCount; i++) {
        const el = scoreDisplayRefs.current[i];
        if (!el) continue;
        if (themeChanged) el.innerHTML = '';
        const handler = themeHandlers[stateRef.current.activeTheme] || themeHandlers.default;
        handler.update(el, stateRef.current.scores[i], null, stateRef.current.winScore);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [isFullscreen, teamCount, activeTheme, winScore]);

  // ── Confetti ─────────────────────────────────────────────
  function startConfetti() {
    if (confettiFrameRef.current) return;
    const canvas = confettiCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
    const colors = ['#FFC700', '#FF4B4B', '#5DFF4B', '#4B8DFF', '#FF4BFF'];
    const particles = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: -Math.random() * canvas.height,
      w: Math.random() * 8 + 5, h: Math.random() * 4 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 2, rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 20 - 10,
    }));
    const draw = () => {
      if (!confettiFrameRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speed; p.rotation += p.rotationSpeed;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      confettiFrameRef.current = requestAnimationFrame(draw);
    };
    confettiFrameRef.current = requestAnimationFrame(draw);
  }

  function stopConfetti() {
    if (confettiFrameRef.current) { cancelAnimationFrame(confettiFrameRef.current); confettiFrameRef.current = null; }
    const canvas = confettiCanvasRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ── Score update ─────────────────────────────────────────
  function updateScore(teamId: number, rawAmount: number, alwaysOne = false) {
    if (!stateRef.current.isGameActive) return;
    const pts = alwaysOne ? rawAmount : (rawAmount > 0 ? stateRef.current.bonusAmount : -1);
    const oldScore = stateRef.current.scores[teamId];
    const newScore = Math.max(0, oldScore + pts);
    const delta = newScore - oldScore;
    if (delta === 0) return;
    const updated = { ...stateRef.current.scores, [teamId]: newScore };
    stateRef.current.scores = updated;
    setScores(updated);
    const el = scoreDisplayRefs.current[teamId];
    if (el) {
      const handler = themeHandlers[stateRef.current.activeTheme] || themeHandlers.default;
      handler.update(el, newScore, delta, stateRef.current.winScore);
    }
    playSound(pts > 0 ? '/teacher_tools/assets/sounds/point-up.mp3' : '/teacher_tools/assets/sounds/point-down.mp3');
    persist(stateRef.current);
    if (stateRef.current.winScore > 0 && newScore >= stateRef.current.winScore) triggerWin(teamId, newScore);
  }

  function triggerWin(teamId: number, _score: number) {
    playSound('/teacher_tools/assets/sounds/winner_reveal.mp3');
    const handler = themeHandlers[stateRef.current.activeTheme] || themeHandlers.default;
    for (let i = 1; i <= stateRef.current.teamCount; i++) {
      const card = teamCardRefs.current[i]; if (card) handler.win(card, i === teamId);
    }
    setWinner({ name: stateRef.current.teamNames[teamId], color: TEAM_COLORS[teamId - 1], avatar: stateRef.current.teamAvatars[teamId] });
    setShowWinner(true);
    startConfetti();
    persist(stateRef.current);
  }

  function performReset() {
    setShowConfirm(false); setShowWinner(false); stopConfetti();
    const cleared: Record<number, number> = {};
    for (let i = 1; i <= MAX_TEAMS; i++) cleared[i] = 0;
    stateRef.current.scores = cleared; stateRef.current.isGameActive = true;
    setScores(cleared); setIsGameActive(true);
    for (let i = 1; i <= MAX_TEAMS; i++) {
      const card = teamCardRefs.current[i];
      if (card) { card.style.borderColor = ''; card.style.transform = ''; card.className = card.className.replace(/\b[\w-]+-winner\b/g, '').trim(); }
      const el = scoreDisplayRefs.current[i];
      if (el) { el.innerHTML = ''; const h = themeHandlers[stateRef.current.activeTheme] || themeHandlers.default; h.update(el, 0, null, stateRef.current.winScore); }
    }
    persist(stateRef.current);
  }

  function handleNameChange(teamId: number, name: string) {
    const trimmed = name.trim();
    const updated = { ...stateRef.current.teamNames, [teamId]: trimmed };
    stateRef.current.teamNames = updated;
    setTeamNames(updated);
    persist(stateRef.current);
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>, teamId: number) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const updated = { ...stateRef.current.teamAvatars, [teamId]: src };
      stateRef.current.teamAvatars = updated;
      setTeamAvatars(updated);
      persist(stateRef.current);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function changeTeamCount(delta: number) {
    if (!stateRef.current.isGameActive) return;
    const next = Math.max(MIN_TEAMS, Math.min(MAX_TEAMS, stateRef.current.teamCount + delta));
    if (next === stateRef.current.teamCount) return;
    stateRef.current.teamCount = next;
    setTeamCount(next);
    persist(stateRef.current);
    playSound('/teacher_tools/assets/sounds/select.mp3');
  }

  function handleThemeChange(theme: string) {
    stateRef.current.activeTheme = theme;
    setActiveTheme(theme);
    persist(stateRef.current);
    playSound('/teacher_tools/assets/sounds/select.mp3');
  }

  function handleWinScoreChange(v: number) {
    stateRef.current.winScore = v; setWinScore(v); persist(stateRef.current);
  }
  function handleBonusAmountChange(v: number) {
    stateRef.current.bonusAmount = v; setBonusAmount(v); persist(stateRef.current);
  }

  // ── Card view (non-fullscreen) ───────────────────────────
  if (!isFullscreen) {
    return (
      <div className="scoreboard-tool">
        <div className="sb-card-teams" style={{ '--sb-card-count': Math.min(teamCount, 4) } as React.CSSProperties}>
          {Array.from({ length: Math.min(teamCount, 4) }, (_, i) => i + 1).map(id => (
            <div key={id} className="sb-card-team">
              <div className="sb-card-avatar-wrap">
                <img src={teamAvatars[id] || undefined} className="sb-card-avatar" alt="" />
                <input type="file" className="sb-card-av-input" id={`sb-card-av-${id}`} accept="image/*"
                  onChange={e => handleAvatarUpload(e, id)} />
                <label htmlFor={`sb-card-av-${id}`} className="sb-card-av-label" title="Upload avatar">✏️</label>
              </div>
              <h3 className="sb-card-name" style={{ color: TEAM_COLORS[id - 1] }}
                contentEditable suppressContentEditableWarning
                onBlur={e => handleNameChange(id, e.currentTarget.textContent || '')}>
                {teamNames[id]}
              </h3>
              <div className="sb-card-score" id={`score-team${id}`} style={{ color: TEAM_COLORS[id - 1] }}>{scores[id]}</div>
              <div className="sb-card-controls">
                <button className="tool-btn sb-card-btn" onClick={() => updateScore(id, 1, true)}>▲</button>
                <button className="tool-btn sb-card-btn" onClick={() => updateScore(id, -1, true)}>▼</button>
              </div>
            </div>
          ))}
        </div>
        <button className="sb-card-reset" onClick={() => setShowConfirm(true)}>Reset Scores</button>
        {showConfirm && (
          <div className="sb-confirm-overlay">
            <div className="sb-confirm-popup">
              <p>Reset all scores?</p>
              <button className="sb-confirm-yes" onClick={performReset}>Yes, Reset</button>
              <button className="sb-confirm-no" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Gold Rush overlay ────────────────────────────────────
  if (showGoldRush) {
    return (
      <GoldRush
        onBackToScoreboard={() => setShowGoldRush(false)}
        onBackToHub={() => { setShowGoldRush(false); onExitFullscreen?.(); }}
        returnFrom={returnFrom}
        onReturnFrom={onReturnFrom ? () => { setShowGoldRush(false); onReturnFrom(); } : undefined}
        winScore={winScore}
        bonusAmount={bonusAmount}
        activeTheme={activeTheme}
        onWinScoreChange={handleWinScoreChange}
        onBonusAmountChange={handleBonusAmountChange}
        onThemeChange={handleThemeChange}
        onReset={() => setShowConfirm(true)}
        onGoToPlinko={() => { setShowGoldRush(false); setShowPlinko(true); }}
      />
    );
  }

  // ── Plinko overlay ───────────────────────────────────────
  if (showPlinko) {
    return (
      <Plinko
        onBackToScoreboard={() => setShowPlinko(false)}
        onBackToHub={() => { setShowPlinko(false); onExitFullscreen?.(); }}
        returnFrom={returnFrom}
        onReturnFrom={onReturnFrom ? () => { setShowPlinko(false); onReturnFrom(); } : undefined}
        winScore={winScore}
        bonusAmount={bonusAmount}
        activeTheme={activeTheme}
        onWinScoreChange={handleWinScoreChange}
        onBonusAmountChange={handleBonusAmountChange}
        onThemeChange={handleThemeChange}
        onReset={() => setShowConfirm(true)}
        onGoToGoldRush={() => { setShowPlinko(false); setShowGoldRush(true); }}
      />
    );
  }

  // ── Fullscreen view ──────────────────────────────────────
  return (
    <div className="scoreboard-tool fullscreen-mode" style={{ backgroundColor: '#1e3875' }}>
      <SparkleBackground />
      {/* Controls bar */}
      <div className="scoreboard-fullscreen-controls">
        <div className="sb-control-group">
          <label>Teams:</label>
          <TTBtn onClick={() => changeTeamCount(-1)} variant="red" size="sm" style={{ width: 32, height: 32, padding: 0, minHeight: 32, borderRadius: '50%' }}>−</TTBtn>
          <span className="sb-count">{teamCount}</span>
          <TTBtn onClick={() => changeTeamCount(1)} variant="green" size="sm" style={{ width: 32, height: 32, padding: 0, minHeight: 32, borderRadius: '50%' }}>+</TTBtn>
        </div>
        <div className="sb-control-group">
          <label>Theme:</label>
          <select value={activeTheme} onChange={e => handleThemeChange(e.target.value)}>
            {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="sb-control-group">
          <label>Win at:</label>
          <input type="number" className="sb-num-input" value={winScore} min={0} max={999}
            onChange={e => handleWinScoreChange(parseInt(e.target.value) || 0)} />
        </div>
        <div className="sb-control-group">
          <label>+Pts:</label>
          <input type="number" className="sb-num-input" value={bonusAmount} min={1} max={99}
            onChange={e => handleBonusAmountChange(parseInt(e.target.value) || 1)} />
        </div>
        <TTBtn onClick={() => setShowGoldRush(true)} variant="orange" size="sm">⛏️ Gold Rush</TTBtn>
        <TTBtn onClick={() => setShowPlinko(true)} variant="teal" size="sm">🎳 Plinko</TTBtn>
        <TTBtn onClick={() => setShowConfirm(true)} variant="pink" size="sm">↺ Reset</TTBtn>
        {returnFrom && onReturnFrom && (
          <TTBtn onClick={onReturnFrom} variant="default" size="sm">↩️ {returnFrom}</TTBtn>
        )}
      </div>

      {/* Team cards */}
      <div className="sb-teams-container" style={{ '--sb-cols': getColumns(teamCount) } as React.CSSProperties}>
        {Array.from({ length: teamCount }, (_, i) => i + 1).map(id => (
          <div
            key={id}
            className="team"
            data-team-id={id}
            style={{ '--team-color': TEAM_COLORS[id - 1], ...(id === 9 && teamCount >= 9 ? { gridColumn: '2' } : {}) } as React.CSSProperties}
            ref={el => { teamCardRefs.current[id] = el; }}
          >
            <div className="team-avatar-container">
              <img src={teamAvatars[id] || undefined} className="team-avatar" alt="" />
              <input type="file" className="avatar-upload-input" id={`sb-av-${id}`} accept="image/*"
                onChange={e => handleAvatarUpload(e, id)} />
              <label htmlFor={`sb-av-${id}`} className="avatar-upload-label" title="Upload avatar">✏️</label>
            </div>
            <div className="team-name-display">
              <input
                className="name-text"
                defaultValue={teamNames[id]}
                style={{ color: TEAM_COLORS[id - 1] }}
                onBlur={e => handleNameChange(id, e.target.value)}
              />
            </div>
            <div className="score-display" ref={el => { scoreDisplayRefs.current[id] = el as HTMLDivElement; }} />
            <div className="team-controls">
              <button className="point-btn minus" data-amount="-1" onClick={() => updateScore(id, -1)}>▼</button>
              <button className="point-btn plus" data-amount="1" onClick={() => updateScore(id, 1)}>▲</button>
            </div>
          </div>
        ))}
      </div>

      {/* Winner popup */}
      {showWinner && winner && (
        <div className="sb-winner-popup">
          <canvas ref={confettiCanvasRef} className="sb-confetti-canvas" />
          <div className="winner-popup-content">
            <button className="winner-popup-close" onClick={() => { setShowWinner(false); stopConfetti(); }}>✕</button>
            {winner.avatar && <img src={winner.avatar} className="winner-avatar" alt="" />}
            <div>🏆 Winner! 🏆</div>
            <div id="winner-team-name" style={{ color: winner.color }}>{winner.name}</div>
          </div>
        </div>
      )}

      {/* Confirm reset popup */}
      {showConfirm && (
        <div className="sb-confirm-overlay">
          <div className="sb-confirm-popup">
            <p>Reset all scores?</p>
            <button className="sb-confirm-yes" onClick={performReset}>Reset</button>
            <button className="sb-confirm-no" onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
