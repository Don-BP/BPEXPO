import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { phonicsData, buildDeck, PhonicsCard, PHONICS_STORAGE_KEY, DEFAULT_KEYS } from './phonicsData';
import './Phonics.css';

interface PhonicsProps {
  isFullscreen: boolean;
}

function speakWord(wordHtml: string) {
  if (!('speechSynthesis' in window)) return;
  const clean = wordHtml.replace(/<[^>]*>/g, '');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function loadSavedState(): { checkedKeys: string[]; isCumulative: boolean } {
  try {
    const raw = localStorage.getItem(PHONICS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { checkedKeys: DEFAULT_KEYS, isCumulative: true };
}

const Phonics: React.FC<PhonicsProps> = ({ isFullscreen }) => {
  const saved = loadSavedState();
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => new Set(saved.checkedKeys));
  const [isCumulative, setIsCumulative] = useState(saved.isCumulative);
  const [deck, setDeck] = useState<PhonicsCard[]>(() => buildDeck(saved.checkedKeys, saved.isCumulative));
  // Track which category <details> are open — initialized open for any category with checked items
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    saved.checkedKeys.forEach(key => { initial.add(key.split('|')[0]); });
    return initial;
  });
  const [index, setIndex] = useState(0);

  // Which sets will actually be included when Load is clicked (accounts for cumulative)
  const includedKeys = useMemo(() => {
    if (!isCumulative) return new Set(checkedKeys);
    const included = new Set<string>();
    Object.entries(phonicsData).forEach(([catKey, cat]) => {
      const subKeys = Object.keys(cat.subgroups);
      let highestIdx = -1;
      subKeys.forEach((subKey, idx) => {
        if (checkedKeys.has(`${catKey}|${subKey}`)) highestIdx = idx;
      });
      for (let i = 0; i <= highestIdx; i++) included.add(`${catKey}|${subKeys[i]}`);
    });
    return included;
  }, [checkedKeys, isCumulative]);

  const card = deck[index] ?? null;

  const loadDeck = useCallback((keys: Set<string>, cumulative: boolean) => {
    const arr = Array.from(keys);
    if (arr.length === 0) { alert('Please select at least one phonics set.'); return; }
    const newDeck = buildDeck(arr, cumulative);
    if (newDeck.length === 0) { alert('No cards found for selected sets.'); return; }
    try { localStorage.setItem(PHONICS_STORAGE_KEY, JSON.stringify({ checkedKeys: arr, isCumulative: cumulative })); } catch { /* ignore */ }
    setDeck(newDeck);
    setIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    if (deck.length === 0) return;
    const next = (index + 1) % deck.length;
    setIndex(next);
    speakWord(deck[next].word);
  }, [deck, index]);

  const handlePrev = useCallback(() => {
    if (deck.length === 0) return;
    const prev = (index - 1 + deck.length) % deck.length;
    setIndex(prev);
    speakWord(deck[prev].word);
  }, [deck, index]);

  const handleSound = useCallback(() => {
    if (card) speakWord(card.word);
  }, [card]);

  const toggleKey = (key: string) => {
    const catKey = key.split('|')[0];
    setCheckedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    // Keep the category open when interacting with it
    setOpenCategories(prev => { const next = new Set(prev); next.add(catKey); return next; });
  };

  // When isCumulative changes, open any category that has newly-included sets
  useEffect(() => {
    if (!isCumulative) return;
    setOpenCategories(prev => {
      const next = new Set(prev);
      includedKeys.forEach(k => next.add(k.split('|')[0]));
      return next;
    });
  }, [isCumulative, includedKeys]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ') { e.preventDefault(); handleSound(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen, handleNext, handlePrev, handleSound]);

  const imgSrc = card ? `/teacher_tools/${card.image}` : '';
  const cleanWord = card?.word.replace(/<[^>]*>/g, '') ?? '';

  if (!isFullscreen) {
    return (
      <div className="ph-card-preview">
        <div className="ph-preview-card">
          {card && <div className="ph-preview-word" dangerouslySetInnerHTML={{ __html: card.word }} />}
          <img
            src={imgSrc || '/teacher_tools/assets/phonics/placeholder.png'}
            alt={cleanWord || 'Phonics card'}
            className="ph-preview-image"
          />
        </div>
        <div className="ph-preview-nav">
          <button className="tool-btn ph-preview-nav-btn" onClick={handlePrev} disabled={deck.length === 0}>◀</button>
          <button className="tool-btn ph-preview-nav-btn" onClick={handleSound} disabled={!card}>🔊</button>
          <button className="tool-btn ph-preview-nav-btn" onClick={handleNext} disabled={deck.length === 0}>▶</button>
        </div>
        {deck.length > 0
          ? <span className="ph-preview-counter">{index + 1} / {deck.length}</span>
          : <span className="ph-preview-counter">Go fullscreen to load a set</span>}
      </div>
    );
  }

  return (
    <div className="ph-tool">
      {/* Left: controls */}
      <div className="ph-controls-panel">
        <div className="ph-controls-header">
          <label className="ph-cumulative-label">
            <input
              type="checkbox"
              checked={isCumulative}
              onChange={e => setIsCumulative(e.target.checked)}
            />
            Cumulative
          </label>
          <button type="button" className="tool-btn ph-load-btn" onClick={() => loadDeck(checkedKeys, isCumulative)}>
            Load
          </button>
        </div>

        <div className="ph-category-list">
          {Object.entries(phonicsData).map(([catKey, cat]) => {
            const isOpen = openCategories.has(catKey);
            const hasChecked = Object.keys(cat.subgroups).some(sk => checkedKeys.has(`${catKey}|${sk}`));
            return (
              <details
                key={catKey}
                className="ph-category"
                open={isOpen}
                onToggle={e => {
                  const open = (e.currentTarget as HTMLDetailsElement).open;
                  setOpenCategories(prev => {
                    const next = new Set(prev);
                    if (open) next.add(catKey); else next.delete(catKey);
                    return next;
                  });
                }}
              >
                <summary>
                  {cat.name}
                  {hasChecked && <span className="ph-checked-badge">✓</span>}
                </summary>
                <div className="ph-subgroup-list">
                  {Object.entries(cat.subgroups).map(([subKey, sub]) => {
                    const key = `${catKey}|${subKey}`;
                    const isChecked = checkedKeys.has(key);
                    const isIncluded = !isChecked && includedKeys.has(key);
                    return (
                      <label key={key} className={`ph-checkbox-item${isIncluded ? ' ph-checkbox-item--included' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleKey(key)}
                        />
                        {sub.name}
                        {isIncluded && <span className="ph-cumulative-tag">+cumulative</span>}
                      </label>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* Right: card display */}
      <div className="ph-display">
        {card ? (
          <>
            <div className="ph-nav-row">
              <button className="tool-btn ph-nav-btn" onClick={handlePrev}>◀</button>
              <button className="tool-btn ph-sound-btn" onClick={handleSound}>🔊</button>
              <button className="tool-btn ph-nav-btn" onClick={handleNext}>▶</button>
            </div>

            <div className="ph-card">
              <div className="ph-word" dangerouslySetInnerHTML={{ __html: card.word }} />
              <img
                className="ph-image"
                src={imgSrc}
                alt={cleanWord}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {card.sentence && <p className="ph-sentence">{card.sentence}</p>}
            </div>

            <div className="ph-counter">{index + 1} / {deck.length}</div>
          </>
        ) : (
          <p className="ph-empty">Select a set and press Load.</p>
        )}
      </div>
    </div>
  );
};

export default Phonics;
