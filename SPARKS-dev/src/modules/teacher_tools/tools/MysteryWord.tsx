import React, { useState, useRef, useEffect } from 'react';
import './MysteryWord.css';

interface MysteryWordProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

type GameResult = 'playing' | 'win' | 'lose';

const THEMES = ['rocket', 'dino', 'burger'];
const TRIES_OPTIONS = [3, 5, 7, 9, 11];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getDynamicStateNumber(misses: number, maxMisses: number): number {
  if (misses === 0) return 0;
  if (misses >= maxMisses) return 10;
  const progress = (misses - 1) / (maxMisses - 1);
  return 1 + Math.round(progress * 9);
}

const MysteryWord: React.FC<MysteryWordProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const [wordInput, setWordInput] = useState('');
  const [showWord, setShowWord] = useState(false);
  const [theme, setTheme] = useState('rocket');
  const [maxMisses, setMaxMisses] = useState(7);

  const [screen, setScreen] = useState<'setup' | 'game'>('setup');
  const [secretWord, setSecretWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult>('playing');
  const [activeTheme, setActiveTheme] = useState('rocket');
  const [activeMaxMisses, setActiveMaxMisses] = useState(7);

  const startGame = () => {
    const word = wordInput.trim().toUpperCase();
    if (!word) { alert('Please enter a word or phrase.'); return; }
    setSecretWord(word);
    setActiveTheme(theme);
    setActiveMaxMisses(maxMisses);
    setGuessedLetters(new Set());
    setMisses(0);
    setGameResult('playing');
    setScreen('game');
  };

  const resetToSetup = () => {
    setScreen('setup');
    setWordInput('');
    setShowWord(false);
    setGameResult('playing');
  };

  const handleGuess = (letter: string) => {
    if (gameResult !== 'playing' || guessedLetters.has(letter)) return;
    const next = new Set(guessedLetters);
    next.add(letter);
    setGuessedLetters(next);
    if (secretWord.includes(letter)) {
      new Audio('/teacher_tools/assets/sounds/point-up.mp3').play().catch(() => {});
      const allGuessed = secretWord.split('').filter(c => /[A-Z]/.test(c)).every(c => next.has(c));
      if (allGuessed) { setGameResult('win'); new Audio('/teacher_tools/assets/sounds/winner_reveal.mp3').play().catch(() => {}); }
    } else {
      new Audio('/teacher_tools/assets/sounds/point-down.mp3').play().catch(() => {});
      const newMisses = misses + 1;
      setMisses(newMisses);
      if (newMisses >= activeMaxMisses) { setGameResult('lose'); new Audio('/teacher_tools/assets/sounds/time-end.mp3').play().catch(() => {}); }
    }
  };

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WAVE_COLORS = [
      'rgba(255, 190, 80, 0.36)', 'rgba(255, 215, 105, 0.30)', 'rgba(255, 170, 55, 0.28)',
      'rgba(255, 200, 85, 0.33)', 'rgba(255, 182, 65, 0.38)', 'rgba(255, 220, 110, 0.28)',
      'rgba(255, 160, 50, 0.32)',
    ];
    const WAVES = Array.from({ length: 7 }, (_, i) => {
      const amp = 0.04 + Math.random() * 0.24;           // 0.04 (shallow) to 0.28 (very tall)
      const speedMag = 0.05 + Math.random() * 2.4;       // 0.05 to 2.45
      const speed = Math.random() > 0.5 ? speedMag : -speedMag;
      return {
        y: 0.07 + (i / 6) * 0.86,                        // evenly spread top→bottom
        amp,
        freq: 0.004 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        speed,
        color: WAVE_COLORS[i],
        thick: amp * 0.38 + 0.018,                        // thickness proportional to amp
      };
    });

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width = p.clientWidth || 1;
      canvas.height = p.clientHeight || 1;
    };
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    let startTs: number | null = null;
    const draw = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = (ts - startTs) / 1000;
      const w = canvas.width, h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, w * 0.3, h);
      grad.addColorStop(0, '#FFF8E8');
      grad.addColorStop(0.5, '#FFF0CC');
      grad.addColorStop(1, '#FFE4A8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      WAVES.forEach(wave => {
        const baseY = wave.y * h;
        const amp = wave.amp * h;
        const thick = wave.thick * h;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = baseY
            + Math.sin(x * wave.freq + t * wave.speed + wave.phase) * amp
            + Math.sin(x * wave.freq * 2.1 + t * wave.speed * 1.4 + wave.phase + 1.2) * amp * 0.28;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        for (let x = w; x >= 0; x -= 4) {
          const y = baseY + thick
            + Math.sin(x * wave.freq + t * wave.speed + wave.phase + 0.35) * amp
            + Math.sin(x * wave.freq * 2.1 + t * wave.speed * 1.4 + wave.phase + 1.55) * amp * 0.28;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };
    animFrameRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animFrameRef.current); ro.disconnect(); };
  }, []);

  const stateNumber = getDynamicStateNumber(misses, activeMaxMisses);
  const imageSrc = `/teacher_tools/assets/mystery-word/${activeTheme}/state-${stateNumber}.png`;
  const words = secretWord.split(' ');

  return (
    <div className={`mw-container${isFullscreen ? ' fullscreen-mode' : ''}`}>
      <canvas ref={bgCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, display: 'block' }} />

      {screen === 'setup' ? (
        <div className="mw-setup-controls" style={{ position: 'relative', zIndex: 1 }}>
          <div className="mw-input-wrapper">
            <input
              type={showWord ? 'text' : 'password'}
              className="mw-word-input"
              placeholder="Enter secret word or phrase..."
              value={wordInput}
              onChange={e => setWordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startGame()}
            />
            <button className="mw-toggle-btn" onClick={() => setShowWord(p => !p)}>
              {showWord ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="mw-options-wrapper">
            <div className="mw-option-group">
              <span className="mw-setup-label">Theme:</span>
              <select className="mw-select" value={theme} onChange={e => setTheme(e.target.value)}>
                {THEMES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="mw-option-group">
              <span className="mw-setup-label">Max Misses:</span>
              <select className="mw-select" value={maxMisses} onChange={e => setMaxMisses(+e.target.value)}>
                {TRIES_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <button className="tool-btn mw-start-btn" onClick={startGame}>START GAME</button>
        </div>
      ) : (
        <div className={`mw-game-container${isFullscreen ? ' mw-game-fs' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
          <div className="mw-visual-area">
            <img src={imageSrc} alt={`state ${stateNumber}`} className="mw-visual-image" />
          </div>
          <div className="mw-game-area">
            <div className="mw-tries-display">Misses Left: {activeMaxMisses - misses}</div>
            <div className="mw-word-display">
              {words.map((word, wi) => (
                <div key={wi} className="mw-word-wrapper">
                  {word.split('').map((char, ci) => {
                    const isAlpha = /[A-Z]/.test(char);
                    const isRevealed = !isAlpha || guessedLetters.has(char) || gameResult !== 'playing';
                    return (
                      <div key={ci} className={isAlpha ? (isRevealed ? 'mw-letter' : 'mw-blank') : 'mw-letter mw-non-alpha'}>
                        {isRevealed ? char : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className={`mw-keyboard${isFullscreen ? ' mw-keyboard-fs' : ''}`}>
              {ALPHABET.map(letter => {
                const guessed = guessedLetters.has(letter);
                const correct = guessed && secretWord.includes(letter);
                const incorrect = guessed && !secretWord.includes(letter);
                return (
                  <button
                    key={letter}
                    className={`mw-key${correct ? ' correct' : ''}${incorrect ? ' incorrect' : ''}`}
                    onClick={() => handleGuess(letter)}
                    disabled={guessed || gameResult !== 'playing'}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
            <div className="mw-game-actions">
              <button className="tool-btn mw-action-pill" onClick={() => setGameResult('lose')}>ANSWER</button>
              <button className="tool-btn mw-action-pill" onClick={resetToSetup}>RESET</button>
              <button className="tool-btn mw-action-icon" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'game' && gameResult !== 'playing' && (
        <div className="mw-end-overlay" style={{ zIndex: 10 }}>
          <div className="mw-end-popup">
            <div className="mw-end-message">
              {gameResult === 'win' ? '🎉 You Win! 🎉' : '😭 Game Over 😭'}
            </div>
            <div className="mw-revealed-word">
              {gameResult === 'win' ? secretWord : `The word was: ${secretWord}`}
            </div>
            <div className="mw-end-actions">
              <button className="tool-btn mw-action-pill" onClick={startGame}>PLAY AGAIN</button>
              <button className="tool-btn mw-action-pill" onClick={resetToSetup}>NEW GAME</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryWord;
