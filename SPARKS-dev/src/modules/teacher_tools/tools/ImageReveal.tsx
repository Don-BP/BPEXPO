import React, { useState, useEffect, useRef } from 'react';
import './ImageReveal.css';

interface ImageRevealProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

type GameState = 'idle' | 'ready' | 'playing' | 'paused' | 'finished';

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ImageReveal: React.FC<ImageRevealProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [imageSequence, setImageSequence] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState('');
  const [imageVisible, setImageVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [gridSize, setGridSize] = useState('5x4');
  const [customCols, setCustomCols] = useState(5);
  const [customRows, setCustomRows] = useState(4);
  const [revealMode, setRevealMode] = useState('manual');
  const [customSpeed, setCustomSpeed] = useState(2);
  const [tiles, setTiles] = useState<boolean[]>([]);
  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(4);
  const [status, setStatus] = useState('Upload an image to begin!');
  const [seqStatus, setSeqStatus] = useState('');

  const remainingRef = useRef<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const seqRef = useRef<string[]>([]);
  const imgIdxRef = useRef(0);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const stopInterval = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const finishReveal = (seq: string[], idx: number) => {
    stopInterval();
    setGameState('finished');
    new Audio('/teacher_tools/assets/sounds/reveal.mp3').play().catch(() => {});
    setStatus(idx < seq.length - 1 ? 'Image Revealed! Well done!' : 'All images revealed! Great job!');
  };

  const startAutoInterval = (speed: number) => {
    intervalRef.current = setInterval(() => {
      if (remainingRef.current.length === 0) {
        finishReveal(seqRef.current, imgIdxRef.current);
        return;
      }
      const idx = remainingRef.current.pop()!;
      setTiles(prev => { const n = [...prev]; n[idx] = true; return n; });
      const left = remainingRef.current.length;
      setStatus(`${left} tile${left !== 1 ? 's' : ''} left.`);
      if (left === 0) finishReveal(seqRef.current, imgIdxRef.current);
    }, speed);
  };

  const loadImage = (index: number, seq: string[]) => {
    stopInterval();
    seqRef.current = seq;
    imgIdxRef.current = index;
    setCurrentImageIndex(index);
    setGameState('ready');
    setImageVisible(false);
    setTiles([]);
    remainingRef.current = [];
    setSeqStatus(seq.length > 1 ? `Image ${index + 1} of ${seq.length}` : '');
    const img = new window.Image();
    img.onload = () => { setAspectRatio(`${img.naturalWidth / img.naturalHeight}`); setImageSrc(seq[index]); setStatus('Ready to play!'); };
    img.onerror = () => setStatus('Error loading image.');
    img.src = seq[index];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setStatus(`Loading ${files.length} image(s)...`);
    Promise.all(
      Array.from(files).map(f => new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(f);
      }))
    ).then(results => { setImageSequence(results); loadImage(0, results); })
     .catch(() => setStatus('Error loading images.'));
  };

  const buildGrid = () => {
    let c: number, r: number;
    if (gridSize === 'custom') { c = customCols || 5; r = customRows || 4; }
    else { [c, r] = gridSize.split('x').map(Number); }
    const total = c * r;
    remainingRef.current = shuffle(Array.from({ length: total }, (_, i) => i));
    setCols(c); setRows(r);
    setTiles(Array(total).fill(false));
    setImageVisible(true);
    setGameState('playing');
    if (revealMode === 'manual') {
      setStatus('Click "OPEN TILE" or click a tile!');
    } else {
      const speed = revealMode === 'auto' ? 2000 : (customSpeed || 2) * 1000;
      setStatus('Revealing automatically...');
      startAutoInterval(speed);
    }
  };

  const handleStartPause = () => {
    if (gameState === 'ready') { buildGrid(); }
    else if (gameState === 'playing') { stopInterval(); setGameState('paused'); setStatus('Paused.'); }
    else if (gameState === 'paused') {
      setGameState('playing');
      const speed = revealMode === 'auto' ? 2000 : (customSpeed || 2) * 1000;
      setStatus('Revealing automatically...');
      startAutoInterval(speed);
    }
  };

  const revealOne = (clickedIndex?: number) => {
    if (remainingRef.current.length === 0) { finishReveal(imageSequence, currentImageIndex); return; }
    let idx: number;
    if (clickedIndex !== undefined) {
      const pos = remainingRef.current.indexOf(clickedIndex);
      if (pos === -1) return;
      idx = clickedIndex;
      remainingRef.current.splice(pos, 1);
    } else {
      idx = remainingRef.current.pop()!;
    }
    setTiles(prev => { const n = [...prev]; n[idx] = true; return n; });
    const left = remainingRef.current.length;
    if (left === 0) finishReveal(imageSequence, currentImageIndex);
    else setStatus(`${left} tile${left !== 1 ? 's' : ''} left.`);
  };

  const handleRevealAll = () => {
    stopInterval(); remainingRef.current = [];
    setTiles(prev => prev.map(() => true));
    finishReveal(imageSequence, currentImageIndex);
  };

  const handleResetGrid = () => {
    stopInterval(); remainingRef.current = [];
    setTiles([]); setImageVisible(false);
    setGameState('ready'); setStatus('Ready to play!');
  };

  const handleNextImage = () => {
    const next = currentImageIndex + 1;
    if (next < imageSequence.length) loadImage(next, imageSequence);
  };

  const handleNewGame = () => {
    stopInterval();
    setImageSequence([]); setImageSrc(''); setImageVisible(false);
    setTiles([]); remainingRef.current = [];
    setAspectRatio('auto'); setStatus('Upload an image to begin!');
    setSeqStatus(''); setGameState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showSetup = gameState === 'idle' || gameState === 'ready';
  const isActive = gameState === 'playing' || gameState === 'paused' || gameState === 'finished';
  const showStartPause = gameState === 'ready' ||
    (revealMode !== 'manual' && (gameState === 'playing' || gameState === 'paused'));
  const showRevealTile = revealMode === 'manual' && (gameState === 'playing' || gameState === 'paused');
  const startPauseLabel = gameState === 'ready' ? 'START' : gameState === 'playing' ? 'PAUSE' : 'RESUME';

  // ── Shared select elements ────────────────────────────────
  const gridSelect = (
    <select className="ir-select" value={gridSize} onChange={e => setGridSize(e.target.value)}>
      <option value="3x2">Easy (3×2)</option>
      <option value="5x4">Normal (5×4)</option>
      <option value="8x6">Hard (8×6)</option>
      <option value="10x8">Expert (10×8)</option>
      <option value="custom">Custom</option>
    </select>
  );

  const modeSelect = (
    <select className="ir-select" value={revealMode} onChange={e => setRevealMode(e.target.value)}>
      <option value="manual">Manual</option>
      <option value="auto">Auto (2s)</option>
      <option value="custom">Custom speed</option>
    </select>
  );

  const customGridInputs = gridSize === 'custom' && (
    <>
      <span className="ir-label">Cols:</span>
      <input className="ir-num-input" type="number" min={1} max={20} value={customCols} onChange={e => setCustomCols(+e.target.value)} />
      <span className="ir-label">Rows:</span>
      <input className="ir-num-input" type="number" min={1} max={20} value={customRows} onChange={e => setCustomRows(+e.target.value)} />
    </>
  );

  const customSpeedInput = revealMode === 'custom' && (
    <>
      <span className="ir-label">Speed (s):</span>
      <input className="ir-num-input" type="number" min={0.5} max={30} step={0.5} value={customSpeed} onChange={e => setCustomSpeed(+e.target.value)} />
    </>
  );

  const uploadBtn = (
    <label className="tool-btn ir-pill-btn ir-upload-label">
      📁 UPLOAD
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="ir-file-input" />
    </label>
  );

  return (
    <div className={`image-reveal-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      {isFullscreen ? (
        /* ── Fullscreen: single compact bar ── */
        <div className="ir-bar-fullscreen">
          {gameState === 'idle' && uploadBtn}
          {showSetup && (
            <>
              <span className="ir-label">Grid:</span>
              {gridSelect}
              {customGridInputs}
              <span className="ir-label">Mode:</span>
              {modeSelect}
              {customSpeedInput}
            </>
          )}
          {showStartPause && <button className="tool-btn ir-pill-btn" onClick={handleStartPause}>{startPauseLabel}</button>}
          {showRevealTile && <button className="tool-btn ir-pill-btn" onClick={() => revealOne()}>OPEN TILE</button>}
          {isActive && <button className="tool-btn ir-pill-btn" onClick={handleRevealAll}>ANSWER</button>}
          {isActive && <button className="tool-btn ir-pill-btn" onClick={handleResetGrid}>RESET</button>}
          {gameState === 'finished' && currentImageIndex < imageSequence.length - 1 && (
            <button className="tool-btn ir-pill-btn" onClick={handleNextImage}>NEXT →</button>
          )}
          <button className="tool-btn ir-pill-btn" onClick={handleNewGame}>NEW GAME</button>
          <button className="tool-btn ir-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
          {seqStatus && <span className="ir-seq-status">{seqStatus}</span>}
        </div>
      ) : (
        /* ── Hub: stacked rows ── */
        <div className="ir-bar-hub">
          {showSetup && (
            <>
              {gameState === 'idle' && (
                <div className="ir-hub-row">{uploadBtn}</div>
              )}
              <div className="ir-hub-row">
                <span className="ir-label">Grid:</span>
                {gridSelect}
                {customGridInputs}
                <span className="ir-label">Mode:</span>
                {modeSelect}
                {customSpeedInput}
              </div>
            </>
          )}
          {/* Game controls: row 1 */}
          {(showRevealTile || showStartPause || isActive) && (
            <div className="ir-hub-row">
              {showRevealTile && <button className="tool-btn ir-pill-btn" onClick={() => revealOne()}>OPEN TILE</button>}
              {showStartPause && <button className="tool-btn ir-pill-btn" onClick={handleStartPause}>{startPauseLabel}</button>}
              {isActive && <button className="tool-btn ir-pill-btn" onClick={handleRevealAll}>ANSWER</button>}
            </div>
          )}
          {/* Game controls: row 2 */}
          {(isActive || gameState !== 'idle') && (
            <div className="ir-hub-row">
              {isActive && <button className="tool-btn ir-pill-btn" onClick={handleResetGrid}>RESET</button>}
              {gameState === 'finished' && currentImageIndex < imageSequence.length - 1 && (
                <button className="tool-btn ir-pill-btn" onClick={handleNextImage}>NEXT →</button>
              )}
              <button className="tool-btn ir-pill-btn" onClick={handleNewGame}>NEW GAME</button>
              <button className="tool-btn ir-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
            </div>
          )}
        </div>
      )}

      <div className="ir-status-bar">
        <span>{status}</span>
        {seqStatus && !isFullscreen && <span className="ir-seq-status">{seqStatus}</span>}
      </div>

      <div className="ir-game-area">
        {imageSrc ? (
          <div className="ir-image-container" style={{ aspectRatio }}>
            <img src={imageSrc} alt="reveal" style={{ visibility: imageVisible ? 'visible' : 'hidden' }} />
            <div
              className="ir-grid-overlay"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
            >
              {tiles.map((revealed, i) => (
                <div
                  key={i}
                  className={`ir-grid-tile${revealed ? ' revealed' : ''}`}
                  onClick={() => revealOne(i)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="ir-hint">Upload an image above to begin!</p>
        )}
      </div>
    </div>
  );
};

export default ImageReveal;
