// src/FlashcardViewer.tsx

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Shuffle, Repeat, Image as ImageIcon, RotateCcw } from 'lucide-react';
import vocabulary, { VocabItem } from './data/vocabulary';

// Helper: Normalize text for looser matching
const normalize = (text: string) => text.toLowerCase().replace(/[\s-_]/g, '');

export const FlashcardViewer = ({
  words,
  onClose
}: {
  words: string[];
  onClose: () => void
}) => {
  const [deck, setDeck] = useState<(VocabItem | { word: string })[]>([]);
  const [current, setCurrent] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const enriched = words.map(w => {
      const cleanInput = normalize(w);
      // 1. Exact Match
      let found = vocabulary.find(v => v.word.toLowerCase() === w.toLowerCase());
      // 2. Fuzzy Match
      if (!found) found = vocabulary.find(v => normalize(v.word) === cleanInput);
      // 3. Singular Match
      if (!found && cleanInput.endsWith('s')) {
        const singular = cleanInput.slice(0, -1);
        found = vocabulary.find(v => normalize(v.word) === singular);
      }
      return found || { word: w };
    });
    setDeck(enriched);

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [words]);

  const handleNext = () => {
    if (current < deck.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrent(c => c + 1), 150);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrent(c => c - 1), 150);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrent(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') setIsFlipped(prev => !prev);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, deck]);

  if (deck.length === 0) return null;

  const card = deck[current];
  const hasImage = 'image' in card;

  // -- JAPANESE TEXT LOGIC --
  let mainJapanese = "";
  let subJapanese = "";
  let englishPronunciation = "";

  if (hasImage) {
    const vCard = card as VocabItem;
    if (vCard.kanji) {
      mainJapanese = vCard.kanji;
      subJapanese = vCard.hiragana;
    } else {
      mainJapanese = vCard.hiragana;
    }
    englishPronunciation = vCard.katakana;
  }

  return (
    // ROOT CONTAINER: Fixed full screen overlay
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col overflow-hidden">

      {/* --- HEADER --- */}
      <div className="flex-none h-16 flex justify-between items-center px-4 bg-slate-800 border-b border-slate-700 text-white z-10">
        {/* ... Header content remains the same ... */}
        {/* (If you need the full file again, tell me, but just updating the wrapper div class fixes the width issue) */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-lg">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold tracking-wide text-sm md:text-base">FLASHCARDS</h3>
            <p className="text-xs text-slate-400">{current + 1} of {deck.length} words</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShuffle} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white" title="Shuffle">
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={() => { setCurrent(0); setIsFlipped(false); }} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white" title="Reset">
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- MIDDLE: CARD AREA --- */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 min-h-0 bg-slate-900/50 perspective-1000">

        {/* Navigation Arrow Left */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={current === 0}
          className="hidden md:flex absolute left-4 lg:left-8 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all z-20 backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* THE CARD CONTAINER - Scaled to fit */}
        <div
          className="relative w-full max-w-3xl h-full max-h-[65vh] cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

            {/* FRONT */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-3xl flex flex-col items-center justify-center p-6 shadow-2xl border-4 border-slate-800 overflow-hidden">
              {hasImage ? (
                <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                  <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                    <img
                      src={(card as VocabItem).image}
                      alt={card.word}
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight text-center">{card.word}</h2>
                </div>
              ) : (
                <h2 className="text-5xl md:text-7xl font-bold text-slate-800 text-center break-words max-w-full">{card.word}</h2>
              )}
              <div className="absolute bottom-4 text-slate-300 flex items-center gap-1 text-xs uppercase font-bold animate-pulse">
                <Repeat className="w-3 h-3" /> Tap to Flip
              </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-teal-50 rounded-3xl flex flex-col items-center justify-center p-6 shadow-2xl border-4 border-teal-500">
              {hasImage ? (
                <div className="text-center space-y-8">
                  <div>
                    <p className="text-teal-600 text-xs font-bold uppercase tracking-wider mb-2">English</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800">{card.word}</h2>
                  </div>
                  <div className="w-12 h-1 bg-teal-200 mx-auto rounded-full"></div>
                  <div>
                    <p className="text-teal-600 text-xs font-bold uppercase tracking-wider mb-2">Japanese</p>
                    <h3 className="text-5xl md:text-6xl font-bold text-slate-800 mb-3">{mainJapanese}</h3>
                    {subJapanese && subJapanese !== mainJapanese && (
                      <p className="text-2xl text-slate-600 font-medium">{subJapanese}</p>
                    )}
                    <p className="text-xl text-teal-600 mt-2 font-bold">{englishPronunciation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <h2 className="text-4xl font-bold text-slate-800 mb-4">{card.word}</h2>
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-slate-400 italic">No translation data available.</div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={current === deck.length - 1}
          className="hidden md:flex absolute right-4 lg:right-8 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all z-20 backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* --- FOOTER: WORD LIST --- */}
      <div className="flex-none h-24 bg-slate-800 border-t border-slate-700 flex items-center">
        <div className="w-full px-4 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="flex gap-3 mx-auto pb-2 min-w-min">
            {deck.map((item, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setIsFlipped(false); }}
                className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${current === i
                    ? "bg-teal-500 text-white border-teal-400 shadow-lg scale-105"
                    : "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600 hover:text-slate-200"
                  }`}
              >
                {item.word}
              </button>
            ))}
            <div className="w-4 flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};