import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlashCard, FlashcardDecks } from '../../../utils/db';
import { getAllDecks } from '../../../utils/tango-bridge';
import { useWallet } from '../../../hooks/useWallet';
import AdModal from '../../../components/monetization/AdModal';
import { getTangoCategoryName, isTangoCategoryLocked } from '../../../utils/tangoCategories';
import './Flashcards.css';

interface FlashcardsProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const [adTargetDeckKey, setAdTargetDeckKey] = useState<string | null>(null);

  const [decks, setDecks] = useState<FlashcardDecks>({});
  const [category, setCategory] = useState('');
  const [currentDeck, setCurrentDeck] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFace, setActiveFace] = useState<'front' | 'back'>('front');
  const [frontContent, setFrontContent] = useState<FlashCard | null>(null);
  const [backContent, setBackContent] = useState<FlashCard | null>(null);
  const [isGridView, setIsGridView] = useState(false);
  const [gridStyle, setGridStyle] = useState<React.CSSProperties>({});
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const gridRef = useRef<HTMLDivElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const loadDecks = useCallback(async () => {
    const d = await getAllDecks();
    setDecks(d);
    return d;
  }, []);

  useEffect(() => {
    loadDecks().then(d => {
      // Auto-select the first free (or already-unlocked) category, not necessarily index 0
      const keys = Object.keys(d);
      const firstFree = keys.find(k => !isTangoCategoryLocked(k, isPro, isUnlocked)) ?? keys[0];
      if (firstFree) setCategory(firstFree);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDecks]);

  useEffect(() => {
    if (!category || !decks[category]) {
      setCurrentDeck([]);
      setCurrentIndex(0);
      setFrontContent(null);
      setBackContent(null);
      setActiveFace('front');
      return;
    }
    const deck = decks[category].filter(c => !c.muted);
    setCurrentDeck(deck);
    setCurrentIndex(0);
    setActiveFace('front');
    setFrontContent(deck[0] ?? null);
    setBackContent(null);
  }, [category, decks]);

  const calculateGrid = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    const n = Math.max(1, el.children.length);

    let best = { cols: 1, cardSize: 0 };
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const cardW = w / cols - 10;
      const cardH = h / rows - 10;
      const size = cardW / (4 / 3) > cardH ? cardH * (4 / 3) : cardW;
      if (size > best.cardSize) best = { cols, cardSize: size };
    }
    const rows = Math.ceil(n / best.cols);
    setGridStyle({
      gridTemplateColumns: `repeat(${best.cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    });
  }, []);

  useEffect(() => {
    roRef.current?.disconnect();
    if (!isGridView) return;
    const ro = new ResizeObserver(calculateGrid);
    roRef.current = ro;
    if (gridRef.current) ro.observe(gridRef.current);
    calculateGrid();
    return () => ro.disconnect();
  }, [isGridView, calculateGrid]);

  useEffect(() => {
    if (isGridView) calculateGrid();
  }, [isFullscreen, isGridView, calculateGrid, currentDeck.length]);

  function navigate(card: FlashCard | null) {
    if (activeFace === 'front') { setBackContent(card); setActiveFace('back'); }
    else { setFrontContent(card); setActiveFace('front'); }
  }

  function handlePrev() {
    if (!currentDeck.length) return;
    const idx = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
    setCurrentIndex(idx); navigate(currentDeck[idx]);
  }

  function handleNext() {
    if (!currentDeck.length) return;
    const idx = (currentIndex + 1) % currentDeck.length;
    setCurrentIndex(idx); navigate(currentDeck[idx]);
  }

  function handleRandom() {
    if (currentDeck.length <= 1) return;
    let idx: number;
    do { idx = Math.floor(Math.random() * currentDeck.length); } while (idx === currentIndex);
    setCurrentIndex(idx); navigate(currentDeck[idx]);
  }

  function handleToggleView() { setFlippedCards(new Set()); setIsGridView(v => !v); }

  function handleCategoryChange(deckKey: string) {
    if (isTangoCategoryLocked(deckKey, isPro, isUnlocked)) {
      setAdTargetDeckKey(deckKey);
      return;
    }
    setCategory(deckKey);
  }

  function handleAdComplete() {
    if (!adTargetDeckKey) return;
    const catName = getTangoCategoryName(adTargetDeckKey)!;
    unlockFeature(`tango_cat_${catName}`);
    setCategory(adTargetDeckKey);
    setAdTargetDeckKey(null);
  }

  function toggleFlip(i: number) {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  function CardFaceContent({ card }: { card: FlashCard | null }) {
    if (!card) return <span className="fc-empty-label">Select a category</span>;
    return (
      <>
        {card.image && <img src={card.image} alt={card.text || 'Card'} />}
        {card.text && <div className="fc-card-text">{card.text}</div>}
      </>
    );
  }

  // Shared elements
  const categorySelect = (
    <select className="fc-select" value={category} onChange={e => handleCategoryChange(e.target.value)}>
      {Object.keys(decks).length === 0 && <option value="">No sets available</option>}
      {Object.keys(decks).map(k => {
        const catName = getTangoCategoryName(k);
        const locked = catName ? isTangoCategoryLocked(k, isPro, isUnlocked) : false;
        const icon = catName ? (locked ? '🔒 ' : '🔓 ') : '';
        return <option key={k} value={k}>{icon}{k}</option>;
      })}
    </select>
  );

  const navButtons = !isGridView && (
    <>
      <button className="tool-btn fc-arrow-btn" onClick={handlePrev}>⬅</button>
      <button className="tool-btn fc-pill-btn" onClick={handleRandom}>RANDOM</button>
      <button className="tool-btn fc-arrow-btn" onClick={handleNext}>➡</button>
    </>
  );

  const toggleBtn = (
    <button className="tool-btn fc-pill-btn" onClick={handleToggleView}>
      {isGridView ? 'SHOW ONE' : 'SHOW ALL'}
    </button>
  );

  return (
    <>
    <div className={`flashcards-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      {isFullscreen ? (
        <div className="fc-bar-fullscreen">
          {navButtons}
          {toggleBtn}
          <span className="fc-cat-label">Category:</span>
          {categorySelect}
          <button className="tool-btn fc-icon-btn" title="Refresh decks" onClick={() => loadDecks()}>↻</button>
          <button className="tool-btn fc-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
        </div>
      ) : (
        <div className="fc-bar-hub">
          <div className="fc-hub-row">
            {navButtons}
            {toggleBtn}
          </div>
          <div className="fc-hub-row fc-cat-row">
            <span>Category:</span>
            {categorySelect}
          </div>
        </div>
      )}

      {!isGridView && (
        <div className="flashcard-display-container">
          <div className="flashcard-display">
            <div className={`flashcard-face flashcard-front${activeFace === 'front' ? ' active' : ''}`}>
              <CardFaceContent card={frontContent} />
            </div>
            <div className={`flashcard-face flashcard-back${activeFace === 'back' ? ' active' : ''}`}>
              <CardFaceContent card={backContent} />
            </div>
          </div>
        </div>
      )}

      {isGridView && (
        <div ref={gridRef} className="flashcard-grid-view" style={gridStyle}>
          {currentDeck.length === 0
            ? <div className="fc-empty-label">No active cards to display.</div>
            : currentDeck.map((card, i) => (
              <div
                key={i}
                className={`flashcard-grid-item${flippedCards.has(i) ? ' is-flipped' : ''}`}
                onClick={() => toggleFlip(i)}
              >
                <div className="fgi-inner">
                  <div className="fgi-front">
                    {card.image && <img src={card.image} alt={card.text || 'Card'} />}
                    {card.text && <div>{card.text}</div>}
                  </div>
                  <div
                    className="fgi-back"
                    style={{ backgroundImage: `url('/teacher_tools/assets/flashcards/card-back${(i % 2) + 1}.png')` }}
                  />
                </div>
              </div>
            ))
          }
        </div>
      )}

    </div>

    <AdModal
      isOpen={adTargetDeckKey !== null}
      featureName={getTangoCategoryName(adTargetDeckKey ?? '') ?? ''}
      onComplete={handleAdComplete}
      onCancel={() => setAdTargetDeckKey(null)}
    />
    </>
  );
};

export default Flashcards;
