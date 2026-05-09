// ========= START: bp-tango-dev/src/components/TangoPracticeScreen.js (ADDED CLOSE X) =========
import React, { useState, useEffect, useMemo, useRef } from 'react';
import SaveSetModal from './SaveSetModal';
import Flashcard from './Flashcard';
import SideMenu from './SideMenu';
import speechSynth from '../utils/speechSynth';
import { CATEGORIES as MasterCategoryList } from './TangoSetupScreen';
import DynamicTextLabel from './DynamicTextLabel';

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

interface TangoPracticeScreenProps {
  settings: {
    grade: number;
    categories: string[];
    words: any[];
  };
  onEndPractice: () => void;
  onSaveSet: (setName: string, wordIds: number[]) => void;
}

function TangoPracticeScreen({ settings, onEndPractice, onSaveSet }: TangoPracticeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>(settings.categories);
  const [speechSpeed, setSpeechSpeed] = useState<'normal' | 'slow'>('normal');
  const [displayMode, setDisplayMode] = useState<'single' | 'multi'>('single');
  const [flippedStates, setFlippedStates] = useState<{ [key: number]: boolean }>({});

  // Game State
  const [isSpeakingRandomly, setIsSpeakingRandomly] = useState(false);
  const [targetWordId, setTargetWordId] = useState<number | null>(null);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const startTimeRef = useRef(0);
  const currentCategoryRef = useRef<string | null>(null);

  // Layout
  const multiViewContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [dynamicGridStyles, setDynamicGridStyles] = useState({ gridTemplateColumns: '', cardWidth: 0, cardHeight: 0, maxLabelHeight: 0 });

  // --- NEW: Selection / Make Set Mode State ---
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const originalWordOrder = useMemo(() => settings.words, [settings.words]);

  const displayWords = useMemo(() => {
    const filtered = originalWordOrder.filter(word => activeCategories.includes(word.category));

    if (isShuffled) {
      return shuffleArray(filtered);
    } else {
      return filtered.sort((a: any, b: any) => {
        const indexA = MasterCategoryList.findIndex(cat => cat.id === a.category);
        const indexB = MasterCategoryList.findIndex(cat => cat.id === b.category);
        if (indexA !== indexB) return indexA - indexB;
        return 0;
      });
    }
  }, [originalWordOrder, activeCategories, isShuffled]);

  const currentCategoryWords = useMemo(() => {
    if (!displayWords[currentIndex]) return [];
    const currentCategory = displayWords[currentIndex].category;
    return displayWords.filter((word: any) => word.category === currentCategory);
  }, [currentIndex, displayWords]);

  const practiceCategoriesDetails = useMemo(() => {
    return MasterCategoryList.filter(cat => settings.categories.includes(cat.id));
  }, [settings.categories]);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setContainerSize({ width, height });
      }
    });
    const currentRef = multiViewContainerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [displayMode]);

  useEffect(() => {
    // Debounce layout calculation to prevent thrashing and ensure dimensions are stable
    const timeoutId = setTimeout(() => {
      if (displayMode !== 'multi' || containerSize.width === 0 || containerSize.height === 0 || currentCategoryWords.length === 0) return;

      const calculateBestLayout = () => {
        const cardCount = currentCategoryWords.length;
        // Ensure we have usable space
        const containerWidth = Math.max(containerSize.width - 20, 300); // Subtract padding, enforce min width
        const containerHeight = Math.max(containerSize.height - 20, 300); // Subtract padding, enforce min height

        let bestLayout = { cols: 1, cardSize: 0 };
        const rowGap = 15;
        const colGap = 10;
        const CARD_TO_TOTAL_HEIGHT_RATIO = 1.55; // Card height + label space

        for (let rows = 1; rows <= cardCount; rows++) {
          const cols = Math.ceil(cardCount / rows);
          const totalVerticalGap = (rows - 1) * rowGap;

          // Calculate max possible height per card
          const availableHeight = Math.max(0, containerHeight - totalVerticalGap);
          const cardSizeFromHeight = availableHeight / (rows * CARD_TO_TOTAL_HEIGHT_RATIO);

          const totalHorizontalGap = (cols - 1) * colGap;
          // Calculate max possible width per card
          const availableWidth = Math.max(0, containerWidth - totalHorizontalGap);
          const cardSizeFromWidth = availableWidth / cols;

          const currentCardSize = Math.min(cardSizeFromHeight, cardSizeFromWidth);

          if (currentCardSize > bestLayout.cardSize) {
            bestLayout = { cols: cols, cardSize: currentCardSize };
          }
        }

        // Safety check if calculation failed to produce a reasonable size
        if (bestLayout.cardSize < 50) {
          bestLayout.cardSize = 150; // Fallback size
          bestLayout.cols = Math.floor(containerWidth / 160) || 1;
        }

        const maxLabelHeight = bestLayout.cardSize * (CARD_TO_TOTAL_HEIGHT_RATIO - 1);

        setDynamicGridStyles({
          gridTemplateColumns: `repeat(${bestLayout.cols}, ${bestLayout.cardSize}px)`,
          cardWidth: bestLayout.cardSize,
          cardHeight: bestLayout.cardSize,
          maxLabelHeight: maxLabelHeight,
        });
      };

      calculateBestLayout();
    }, 100); // Small delay to allow flexbox to settle

    return () => clearTimeout(timeoutId);
  }, [containerSize, currentCategoryWords, displayMode]);

  useEffect(() => {
    let interval: any = null;
    if (timerIsActive) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerIsActive, elapsedTime]);

  useEffect(() => {
    if (displayMode !== 'multi' || currentCategoryWords.length === 0 || !timerIsActive) return;
    const allFlipped = currentCategoryWords.every((word: any) => flippedStates[word.id]);
    if (allFlipped) {
      setTimerIsActive(false);
      setIsSpeakingRandomly(false);
      setTargetWordId(null);
    }
  }, [flippedStates, currentCategoryWords, displayMode, timerIsActive]);

  const categoryId = currentCategoryWords[0]?.category;
  useEffect(() => {
    if (displayMode === 'multi' && categoryId && currentCategoryRef.current !== categoryId) {
      setTimerIsActive(false);
      setElapsedTime(0);
      setFlippedStates({});
      setIsSpeakingRandomly(false);
      setTargetWordId(null);
      currentCategoryRef.current = categoryId;
    }
  }, [categoryId, displayMode]);

  useEffect(() => {
    if (!isSpeakingRandomly || displayMode !== 'multi') {
      setTargetWordId(null);
      return;
    }
    const runGameLoop = () => {
      const faceUpWords = currentCategoryWords.filter((word: any) => !flippedStates[word.id]);
      if (faceUpWords.length === 0) {
        setIsSpeakingRandomly(false);
        setTargetWordId(null);
        return;
      }
      let wordToSpeakObj: any = null;
      const currentTargetIsValid = targetWordId && faceUpWords.some((w: any) => w.id === targetWordId);
      if (currentTargetIsValid) {
        wordToSpeakObj = faceUpWords.find((w: any) => w.id === targetWordId);
      } else {
        const randomIndex = Math.floor(Math.random() * faceUpWords.length);
        wordToSpeakObj = faceUpWords[randomIndex];
        setTargetWordId(wordToSpeakObj.id);
      }
      if (wordToSpeakObj) speechSynth.speak(wordToSpeakObj.word, speechSpeed);
    };
    runGameLoop();
    const intervalId = setInterval(runGameLoop, 2000);
    return () => clearInterval(intervalId);
  }, [isSpeakingRandomly, displayMode, flippedStates, currentCategoryWords, speechSpeed, targetWordId]);

  useEffect(() => { if (currentIndex >= displayWords.length && displayWords.length > 0) setCurrentIndex(0); }, [displayWords, currentIndex]);

  const handleNext = () => { if (displayWords.length > 0) setCurrentIndex(p => (p + 1) % displayWords.length); };
  const handlePrevious = () => { if (displayWords.length > 0) setCurrentIndex(p => (p - 1 + displayWords.length) % displayWords.length); };

  const handleSayWord = () => {
    if (isSelectionMode) return; // Disable sound/game in selection mode
    if (displayMode === 'single' && displayWords[currentIndex]) {
      speechSynth.speak(displayWords[currentIndex].word, speechSpeed);
    } else if (displayMode === 'multi') {
      const allCardsFlipped = currentCategoryWords.length > 0 && currentCategoryWords.every((word: any) => flippedStates[word.id]);
      if (allCardsFlipped) return;
      const newSpeakingState = !isSpeakingRandomly;
      setIsSpeakingRandomly(newSpeakingState);
      setTimerIsActive(newSpeakingState);
      if (!newSpeakingState) setTargetWordId(null);
    }
  };

  const handleToggleMultiMode = () => {
    setIsSpeakingRandomly(false);
    setTimerIsActive(false);
    setElapsedTime(0);
    setTargetWordId(null);
    setDisplayMode(prev => (prev === 'single' ? 'multi' : 'single'));
  };

  const handleFlipAll = (direction: 'up' | 'down') => {
    if (displayMode !== 'multi' || currentCategoryWords.length === 0) return;
    const newFlippedValue = direction === 'down';
    const categoryUpdates = currentCategoryWords.reduce((acc: any, word: any) => {
      acc[word.id] = newFlippedValue;
      return acc;
    }, {});
    setFlippedStates(prev => ({ ...prev, ...categoryUpdates }));
  };

  // --- NEW: Handle Card Click (Branching Logic for Selection Mode) ---
  const handleCardClick = (wordId: number) => {
    if (isSelectionMode) {
      setSelectedWordIds(prev => {
        if (prev.includes(wordId)) {
          return prev.filter(id => id !== wordId);
        } else {
          return [...prev, wordId];
        }
      });
    } else {
      setFlippedStates(prev => ({ ...prev, [wordId]: !prev[wordId] }));
    }
  };

  // --- NEW: Toggle Make Set Mode ---
  const handleToggleMakeSet = () => {
    if (isSelectionMode) {
      // We are currently in selection mode and user clicked "Save Set"
      if (selectedWordIds.length === 0) {
        alert("Please select at least one card first.");
        return;
      }
      // Open Save Modal
      setShowSaveModal(true);
    } else {
      // Turn ON selection mode
      setIsSelectionMode(true);
      setIsSpeakingRandomly(false); // Stop any active games
      setTimerIsActive(false);
      // Ensure cards are face up so we can see what we are selecting
      handleFlipAll('up');
    }
  };

  const handleSaveSet = (setName: string) => {
    onSaveSet(setName, selectedWordIds);
    setShowSaveModal(false);
    setIsSelectionMode(false);
    setSelectedWordIds([]);
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  const toggleSpeechSpeed = () => setSpeechSpeed(prev => (prev === 'normal' ? 'slow' : 'normal'));
  const toggleShuffle = () => setIsShuffled(prev => !prev);
  const handleToggleCategory = (catId: string) => setActiveCategories(p => p.includes(catId) ? p.filter(c => c !== catId) : [...p, catId]);
  const handleJumpToCategory = (catId: string) => {
    const firstWordIndex = displayWords.findIndex(word => word.category === catId);
    if (firstWordIndex !== -1) setCurrentIndex(firstWordIndex);
    setIsMenuOpen(false);
  };

  const currentWord = displayWords[currentIndex];

  // ========= START: src/components/TangoPracticeScreen.js - RENDER SECTION WITH BG IMAGE =========
  return (
    <>
      {/* Save Set Modal */}
      <SaveSetModal
        isOpen={showSaveModal}
        selectedCount={selectedWordIds.length}
        onSave={handleSaveSet}
        onCancel={handleCancelSave}
      />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categoriesToDisplay={practiceCategoriesDetails}
        activeCategories={activeCategories}
        onToggleCategory={handleToggleCategory}
        onJumpToCategory={handleJumpToCategory}
      />

      {/* UPDATED: Added inline style for the background image */}
      <div
        className="tango-practice-screen"
        style={{ backgroundImage: `url(/assets/backgrounds/practice_background.jpg)` }}
      >
        <header className="practice-header">
          <div className="header-left">
            <button onClick={onEndPractice} className="practice-nav-button">&lt; Back</button>
            <button onClick={() => setIsMenuOpen(true)} className="practice-nav-button">Menu</button>
            <button
              onClick={handleToggleMakeSet}
              className={`practice-nav-button ${isSelectionMode ? 'send-set-button' : 'make-set-button'}`}
            >
              {isSelectionMode ? 'Save Set 💾' : 'Make Set'}
            </button>
            <button onClick={handleToggleMultiMode} className={`practice-nav-button multi-button ${displayMode === 'multi' ? 'active' : ''}`}>Multi</button>

            {displayMode === 'multi' && !isSelectionMode && (
              <>
                <button onClick={() => handleFlipAll('up')} className="practice-nav-button">Flip ⬆️</button>
                <button onClick={() => handleFlipAll('down')} className="practice-nav-button">Flip ⬇️</button>
              </>
            )}
          </div>

          <div className="header-right">
            {/* Timer moved to second row */}
          </div>
        </header>

        {/* --- NEW: Secondary Control Bar (Shuffle, Speed, Say Word) --- */}
        <div className="practice-control-bar">
          <button onClick={toggleShuffle} className={`practice-nav-button shuffle-button ${isShuffled ? 'active' : ''}`} disabled={isSelectionMode}>Shuffle: {isShuffled ? 'ON' : 'OFF'}</button>
          <button onClick={toggleSpeechSpeed} className="practice-nav-button speed-toggle">Speed: {speechSpeed === 'normal' ? 'Normal' : 'Slow'}</button>
          <button
            onClick={handleSayWord}
            className={`practice-nav-button say-word-button ${isSpeakingRandomly ? 'active' : ''}`}
            disabled={isSelectionMode}
          >
            <img src="/assets/buttons/say_word.png" alt="Say Word" />
          </button>
          {displayMode === 'multi' && (<div className="timer-display" style={{ marginLeft: '10px' }}>{formatTime(elapsedTime)}</div>)}
        </div>

        {displayMode === 'single' ? (
          <div className="card-display-area single-card-view">
            {currentWord ? (
              <div className={`single-card-wrapper ${selectedWordIds.includes(currentWord.id) ? 'selected' : ''}`}>
                <Flashcard
                  wordData={currentWord}
                  isFlipped={!!flippedStates[currentWord.id]}
                  onClick={() => handleCardClick(currentWord.id)}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedWordIds.includes(currentWord.id)}
                  viewMode="single"
                />
                <p className="flashcard-text-external">{currentWord.word}</p>
              </div>
            ) : (<div className="no-words-placeholder"><p>No words to display.</p></div>)}
          </div>
        ) : (
          <div ref={multiViewContainerRef} className="card-display-area multi-card-view" style={{ gridTemplateColumns: dynamicGridStyles.gridTemplateColumns }}>
            {currentCategoryWords.map(word => (
              <div key={word.id} className={`multi-card-wrapper ${selectedWordIds.includes(word.id) ? 'selected' : ''}`}>
                <div style={{ width: dynamicGridStyles.cardWidth, height: dynamicGridStyles.cardHeight }}>
                  <Flashcard
                    wordData={word}
                    isFlipped={!!flippedStates[word.id]}
                    onClick={() => handleCardClick(word.id)}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedWordIds.includes(word.id)}
                    viewMode="multi"
                  />
                </div>
                <DynamicTextLabel
                  text={word.word}
                  className="flashcard-text-external small"
                  containerWidth={dynamicGridStyles.cardWidth}
                  maxLabelHeight={dynamicGridStyles.maxLabelHeight}
                />
              </div>
            ))}
          </div>
        )}

        {displayMode === 'single' && (
          <footer className="practice-footer">
            <button
              onClick={handlePrevious}
              className="practice-arrow-button"
              disabled={displayWords.length === 0}
            >
              <img src="/assets/buttons/previous_card.png" alt="Previous" />
            </button>
            <div className="progress-indicator">
              {displayWords.length > 0 ? `${currentIndex + 1} / ${displayWords.length}` : '0 / 0'}
            </div>
            <button
              onClick={handleNext}
              className="practice-arrow-button"
              disabled={displayWords.length === 0}
            >
              <img src="/assets/buttons/next_card.png" alt="Next" />
            </button>
          </footer>
        )}
      </div>
    </>
  );
}

export default TangoPracticeScreen;
// ========= END: src/components/TangoPracticeScreen.js - RENDER SECTION WITH BG IMAGE =========