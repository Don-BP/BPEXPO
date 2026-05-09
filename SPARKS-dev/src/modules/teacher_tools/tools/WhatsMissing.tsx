import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlashCard, FlashcardDecks } from '../../../utils/db';
import { getAllDecks } from '../../../utils/tango-bridge';
import { useWallet } from '../../../hooks/useWallet';
import AdModal from '../../../components/monetization/AdModal';
import { getTangoCategoryName, isTangoCategoryLocked } from '../../../utils/tangoCategories';
import './WhatsMissing.css';

interface WhatsMissingProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

type GameState = 'idle' | 'showing' | 'hiding' | 'revealed';

interface GameCard extends FlashCard {
  hidden: boolean;
  wasHidden: boolean;
}

const DIFFICULTY_MS: Record<string, number> = { easy: 6000, normal: 4000, hard: 2500 };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WhatsMissing: React.FC<WhatsMissingProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const [adTargetDeckKey, setAdTargetDeckKey] = useState<string | null>(null);

  const [decks, setDecks] = useState<FlashcardDecks>({});
  const [category, setCategory] = useState('');
  const [cardCountMode, setCardCountMode] = useState('6');
  const [customCardCount, setCustomCardCount] = useState(6);
  const [missingCount, setMissingCount] = useState(1);
  const [difficulty, setDifficulty] = useState('normal');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [missingItems, setMissingItems] = useState<FlashCard[]>([]);
  const [status, setStatus] = useState('');
  const [gridCols, setGridCols] = useState(3);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDecks = useCallback(async () => {
    const d = await getAllDecks();
    setDecks(d);
    return d;
  }, []);

  useEffect(() => {
    loadDecks().then(d => {
      const keys = Object.keys(d);
      const firstFree = keys.find(k => !isTangoCategoryLocked(k, isPro, isUnlocked)) ?? keys[0];
      if (firstFree) setCategory(firstFree);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDecks]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const startGame = async () => {
    if (gameState === 'showing' || gameState === 'hiding') return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const effectiveCount = cardCountMode === 'custom'
      ? customCardCount
      : parseInt(cardCountMode, 10);

    if (isNaN(effectiveCount) || effectiveCount < 2 || effectiveCount > 50) {
      setStatus('Please enter a valid custom card count (2–50).');
      return;
    }
    if (!category) {
      setStatus('Please select a category first!');
      setGameCards([]);
      return;
    }

    const allDecks = await loadDecks();
    const deck = (allDecks[category] ?? []).filter(c => !c.muted);

    if (deck.length < effectiveCount) {
      setStatus(`This category needs at least ${effectiveCount} active items.`);
      setGameCards([]);
      return;
    }
    if (missingCount >= effectiveCount) {
      setStatus('Missing cards must be less than total cards.');
      return;
    }

    const gameItems = shuffle(deck).slice(0, effectiveCount);
    setGridCols(Math.ceil(Math.sqrt(effectiveCount)));
    setGameCards(gameItems.map(item => ({ ...item, hidden: false, wasHidden: false })));
    setMissingItems([]);
    setGameState('showing');
    setStatus('Look carefully...');

    timerRef.current = setTimeout(() => {
      setGameCards(prev => {
        const toHideIndices = shuffle(Array.from({ length: prev.length }, (_, i) => i)).slice(0, missingCount);
        const toHideSet = new Set(toHideIndices);
        setMissingItems(toHideIndices.map(i => prev[i]));
        return prev.map((c, i) => ({ ...c, hidden: toHideSet.has(i) }));
      });
      setGameState('hiding');
      setStatus('Which cards are missing?');
    }, DIFFICULTY_MS[difficulty]);
  };

  const revealAnswer = () => {
    if (gameState !== 'hiding') return;
    setGameCards(prev => prev.map(c => ({ ...c, wasHidden: c.hidden, hidden: false })));
    const names = missingItems.map(c => c.text || '[Image Only]').join(', ');
    setStatus(`It was... ${names}!`);
    setGameState('revealed');
    new Audio('/teacher_tools/assets/sounds/reveal.mp3').play().catch(() => {});
  };

  const isRunning = gameState === 'showing' || gameState === 'hiding';
  const btnLabel = gameState === 'revealed' ? 'PLAY AGAIN' : 'START GAME';

  // ── Shared controls ───────────────────────────────────────
  function handleCategoryChange(deckKey: string) {
    if (deckKey && isTangoCategoryLocked(deckKey, isPro, isUnlocked)) {
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

  const categorySelect = (
    <select className="wm-select" value={category} onChange={e => handleCategoryChange(e.target.value)}>
      <option value="">Select a category</option>
      {Object.keys(decks).map(k => {
        const catName = getTangoCategoryName(k);
        const locked = catName ? isTangoCategoryLocked(k, isPro, isUnlocked) : false;
        const icon = catName ? (locked ? '🔒 ' : '🔓 ') : '';
        return <option key={k} value={k}>{icon}{k}</option>;
      })}
    </select>
  );

  const difficultySelect = (
    <select className="wm-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
      <option value="easy">Easy (6s)</option>
      <option value="normal">Normal (4s)</option>
      <option value="hard">Hard (2.5s)</option>
    </select>
  );

  const cardsSelect = (
    <>
      <select className="wm-select wm-select-sm" value={cardCountMode} onChange={e => setCardCountMode(e.target.value)}>
        {['4', '6', '8', '12', '16'].map(v => <option key={v} value={v}>{v}</option>)}
        <option value="custom">Custom</option>
      </select>
      {cardCountMode === 'custom' && (
        <input type="number" min={2} max={50} value={customCardCount}
          onChange={e => setCustomCardCount(parseInt(e.target.value, 10))}
          className="wm-custom-count" />
      )}
    </>
  );

  const missingSelect = (
    <select className="wm-select wm-select-sm" value={missingCount} onChange={e => setMissingCount(parseInt(e.target.value, 10))}>
      <option value="1">1 Card</option>
      <option value="2">2 Cards</option>
      <option value="3">3 Cards</option>
    </select>
  );

  const startBtn = (
    <button className="tool-btn wm-start-btn" onClick={startGame} disabled={isRunning}>
      {btnLabel}
    </button>
  );

  return (
    <div className={`whats-missing-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      {isFullscreen ? (
        <div className="wm-bar-fullscreen">
          <span className="wm-label">Category:</span>
          {categorySelect}
          <span className="wm-label">Difficulty:</span>
          {difficultySelect}
          <span className="wm-label">Cards:</span>
          {cardsSelect}
          <span className="wm-label">Missing:</span>
          {missingSelect}
          {startBtn}
          <button className="tool-btn wm-scoreboard-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
        </div>
      ) : (
        <div className="wm-bar-hub">
          <div className="wm-hub-row">
            <span className="wm-label">Category:</span>
            {categorySelect}
          </div>
          <div className="wm-hub-row">
            <span className="wm-label">Difficulty:</span>
            {difficultySelect}
            <span className="wm-label">Cards:</span>
            {cardsSelect}
          </div>
          <div className="wm-hub-row">
            <span className="wm-label">Missing:</span>
            {missingSelect}
            {startBtn}
          </div>
        </div>
      )}

      {status && <div className="wm-status">{status}</div>}

      <div
        className="whats-missing-grid"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        onClick={revealAnswer}
      >
        {gameCards.map((card, i) => (
          <div
            key={i}
            className={[
              'whats-missing-card',
              card.hidden ? 'wm-invisible' : '',
              card.wasHidden ? 'revealed' : '',
            ].filter(Boolean).join(' ')}
          >
            {card.image && <img src={card.image} alt={card.text} />}
            <span>{card.text}</span>
          </div>
        ))}
      </div>
      <AdModal
        isOpen={adTargetDeckKey !== null}
        featureName={getTangoCategoryName(adTargetDeckKey ?? '') ?? ''}
        onComplete={handleAdComplete}
        onCancel={() => setAdTargetDeckKey(null)}
      />
    </div>
  );
};

export default WhatsMissing;
