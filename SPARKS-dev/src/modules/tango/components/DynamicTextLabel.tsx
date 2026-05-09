// ========= START: bp-tango-dev/src/components/DynamicTextLabel.js (MODIFIED) =========
import React, { useState, useLayoutEffect, useRef } from 'react';

// Accept maxLabelHeight as a prop
function DynamicTextLabel({ text, className, containerWidth, maxLabelHeight }) {
  const [fontSize, setFontSize] = useState(1.8);
  const [whiteSpace, setWhiteSpace] = useState('nowrap');
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const textElement = textRef.current;
    // Guard against running before props are ready
    if (!textElement || containerWidth === 0 || !maxLabelHeight) return;

    const initialFontSize = 1.8;

    // --- START: MODIFIED 7-LETTER WORD WRAPPING LOGIC ---
    let wrapPreference = 'nowrap'; // Default to a single line

    // Only allow wrapping for multi-word text.
    if (text.includes(' ')) {
      const words = text.split(' ');
      // New Rule: If any word is longer than 6 letters, allow natural wrapping.
      const hasLongWord = words.some(word => word.length > 6);

      if (hasLongWord) {
        wrapPreference = 'normal'; // 'normal' allows text to wrap to the next line.
      }
      // If no word is > 6 letters long, it remains 'nowrap'.
    }
    // For single words, it also remains 'nowrap'.
    setWhiteSpace(wrapPreference);
    // --- END: MODIFIED 7-LETTER WORD WRAPPING LOGIC ---

    const adjustFont = () => {
      let newSize = initialFontSize;

      // --- START: MODIFIED OVERFLOW CHECK ---
      const checkOverflow = (currentSize) => {
        // Temporarily apply styles to measure the element
        textElement.style.fontSize = `${currentSize}rem`;
        textElement.style.whiteSpace = wrapPreference;

        // Condition 1: Does the text overflow its container horizontally?
        const isHorizontallyOverflowing = textElement.scrollWidth > textElement.clientWidth;

        // Condition 2: Does the text overflow its ALLOCATED vertical space?
        // This effectively checks if it's taller than our 2-line limit.
        const isVerticallyOverflowing = textElement.scrollHeight > maxLabelHeight;

        return isHorizontallyOverflowing || isVerticallyOverflowing;
      };
      // --- END: MODIFIED OVERFLOW CHECK ---

      // Reset styles before starting the loop
      textElement.style.fontSize = `${initialFontSize}rem`;

      // If it's overflowing either way, shrink the font size until it fits.
      if (checkOverflow(initialFontSize)) {
        while (checkOverflow(newSize) && newSize > 0.5) {
          newSize -= 0.1;
        }
      }

      setFontSize(newSize);
    };

    // Use requestAnimationFrame to ensure the browser has painted before we measure.
    requestAnimationFrame(adjustFont);

    // Add maxLabelHeight to the dependency array
  }, [text, containerWidth, maxLabelHeight]);

  return (
    <p
      ref={textRef}
      className={className}
      style={{
        fontSize: `${fontSize}rem`,
        whiteSpace: whiteSpace,
        margin: 0,
      }}
    >
      {text}
    </p>
  );
}

export default DynamicTextLabel;
// ========= END: bp-tango-dev/src/components/DynamicTextLabel.js (MODIFIED) =========