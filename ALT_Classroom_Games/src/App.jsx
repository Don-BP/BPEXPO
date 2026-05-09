import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

// Games
import Tornado from './games/Tornado';
import WordDetect from './games/WordDetect';
import SpinAndSpeak from './games/SpinAndSpeak';
import Jeopardy from './games/Jeopardy';
import Karuta from './games/Karuta';
import Bingo from './games/Bingo';
import VocabularyPop from './games/VocabularyPop';
import HiddenPicture from './games/HiddenPicture';
import MemoryMatch from './games/MemoryMatch';
import Hangman from './games/Hangman';
import WordSearch from './games/WordSearch';
import SentenceScramble from './games/SentenceScramble';
import BeatChant from './games/BeatChant';
import SnakesAndLadders from './games/SnakesAndLadders';
import TypingDead from './games/TypingDead';

import DesignShowcase from './pages/DesignShowcase';
import { ThemeProvider } from './context/ThemeContext';
import { useState, useEffect } from 'react';
import './monetization-adapter.js'; // Ensure adapter loads
import GameLockOverlay from './components/GameLockOverlay';

// Placeholder for game routes - v2
const GamePlaceholder = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Game Coming Soon!</h1></div>;

const FREE_GAMES = ['bingo', 'snakes-ladders', 'karuta', 'memory-match', 'hangman'];

function App() {
  const [monetization, setMonetization] = useState(() => {
    // Initial state if available immediately
    return window.monetization || null;
  });

  useEffect(() => {
    const handleUpdate = (e) => setMonetization({ ...e.detail });

    window.addEventListener('monetizationReady', handleUpdate);
    window.addEventListener('monetizationUpdate', handleUpdate);

    // Check if available after mount (race condition fix)
    if (window.monetization) {
      setMonetization({ ...window.monetization });
    }

    return () => {
      window.removeEventListener('monetizationReady', handleUpdate);
      window.removeEventListener('monetizationUpdate', handleUpdate);
    };
  }, []);

  // Higher-Order Component for Gated Games
  const GatedGame = ({ id, name, children }) => {
    // If no monetization (standalone), always allow
    if (!monetization) return children;

    // If Free Game, always allow
    if (FREE_GAMES.includes(id)) return children;

    // Check if Pro or Unlocked
    if (monetization.isPro || monetization.isUnlocked(id)) {
      return children;
    }

    // Locked State
    return (
      <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden">
        {/* Show blurred background or placeholder? For now just the overlay */}
        <div className="absolute inset-0 bg-slate-200 blur-sm"></div>
        <GameLockOverlay
          gameName={name}
          onUnlock={() => monetization.requestUnlock(id, name)}
        />
      </div>
    );
  };

  // We need to apply gating at the ROUTE level or Layout level.
  // Ideally, valid links shouldn't even work if locked, but the requirement was "Non-destructive"
  // So we gate the CONTENT of the route.

  // NOTE: This approach gates the game *page*. 
  // Ideally we also show locks on the Home menu. 
  // Detailed menu updates would require modifying Home.jsx.
  // For now, let's wrap the game routes.

  return (
    <HashRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/design-system" element={<DesignShowcase />} />
          <Route path="/" element={<Layout monetization={monetization} />}>
            <Route index element={<Home monetization={monetization} />} />

            {/* Gated Games */}
            <Route path="game/tornado" element={<GatedGame id="tornado" name="Tornado"><Tornado /></GatedGame>} />
            <Route path="game/word-detect" element={<GatedGame id="word-detect" name="Word Detect"><WordDetect /></GatedGame>} />
            <Route path="game/wheel" element={<GatedGame id="wheel" name="Spin & Speak"><SpinAndSpeak /></GatedGame>} />
            <Route path="game/jeopardy" element={<GatedGame id="jeopardy" name="Jeopardy"><Jeopardy /></GatedGame>} />
            <Route path="game/vocab-pop" element={<GatedGame id="vocab-pop" name="Vocab Pop"><VocabularyPop /></GatedGame>} />
            <Route path="game/hidden-picture" element={<GatedGame id="hidden-picture" name="Hidden Picture"><HiddenPicture /></GatedGame>} />
            <Route path="game/word-search" element={<GatedGame id="word-search" name="Word Search"><WordSearch /></GatedGame>} />
            <Route path="game/sentence-scramble" element={<GatedGame id="sentence-scramble" name="Sentence Scramble"><SentenceScramble /></GatedGame>} />
            <Route path="game/beat-chant" element={<GatedGame id="beat-chant" name="Beat Chant"><BeatChant /></GatedGame>} />
            <Route path="game/typing-dead" element={<GatedGame id="typing-dead" name="Typing Dead"><TypingDead /></GatedGame>} />

            {/* Free Games (Ungated) */}
            <Route path="game/bingo" element={<Bingo />} />
            <Route path="game/karuta" element={<Karuta />} />
            <Route path="game/memory-match" element={<MemoryMatch />} />
            <Route path="game/hangman" element={<Hangman />} />
            <Route path="game/snakes-ladders" element={<SnakesAndLadders />} />

            <Route path="game/:id" element={<GamePlaceholder />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
