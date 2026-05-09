// src/contexts/AudioContext.jsx

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getAssetUrl } from '../utils/assetUtils';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  // THE FIX: Create audio elements once and store them in refs.
  // This avoids creating new instances, which is crucial for iOS compatibility.
  const backgroundMusicRef = useRef(new Audio());
  const anthemMusicRef = useRef(new Audio());
  const clickSoundRef = useRef(new Audio(getAssetUrl('assets/audio/sfx_click.mp3')));

  // THE FIX: A dedicated effect to handle muting/unmuting.
  // This is much cleaner and avoids side effects in the toggle function.
  useEffect(() => {
    backgroundMusicRef.current.muted = isMuted;
    anthemMusicRef.current.muted = isMuted;
    clickSoundRef.current.muted = isMuted;
  }, [isMuted]);

  const stopAllSounds = useCallback(() => {
    if (backgroundMusicRef.current && !backgroundMusicRef.current.paused) {
      backgroundMusicRef.current.pause();
    }
    if (anthemMusicRef.current && !anthemMusicRef.current.paused) {
      anthemMusicRef.current.pause();
    }
  }, []);

  const fadeOut = useCallback((audioElement, onComplete) => {
    if (!audioElement || audioElement.paused) {
      if (onComplete) onComplete();
      return;
    }
    let volume = isMuted ? 0 : audioElement.volume; // Start fade from current volume
    const fadeInterval = setInterval(() => {
      volume = Math.max(0, volume - 0.1);
      audioElement.volume = volume;
      if (volume === 0) {
        clearInterval(fadeInterval);
        audioElement.pause();
        if (onComplete) onComplete();
      }
    }, 50);
  }, [isMuted]);

  const playBackgroundMusic = useCallback((src) => {
    stopAllSounds();
    const audio = backgroundMusicRef.current;
    if (audio.src !== src) {
      audio.src = src;
    }
    audio.loop = true;
    audio.volume = 0.5; // Set base volume
    audio.play().catch(e => {
      if (e.name !== 'AbortError') {
        console.error("Background music play error:", e);
      }
    });
  }, [stopAllSounds]);

  const playAnthem = useCallback((src, onEnded) => {
    stopAllSounds();
    const audio = anthemMusicRef.current;
    if (audio.src !== src) {
      audio.src = src;
    }
    audio.volume = 0.7; // Set base volume
    // THE FIX: We must remove the old listener before adding a new one to prevent memory leaks.
    const handleEnded = () => {
      if (onEnded) onEnded();
      audio.removeEventListener('ended', handleEnded);
    };
    audio.addEventListener('ended', handleEnded);
    audio.play().catch(e => {
      if (e.name !== 'AbortError') {
        console.error("Anthem play error:", e);
      }
    });
  }, [stopAllSounds]);

  const fadeOutAnthem = useCallback((onComplete) => {
    fadeOut(anthemMusicRef.current, onComplete);
  }, [fadeOut]);

  const fadeOutBackgroundMusic = useCallback((onComplete) => {
    fadeOut(backgroundMusicRef.current, onComplete);
  }, [fadeOut]);

  const playClickSound = useCallback(() => {
    const audio = clickSoundRef.current;
    audio.currentTime = 0;
    audio.volume = 1.0;
    audio.play().catch(e => {
      if (e.name !== 'AbortError') {
        console.error("Click sound play error:", e);
      }
    });
  }, []);

  // THE FIX: The toggle function now *only* changes the state.
  // The useEffect hook above handles the actual muting logic.
  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => !prevMuted);
  }, []);

  const value = {
    isMuted,
    toggleMute,
    playBackgroundMusic,
    playAnthem,
    fadeOutAnthem,
    fadeOutBackgroundMusic,
    playClickSound,
    stopAllSounds
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};