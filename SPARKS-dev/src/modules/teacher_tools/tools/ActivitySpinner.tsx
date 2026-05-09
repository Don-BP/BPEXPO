import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FlashcardDecks } from '../../../utils/db';
import { getAllDecks } from '../../../utils/tango-bridge';
import { useWallet } from '../../../hooks/useWallet';
import AdModal from '../../../components/monetization/AdModal';
import { getTangoCategoryName, isTangoCategoryLocked } from '../../../utils/tangoCategories';
import './ActivitySpinner.css';

interface Segment {
  text: string;
  image: string | null;
}

interface SavedSetup {
  name: string;
  segments: Segment[];
}

interface ActivitySpinnerProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

const SEGMENT_COLORS = [
  '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#E76F51',
  '#F4A261', '#E9C46A', '#2A9D8F', '#264653', '#F7A072',
  '#ED6A5A', '#F8E16C', '#08A045', '#1E96FC', '#AF2BBF',
];

const DEFAULT_SEGMENTS: Segment[] = [
  { text: "Yes!", image: null }, { text: "No!", image: null },
  { text: "Maybe", image: null }, { text: "Ask Again", image: null },
  { text: "Let's Try!", image: null }, { text: "Good Idea!", image: null },
  { text: "Hmm...", image: null }, { text: "Definitely!", image: null },
];

const SEGMENTS_KEY = 'donSegments_v2';
const CAP_KEY = 'spinnerCapImageData';
const FONT_KEY = 'spinnerFontSize';
const SAVED_SETUPS_KEY = 'spinnerSavedSetups_v1';
const TILT_X = -25;

function playSound(file: string) {
  new Audio(`/teacher_tools/assets/sounds/${file}`).play().catch(() => {});
}


const ActivitySpinner: React.FC<ActivitySpinnerProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const [segments, setSegments] = useState<Segment[]>(() => {
    try {
      const raw = localStorage.getItem(SEGMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Segment[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_SEGMENTS));
  });

  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const [adTargetDeckKey, setAdTargetDeckKey] = useState<string | null>(null);

  const [decks, setDecks] = useState<FlashcardDecks>({});
  const [selectedDeck, setSelectedDeck] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [capImage, setCapImage] = useState<string | null>(() => localStorage.getItem(CAP_KEY));
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem(FONT_KEY) ?? '18', 10));
  const [savedSetups, setSavedSetups] = useState<SavedSetup[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_SETUPS_KEY);
      if (raw) return JSON.parse(raw) as SavedSetup[];
    } catch { /* ignore */ }
    return [];
  });
  const [setupName, setSetupName] = useState('');
  const [showGear, setShowGear] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState(-1);
  const [resultText, setResultText] = useState('');
  const [resultVisible, setResultVisible] = useState(false);
  const [wheelWidth, setWheelWidth] = useState(700);
  const [wheelHeight, setWheelHeight] = useState(320);
  const [transitionOn, setTransitionOn] = useState(true);

  const wheelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rotYRef = useRef(0);
  const isSpinRef = useRef(false);
  const segsRef = useRef(segments);

  useEffect(() => { segsRef.current = segments; }, [segments]);

  useEffect(() => { getAllDecks().then(setDecks); }, []);

  useEffect(() => {
    try { localStorage.setItem(SEGMENTS_KEY, JSON.stringify(segments)); } catch { /* ignore */ }
  }, [segments]);

  useEffect(() => {
    try { localStorage.setItem(SAVED_SETUPS_KEY, JSON.stringify(savedSetups)); } catch { /* ignore */ }
  }, [savedSetups]);

  const saveSetup = () => {
    const name = setupName.trim();
    if (!name) { alert('Please enter a name for this setup.'); return; }
    setSavedSetups(prev => {
      const existing = prev.findIndex(s => s.name === name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { name, segments: [...segments] };
        return updated;
      }
      return [...prev, { name, segments: [...segments] }];
    });
    setSetupName('');
  };

  const loadSetup = (setup: SavedSetup) => {
    setSegments([...setup.segments]);
    resetVisuals();
    setShowGear(false);
    playSound('config_load.mp3');
  };

  const deleteSetup = (name: string) => {
    setSavedSetups(prev => prev.filter(s => s.name !== name));
  };

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const update = () => {
      setWheelWidth(el.clientWidth);
      setWheelHeight(el.clientHeight);
    };
    const obs = new ResizeObserver(update);
    obs.observe(el);
    update();
    return () => obs.disconnect();
  }, [isFullscreen]);

  const resetVisuals = useCallback(() => {
    setWinnerIdx(-1);
    setResultText('');
    setResultVisible(false);
    isSpinRef.current = false;
    setIsSpinning(false);
    setTransitionOn(false);
    rotYRef.current = 0;
    setRotationY(0);
    setTimeout(() => setTransitionOn(true), 20);
  }, []);

  const onSpinEnd = useCallback(() => {
    if (!isSpinRef.current) return;
    isSpinRef.current = false;
    setIsSpinning(false);

    const segs = segsRef.current;
    const count = segs.length;
    if (count < 2) return;

    const segAngle = 360 / count;
    const rot = rotYRef.current;
    const normalised = ((rot % 360) + 360) % 360;
    const finalAngle = ((360 - normalised) + segAngle / 2) % 360;
    const idx = Math.floor(finalAngle / segAngle) % count;

    setWinnerIdx(idx);
    const winner = segs[idx];
    if (winner) {
      setResultText(winner.text || '[Image]');
      setResultVisible(true);
      playSound('winner_reveal.mp3');
      if (typeof (window as any).confetti === 'function') {
        (window as any).confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, zIndex: 1001 });
      }
    }
  }, []);

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    el.addEventListener('transitionend', onSpinEnd);
    return () => el.removeEventListener('transitionend', onSpinEnd);
  }, [onSpinEnd, isFullscreen]);

  const spinWheel = () => {
    if (isSpinRef.current || segments.length < 2) return;
    isSpinRef.current = true;
    setIsSpinning(true);
    setResultVisible(false);
    setWinnerIdx(-1);

    const extraSpins = Math.floor(Math.random() * 5) + 8;
    const randomAngle = Math.random() * 360;
    const target = rotYRef.current - (extraSpins * 360 + randomAngle);
    rotYRef.current = target;
    setRotationY(target);
    playSound('spin_start.mp3');
  };

  const addItem = () => {
    const text = wordInput.trim();
    if (!text && !pendingImage) { alert('Please enter text or add an image.'); return; }
    setSegments(prev => [...prev, { text, image: pendingImage }]);
    setWordInput('');
    setPendingImage(null);
    resetVisuals();
    playSound('item_add.mp3');
  };

  const removeItem = (i: number) => {
    setSegments(prev => prev.filter((_, idx) => idx !== i));
    resetVisuals();
    playSound('item_remove.mp3');
  };

  const handleDeckChange = (name: string) => {
    if (name && isTangoCategoryLocked(name, isPro, isUnlocked)) {
      setShowGear(false);
      setAdTargetDeckKey(name);
      return;
    }
    loadDeck(name);
  };

  function handleAdComplete() {
    if (!adTargetDeckKey) return;
    const catName = getTangoCategoryName(adTargetDeckKey)!;
    unlockFeature(`tango_cat_${catName}`);
    loadDeck(adTargetDeckKey);
    setAdTargetDeckKey(null);
  }

  const loadDeck = async (name: string) => {
    setSelectedDeck(name);
    if (!name) {
      setSegments(JSON.parse(JSON.stringify(DEFAULT_SEGMENTS)));
    } else {
      const all = await getAllDecks();
      const deck = (all[name] ?? []).filter(c => !c.muted);
      setSegments(deck.map(c => ({ text: c.text ?? '', image: c.image ?? null })));
    }
    resetVisuals();
    playSound('config_load.mp3');
  };

  const handleSegImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingImage(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleCapImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setCapImage(url);
      try { localStorage.setItem(CAP_KEY, url); } catch { /* ignore */ }
    };
    reader.readAsDataURL(f);
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    setFontSize(n);
    try { localStorage.setItem(FONT_KEY, n.toString()); } catch { /* ignore */ }
  };

  // Derived geometry
  const count = segments.length;
  const segAngle = count > 0 ? 360 / count : 0;
  const radius = wheelWidth / 2;
  const segW = count >= 2 && radius > 0
    ? 2 * radius * Math.tan((segAngle / 2) * (Math.PI / 180)) * 1.01
    : 0;
  const canSpin = count >= 2 && !isSpinning;

  const rootStyle = {
    '--segment-font-size': `${fontSize}px`,
    '--cap-image': capImage ? `url("${capImage}")` : 'none',
    '--cap-diameter': `${wheelWidth}px`,
    '--wheel-height': `${wheelHeight}px`,
  } as React.CSSProperties;

  if (!isFullscreen) {
    const winner = winnerIdx >= 0 && winnerIdx < segments.length ? segments[winnerIdx] : null;
    return (
      <div className="spinner-card-preview">
        <div className="spinner-display-wrapper">
          <div className="spinner-container-grid">
            <div
              className="spinner-wheel-grid"
              ref={wheelRef}
              style={{
                transform: `rotateX(${TILT_X}deg) rotateY(${rotationY}deg)`,
                transition: transitionOn ? 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
              }}
            >
              {count >= 2 && segW > 0 ? (
                segments.map((seg, i) => (
                  <div
                    key={i}
                    className={`act-spinner__segment${winnerIdx === i ? ' winner' : ''}`}
                    style={{
                      width: `${segW}px`,
                      backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                      transform: `translateX(-50%) rotateY(${segAngle * i}deg) translateZ(${radius}px)`,
                    }}
                  >
                    {seg.image && <img src={seg.image} alt={seg.text} />}
                    <span>{seg.text}</span>
                  </div>
                ))
              ) : (
                <div className="act-spinner__placeholder">Add 2+ items!</div>
              )}
            </div>
          </div>
        </div>

        <div className="spinner-card-result-area">
          {resultVisible && winner && (
            <>
              {winner.image && <img className="spinner-card-result-img" src={winner.image} alt={winner.text} />}
              {winner.text && <div className="spinner-card-result-text">{winner.text}</div>}
            </>
          )}
        </div>

        <button className="tool-btn spinner-card-spin-btn" onClick={spinWheel} disabled={!canSpin}>
          🎰 SPIN!
        </button>
        <AdModal
          isOpen={adTargetDeckKey !== null}
          featureName={getTangoCategoryName(adTargetDeckKey ?? '') ?? ''}
          onComplete={handleAdComplete}
          onCancel={() => setAdTargetDeckKey(null)}
        />
      </div>
    );
  }

  const fsWinner = winnerIdx >= 0 && winnerIdx < segments.length ? segments[winnerIdx] : null;

  return (
    <div className="act-spinner" ref={rootRef} style={rootStyle}>
      <div className="act-spinner__main">

        <div className="act-spinner__btn-row">
          <button className="tool-btn act-spinner__spin-btn" onClick={spinWheel} disabled={!canSpin}>
            🎰 SPIN!
          </button>
        </div>
        <div style={{ position: 'fixed', top: 10, right: 44, display: 'flex', gap: '6px', zIndex: 30 }}>
          <button className="tool-btn act-spinner__scoreboard-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
          <button className="tool-btn act-spinner__gear-btn" onClick={() => setShowGear(p => !p)} title="Settings">⚙️</button>
        </div>

        <div className="act-spinner__container">
          <div
            className="act-spinner__wheel"
            ref={wheelRef}
            style={{
              transform: `rotateX(${TILT_X}deg) rotateY(${rotationY}deg)`,
              transition: transitionOn ? 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
            }}
          >
            {count >= 2 && segW > 0 ? (
              segments.map((seg, i) => (
                <div
                  key={i}
                  className={`act-spinner__segment${winnerIdx === i ? ' winner' : ''}`}
                  style={{
                    width: `${segW}px`,
                    backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    transform: `translateX(-50%) rotateY(${segAngle * i}deg) translateZ(${radius}px)`,
                  }}
                >
                  {seg.image && <img src={seg.image} alt={seg.text} />}
                  <span>{seg.text}</span>
                </div>
              ))
            ) : (
              <div className="act-spinner__placeholder">Add 2+ items to spin!</div>
            )}
          </div>
        </div>

        <div className={`act-spinner__result${resultVisible ? ' visible' : ''}`}>
          {fsWinner?.image && <img className="act-spinner__result-img" src={fsWinner.image} alt={fsWinner.text} />}
          {resultText && <span className="act-spinner__result-text">{resultText}</span>}
        </div>


      </div>

      {showGear && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10003, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowGear(false); }}
        >
          <div className="act-spinner__config-modal">
            <div className="act-spinner__config-modal-header">
              <span>Settings</span>
              <button className="act-spinner__config-close" onClick={() => setShowGear(false)}>✕</button>
            </div>
            <div className="act-spinner__config-modal-body">

              <div className="act-spinner__block">
                <h3>Items</h3>
                <div className="act-spinner__add-row">
                  <input
                    type="text"
                    className="act-spinner__text-input"
                    placeholder="Add item..."
                    value={wordInput}
                    onChange={e => setWordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                  />
                  <label className="act-spinner__icon-btn" title="Attach image">
                    🖼
                    <input type="file" accept="image/*" onChange={handleSegImg} hidden />
                  </label>
                  <button className="tool-btn act-spinner__add-btn" onClick={addItem}>+</button>
                </div>

                {pendingImage && (
                  <div className="act-spinner__img-preview">
                    <img src={pendingImage} alt="preview" />
                    <button onClick={() => setPendingImage(null)}>✖</button>
                  </div>
                )}

                <div className="act-spinner__deck-row">
                  <label>Deck:</label>
                  <select value={selectedDeck} onChange={e => handleDeckChange(e.target.value)}>
                    <option value="">— Default —</option>
                    {Object.keys(decks).map(k => {
                      const catName = getTangoCategoryName(k);
                      const locked = catName ? isTangoCategoryLocked(k, isPro, isUnlocked) : false;
                      const icon = catName ? (locked ? '🔒 ' : '🔓 ') : '';
                      return <option key={k} value={k}>{icon}{k}</option>;
                    })}
                  </select>
                </div>

                <ul className="act-spinner__list">
                  {count === 0 && <li className="act-spinner__empty">No items yet.</li>}
                  {segments.map((seg, i) => (
                    <li key={i} className="act-spinner__list-item">
                      <div className="act-spinner__item-content">
                        {seg.image && <img src={seg.image} alt={seg.text} />}
                        <span>{seg.text || '[Image]'}</span>
                      </div>
                      <button className="act-spinner__remove-btn" onClick={() => removeItem(i)}>✖</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="act-spinner__block">
                <h3>Saved Setups</h3>
                <div className="act-spinner__save-row">
                  <select
                    className="act-spinner__text-input"
                    defaultValue=""
                    disabled={savedSetups.length === 0}
                    onChange={e => { const s = savedSetups.find(x => x.name === e.target.value); if (s) loadSetup(s); e.currentTarget.value = ''; }}
                    style={{ cursor: savedSetups.length === 0 ? 'default' : 'pointer', fontWeight: 600 }}
                  >
                    <option value="" disabled>{savedSetups.length === 0 ? 'No saved setups yet' : 'Load a saved setup…'}</option>
                    {savedSetups.map(s => <option key={s.name} value={s.name}>{s.name} ({s.segments.length} items)</option>)}
                  </select>
                  <button
                    className="act-spinner__remove-btn"
                    onClick={() => { if (setupName.trim()) deleteSetup(setupName.trim()); else alert('Type the setup name to delete it.'); }}
                    title="Delete setup by name"
                  >✖</button>
                </div>
                <div className="act-spinner__save-row">
                  <input
                    type="text"
                    className="act-spinner__text-input"
                    placeholder="Setup name..."
                    value={setupName}
                    onChange={e => setSetupName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveSetup()}
                  />
                  <button className="tool-btn act-spinner__add-btn" onClick={saveSetup} title="Save current setup">💾</button>
                </div>
              </div>

              <div className="act-spinner__block">
                <h3>Appearance</h3>
                <div className="act-spinner__appearance-row">
                  <label className="tool-btn act-spinner__upload-btn">
                    📷 Cap image
                    <input type="file" accept="image/*" onChange={handleCapImg} hidden />
                  </label>
                  {capImage && (
                    <button
                      className="act-spinner__clear-btn"
                      onClick={() => { setCapImage(null); localStorage.removeItem(CAP_KEY); }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="act-spinner__font-row">
                  <span>Font: {fontSize}px</span>
                  <input type="range" min="10" max="32" value={fontSize} onChange={handleFontSize} />
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      <AdModal
        isOpen={adTargetDeckKey !== null}
        featureName={getTangoCategoryName(adTargetDeckKey ?? '') ?? ''}
        onComplete={handleAdComplete}
        onCancel={() => setAdTargetDeckKey(null)}
      />
    </div>
  );
};

export default ActivitySpinner;
