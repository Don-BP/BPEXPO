import React, { useState, useRef, useCallback } from 'react';
import './CoinToss.css';

interface CoinTossProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

const THEMES: Record<string, { heads: string; tails: string }> = {
  '1': { heads: '/teacher_tools/assets/coin_face/coin_face_1_a.png', tails: '/teacher_tools/assets/coin_face/coin_face_1_b.png' },
  '2': { heads: '/teacher_tools/assets/coin_face/coin_face_2_a.png', tails: '/teacher_tools/assets/coin_face/coin_face_2_b.png' },
  '3': { heads: '/teacher_tools/assets/coin_face/coin_face_3_a.png', tails: '/teacher_tools/assets/coin_face/coin_face_3_b.png' },
  '4': { heads: '/teacher_tools/assets/coin_face/coin_face_4_a.png', tails: '/teacher_tools/assets/coin_face/coin_face_4_b.png' },
};

const EDGE_COUNT = 20;
const EDGE_RADIUS = 124;

const CoinToss: React.FC<CoinTossProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const [theme, setTheme] = useState('1');
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultColor, setResultColor] = useState('');
  const [resultVisible, setResultVisible] = useState(false);

  const coinRef = useRef<HTMLDivElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flip = useCallback(() => {
    if (isFlipping || !coinRef.current) return;
    setIsFlipping(true);

    if (fadeTimer.current) { clearTimeout(fadeTimer.current); fadeTimer.current = null; }
    setResultVisible(false);

    new Audio('/teacher_tools/assets/coin_face/coin_flip.mp3').play().catch(() => {});

    // Remove classes and force reflow so animation restarts cleanly
    const coin = coinRef.current;
    coin.classList.remove('ct-flip-heads', 'ct-flip-tails');
    void coin.offsetWidth;

    const isHeads = Math.random() >= 0.5;
    coin.classList.add(isHeads ? 'ct-flip-heads' : 'ct-flip-tails');

    setTimeout(() => {
      if (isHeads) {
        setHeadsCount(h => h + 1);
        setResultText('HEADS!');
        setResultColor('#d4af37');
      } else {
        setTailsCount(t => t + 1);
        setResultText('TAILS!');
        setResultColor('#c0c0c0');
      }
      setResultVisible(true);
      fadeTimer.current = setTimeout(() => {
        setResultVisible(false);
        fadeTimer.current = null;
      }, 3000);
      setIsFlipping(false);
    }, 1800);
  }, [isFlipping]);


  const { heads, tails } = THEMES[theme];

  return (
    <div className="ct-tool">
      <div className="ct-top-row">
        <label>Coin:</label>
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="1">Theme 1</option>
          <option value="2">Theme 2</option>
          <option value="3">Theme 3</option>
          <option value="4">Theme 4</option>
        </select>
        <button
          className="tool-btn ct-reset-btn"
          onClick={() => { setHeadsCount(0); setTailsCount(0); }}
          disabled={isFlipping}
        >
          Reset counts
        </button>
        {isFullscreen && <button className="tool-btn ct-scoreboard-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>}
      </div>

      <div className="ct-stage">
        <div className="ct-coin-wrap">
          <div className="ct-coin" ref={coinRef}>
            <div className="ct-face ct-heads">
              <img src={heads} alt="Heads" />
            </div>
            <div className="ct-face ct-tails">
              <img src={tails} alt="Tails" />
            </div>
            <div className="ct-edge">
              {Array.from({ length: EDGE_COUNT }, (_, i) => (
                <div
                  key={i}
                  className="ct-edge-seg"
                  style={{ transform: `rotateY(${18 * (i + 1)}deg) translateZ(${EDGE_RADIUS}px)` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`ct-result${resultVisible ? ' show' : ''}`}
          style={{ color: resultColor }}
        >
          {resultText}
        </div>
      </div>

      <div className="ct-controls">
        <div className="ct-stats">
          <span className="ct-heads-count">👑 Heads: <strong>{headsCount}</strong></span>
          <button className="tool-btn ct-flip-btn" onClick={flip} disabled={isFlipping}>
            {isFlipping ? 'Flipping…' : '🪙 Flip!'}
          </button>
          <span className="ct-tails-count">🔄 Tails: <strong>{tailsCount}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default CoinToss;
