import React, { useState, useEffect, useCallback } from 'react';
import { FlashCard, FlashcardDecks } from '../../../utils/db';
import { getAllDecks } from '../../../utils/tango-bridge';
import { useWallet } from '../../../hooks/useWallet';
import AdModal from '../../../components/monetization/AdModal';
import { getTangoCategoryName, isTangoCategoryLocked } from '../../../utils/tangoCategories';
import { TTBtn, TTModal } from '../games/TTGameComponents';
import './BingoPicker.css';

const SETS_KEY = 'bingo_card_sets';

interface BingoSet { name: string; text: string; items?: FlashCard[]; }

interface BingoPickerProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BingoPicker: React.FC<BingoPickerProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const [adTargetDeckKey, setAdTargetDeckKey] = useState<string | null>(null);
  const [editorAdTargetKey, setEditorAdTargetKey] = useState<string | null>(null);

  // ── Saved sets ───────────────────────────────────────────────
  const [savedSets, setSavedSets] = useState<BingoSet[]>(() => {
    try { return JSON.parse(localStorage.getItem(SETS_KEY) ?? '[]'); } catch { return []; }
  });
  const [setName, setSetName] = useState('');
  // ── Editor state ─────────────────────────────────────────────
  const [showEditor, setShowEditor] = useState(false);
  const [customItems, setCustomItems] = useState<FlashCard[]>([]);
  const [editorDeckKey, setEditorDeckKey] = useState('');
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());

  // ── Core state ───────────────────────────────────────────────
  const [decks, setDecks] = useState<FlashcardDecks>({});
  const [source, setSource] = useState('');
  const [customText, setCustomText] = useState('');
  const [pool, setPool] = useState<FlashCard[]>([]);
  const [picked, setPicked] = useState<FlashCard[]>([]);
  const [currentItem, setCurrentItem] = useState<FlashCard | null>(null);

  const loadDecks = useCallback(async () => {
    const d = await getAllDecks();
    setDecks(d);
    return d;
  }, []);

  useEffect(() => {
    loadDecks().then(d => {
      const keys = Object.keys(d);
      const firstFree = keys.find(k => !isTangoCategoryLocked(k, isPro, isUnlocked)) ?? keys[0];
      if (firstFree) setSource(firstFree);
      const firstUnlocked = keys.find(k => !isTangoCategoryLocked(k, isPro, isUnlocked)) ?? keys[0];
      if (firstUnlocked && !editorDeckKey) setEditorDeckKey(firstUnlocked);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDecks]);

  // ── Pool building ────────────────────────────────────────────
  const buildPool = useCallback(async (src: string, custom: string, items?: FlashCard[]): Promise<FlashCard[]> => {
    if (src === 'custom') {
      if (items && items.length > 0) return shuffle([...items]);
      return shuffle(
        custom.split('\n').map(s => s.trim()).filter(Boolean).map(text => ({ text }))
      );
    }
    if (src) {
      const allDecks = await getAllDecks();
      const deck = (allDecks[src] ?? []).filter(c => !c.muted && (c.text || c.image));
      return shuffle(deck);
    }
    return [];
  }, []);

  const reset = useCallback(async (src: string, custom: string, items?: FlashCard[]) => {
    const newPool = await buildPool(src, custom, items);
    setPool(newPool);
    setPicked([]);
    setCurrentItem(null);
  }, [buildPool]);

  // ── Source / input handlers ──────────────────────────────────
  const handleSourceChange = (src: string) => {
    if (src && src !== 'custom' && isTangoCategoryLocked(src, isPro, isUnlocked)) {
      setAdTargetDeckKey(src);
      return;
    }
    setSource(src);
    reset(src, customText, src === 'custom' ? customItems : undefined);
  };

  function handleAdComplete() {
    if (!adTargetDeckKey) return;
    const catName = getTangoCategoryName(adTargetDeckKey)!;
    unlockFeature(`tango_cat_${catName}`);
    setSource(adTargetDeckKey);
    reset(adTargetDeckKey, customText);
    setAdTargetDeckKey(null);
  }

  const handleCustomChange = (text: string) => {
    setCustomText(text);
    setCustomItems([]);
    if (source === 'custom') reset('custom', text);
  };

  const pickItem = async () => {
    let currentPool = pool;
    if (currentPool.length === 0 && picked.length === 0) {
      const newPool = await buildPool(source, customText, source === 'custom' ? customItems : undefined);
      if (newPool.length === 0) { setCurrentItem({ text: 'Add Items!' }); return; }
      currentPool = newPool;
      setPool(newPool);
    }
    if (currentPool.length === 0) { setCurrentItem({ text: 'All Done!' }); return; }
    const next = [...currentPool];
    const item = next.pop()!;
    setPool(next);
    setPicked(prev => [...prev, item]);
    setCurrentItem(item);
    new Audio('/teacher_tools/assets/sounds/select.mp3').play().catch(() => {});
  };

  // ── Save / load sets ─────────────────────────────────────────
  const saveSet = () => {
    const name = setName.trim();
    if (!name) return;
    if (customItems.length === 0 && !customText.trim()) return;
    const updated = [...savedSets.filter(s => s.name !== name), {
      name,
      text: customText,
      items: customItems.length > 0 ? customItems : undefined,
    }];
    setSavedSets(updated);
    localStorage.setItem(SETS_KEY, JSON.stringify(updated));
    setSetName('');
  };

  const loadSet = (set: BingoSet) => {
    if (set.items && set.items.length > 0) {
      setCustomItems(set.items);
      setCustomText('');
      setSource('custom');
      buildPool('custom', '', set.items).then(p => { setPool(p); setPicked([]); setCurrentItem(null); });
    } else {
      setCustomItems([]);
      setCustomText(set.text);
      setSource('custom');
      reset('custom', set.text);
    }
    setShowSets(false);
  };

  const deleteSet = (name: string) => {
    const updated = savedSets.filter(s => s.name !== name);
    setSavedSets(updated);
    localStorage.setItem(SETS_KEY, JSON.stringify(updated));
  };

  // ── Editor helpers ───────────────────────────────────────────
  const openEditor = () => {
    if (!editorDeckKey && Object.keys(decks).length > 0) setEditorDeckKey(Object.keys(decks)[0]);
    setShowEditor(true);
  };

  const closeEditor = (play = false) => {
    setShowEditor(false);
    setSelectedIdxs(new Set());
    if (play || customItems.length > 0) {
      setSource('custom');
      buildPool('custom', customText, customItems).then(p => { setPool(p); setPicked([]); setCurrentItem(null); });
    }
  };

  const addSelected = () => {
    const deckCards = (decks[editorDeckKey] ?? []).filter(c => c.text || c.image);
    const toAdd = [...selectedIdxs].map(i => deckCards[i]).filter(Boolean);
    setCustomItems(prev => {
      const existing = new Set(prev.map(c => `${c.text}|${c.image ?? ''}`));
      return [...prev, ...toAdd.filter(c => !existing.has(`${c.text}|${c.image ?? ''}`))];
    });
    setSelectedIdxs(new Set());
  };

  const toggleCard = (i: number) => {
    setSelectedIdxs(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const editorCards = (decks[editorDeckKey] ?? []).filter(c => c.text || c.image);

  // ── Source select ────────────────────────────────────────────
  const sourceSelect = (
    <select className="bp-select" value={source} onChange={e => handleSourceChange(e.target.value)}>
      <option value="custom">Custom List</option>
      {Object.keys(decks).map(k => {
        const catName = getTangoCategoryName(k);
        const locked = catName ? isTangoCategoryLocked(k, isPro, isUnlocked) : false;
        const icon = catName ? (locked ? '🔒 ' : '🔓 ') : '';
        return <option key={k} value={k}>{icon}{k}</option>;
      })}
    </select>
  );

  return (
    <div className={`bingo-picker-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      {/* ── Controls bar ── */}
      {isFullscreen ? (
        <div className="bp-bar-fullscreen-wrap">
          <div className="bp-bar-fullscreen">
            <span className="bp-label">Use List From:</span>
            {sourceSelect}
            <button className="tool-btn bp-pill-btn" onClick={pickItem}>CARD</button>
            <button className="tool-btn bp-pill-btn" onClick={() => reset(source, customText, source === 'custom' ? customItems : undefined)}>RESET</button>
            <button className="tool-btn bp-icon-btn" title="Edit Bingo Set" onClick={openEditor}>⚙️</button>
            <button className="tool-btn bp-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
            {pool.length > 0 && <span className="bp-count">{pool.length} left</span>}
          </div>
        </div>
      ) : (
        <div className="bp-bar-hub">
          <div className="bp-hub-row">
            <span className="bp-label">Use List From:</span>
            {sourceSelect}
          </div>

          <div className="bp-hub-row">
            <button className="tool-btn bp-pill-btn" onClick={pickItem}>CARD</button>
            <button className="tool-btn bp-pill-btn" onClick={() => reset(source, customText)}>RESET</button>
            <button className="tool-btn bp-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
            {pool.length > 0 && <span className="bp-count">{pool.length} left</span>}
          </div>
          {source === 'custom' && (
            <textarea
              className="bp-custom-input"
              placeholder="Enter items, one per line..."
              value={customText}
              onChange={e => handleCustomChange(e.target.value)}
            />
          )}
        </div>
      )}

      {/* ── Display area ── */}
      <div className="bp-display-area">
        <div className="bp-current-card">
          {currentItem?.image
            ? <img src={currentItem.image} alt={currentItem.text} className="bp-current-img" />
            : <div className="bp-current-placeholder">🎱</div>
          }
          <div className="bp-current-text">
            {currentItem ? currentItem.text : 'Press CARD to start!'}
          </div>
        </div>
        <div className="bp-picked-panel">
          <div className="bp-picked-header">Already Picked:</div>
          <div className="bp-picked-grid">
            {(isFullscreen ? picked : picked.slice(-4)).map((item, i) => (
              <div key={i} className="bp-picked-card">
                {item.image && <img src={item.image} alt={item.text} />}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card Set Editor Modal ── */}
      {showEditor && (
        <TTModal onClick={() => closeEditor()}>
          <div className="bp-editor-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bp-editor-header">
              <span>✏️ Edit Bingo Set</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <TTBtn onClick={() => closeEditor(true)} variant="green" size="sm">▶ Play</TTBtn>
                <TTBtn onClick={() => closeEditor(false)} variant="default" size="sm">✕ Close</TTBtn>
              </div>
            </div>

            {/* Body */}
            <div className="bp-editor-body">

              {/* Left: current set */}
              <div className="bp-editor-left">
                <div className="bp-editor-panel-header">
                  <span>Current Set ({customItems.length})</span>
                  {customItems.length > 0 && (
                    <button className="bp-editor-clear" onClick={() => setCustomItems([])}>Clear All</button>
                  )}
                </div>
                <div className="bp-editor-current-grid">
                  {customItems.map((item, i) => (
                    <div key={i} className="bp-editor-current-card">
                      <button className="bp-editor-remove-btn"
                        onClick={() => setCustomItems(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                      {item.image && <img src={item.image} alt={item.text} />}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="bp-editor-text-add">
                  <input
                    className="bp-editor-text-input"
                    placeholder="Add text item…"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setCustomItems(prev => [...prev, { text: val }]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>

              </div>

              {/* Right: deck picker */}
              <div className="bp-editor-right">
                <div className="bp-editor-panel-header">
                  <select
                    className="bp-editor-deck-select"
                    value={editorDeckKey}
                    onChange={e => {
                      const key = e.target.value;
                      const catName = getTangoCategoryName(key);
                      if (catName && isTangoCategoryLocked(key, isPro, isUnlocked)) {
                        setShowEditor(false);
                        setEditorAdTargetKey(key);
                        return;
                      }
                      setEditorDeckKey(key);
                      setSelectedIdxs(new Set());
                    }}
                  >
                    {Object.keys(decks).map(k => {
                      const catName = getTangoCategoryName(k);
                      const locked = catName ? isTangoCategoryLocked(k, isPro, isUnlocked) : false;
                      const icon = catName ? (locked ? '🔒 ' : '🔓 ') : '';
                      return <option key={k} value={k}>{icon}{k}</option>;
                    })}
                  </select>
                  {selectedIdxs.size > 0 && (
                    <TTBtn onClick={addSelected} variant="green" size="sm">
                      + Add {selectedIdxs.size} Selected
                    </TTBtn>
                  )}
                </div>
                <div className="bp-editor-picker-grid">
                  {editorCards.map((card, i) => {
                    const sel = selectedIdxs.has(i);
                    return (
                      <div key={i} className={`bp-editor-pick-card${sel ? ' selected' : ''}`} onClick={() => toggleCard(i)}>
                        {sel && <div className="bp-editor-checkmark">✓</div>}
                        {card.image && <img src={card.image} alt={card.text} />}
                        <span>{card.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer: Save / Load */}
            <div className="bp-editor-footer">
              {savedSets.length > 0 && (
                <select
                  className="bp-load-select"
                  defaultValue=""
                  onChange={e => { const s = savedSets.find(x => x.name === e.target.value); if (s) loadSet(s); e.currentTarget.value = ''; }}
                >
                  <option value="" disabled>Load a saved set…</option>
                  {savedSets.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              )}
              <input
                className="bp-set-name-input"
                placeholder="Name this set…"
                value={setName}
                onChange={e => setSetName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveSet(); }}
              />
              <button className="tool-btn bp-pill-btn" onClick={saveSet}
                disabled={!setName.trim() || customItems.length === 0}>
                💾 Save
              </button>
              {setName.trim() && savedSets.find(s => s.name === setName.trim()) && (
                <button className="bp-saved-delete" onClick={() => deleteSet(setName.trim())} title="Delete this set">🗑</button>
              )}
            </div>

          </div>
        </TTModal>
      )}

      <AdModal
        isOpen={adTargetDeckKey !== null}
        featureName={getTangoCategoryName(adTargetDeckKey ?? '') ?? ''}
        onComplete={handleAdComplete}
        onCancel={() => setAdTargetDeckKey(null)}
      />
      <AdModal
        isOpen={editorAdTargetKey !== null}
        featureName={getTangoCategoryName(editorAdTargetKey ?? '') ?? ''}
        onComplete={() => {
          if (!editorAdTargetKey) return;
          const catName = getTangoCategoryName(editorAdTargetKey)!;
          unlockFeature(`tango_cat_${catName}`);
          setEditorDeckKey(editorAdTargetKey);
          setSelectedIdxs(new Set());
          setEditorAdTargetKey(null);
          setShowEditor(true);
        }}
        onCancel={() => { setEditorAdTargetKey(null); setShowEditor(true); }}
      />
    </div>
  );
};

export default BingoPicker;
