// ========= START: src/components/Flashcard.js - DYNAMIC CLASS FOR SPACING =========
import React, { useRef, useLayoutEffect } from 'react';

// --- Helper Component: Auto-Scaling Text ---
const ScalableText = ({ text, className, maxFontSize, color, fontWeight }: { text: string; className: string; maxFontSize: number; color: string; fontWeight: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const adjustFontSize = () => {
      let currentSize = maxFontSize;
      textEl.style.fontSize = `${currentSize}rem`;
      textEl.style.lineHeight = '1.0';

      while (
        (textEl.scrollWidth > container.clientWidth) &&
        currentSize > 0.3
      ) {
        currentSize -= 0.1;
        textEl.style.fontSize = `${currentSize}rem`;
      }
    };

    window.requestAnimationFrame(adjustFontSize);

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(adjustFontSize);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [text, maxFontSize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        textAlign: 'center',
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontWeight: fontWeight,
        margin: 0,
        padding: 0,
        minHeight: 0,
      }}
    >
      <span ref={textRef} style={{ display: 'inline-block' }}>{text}</span>
    </div>
  );
};

function Flashcard({ wordData, isFlipped, onClick, isSelectionMode, isSelected, viewMode = 'single' }) {
  if (!wordData) {
    return <div className="flashcard-container placeholder">Loading card...</div>;
  }

  const isMulti = viewMode === 'multi';

  // Font Size Configuration
  const fontConfig = {
    katakana: isMulti ? 1.2 : 5.0,
    hiragana: isMulti ? 1.2 : 5.0,
    kanji: isMulti ? 1.2 : 7.0
  };

  return (
    <div
      className={`flashcard-scene ${isSelectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {isSelectionMode && (
        <div className="flashcard-selection-overlay">
          <span className="checkmark-icon">✓</span>
        </div>
      )}

      <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-face flashcard-front">
          <img
            src={wordData.image}
            alt={wordData.word}
            className="flashcard-image"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const placeholder = target.nextSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
          <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#90a4ae' }}>
            <span style={{ fontSize: '3rem' }}>🖼️</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{wordData.word}</span>
          </div>
        </div>

        <div className="flashcard-face flashcard-back">
          <img
            src="/assets/backgrounds/card_back.png"
            alt="Card Back Pattern"
            className="card-back-bg"
          />

          {/* UPDATED: Added `content-${viewMode}` to allow specific CSS for single vs multi */}
          <div className={`flashcard-back-content content-${viewMode}`}>
            <ScalableText
              text={wordData.katakana}
              className="jp-row katakana"
              maxFontSize={fontConfig.katakana}
              color="#00796b"
              fontWeight="bold"
            />
            <ScalableText
              text={wordData.hiragana}
              className="jp-row hiragana"
              maxFontSize={fontConfig.hiragana}
              color="#455a64"
              fontWeight="normal"
            />
            <ScalableText
              text={wordData.kanji}
              className="jp-row kanji"
              maxFontSize={fontConfig.kanji}
              color="#212121"
              fontWeight="bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
// ========= END: src/components/Flashcard.js - DYNAMIC CLASS FOR SPACING =========