// src/components/InfoCard.jsx

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { getAssetUrl } from '../utils/assetUtils';

function InfoCard({ data, isRevealed, onButtonClick }) {
  const { playClickSound } = useAudio();
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const [dynamicWidth, setDynamicWidth] = useState(750);
  const [isRevealedState, setIsRevealedState] = useState(isRevealed);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    setIsRevealedState(isRevealed);
  }, [isRevealed]);

  useEffect(() => {
    const calculateWidth = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let baseWidth;
      if (screenWidth < 1200) { baseWidth = 650; }
      else if (screenWidth < 1600) { baseWidth = 750; }
      else if (screenWidth < 2000) { baseWidth = 850; }
      else { baseWidth = 950; }

      if (screenHeight < 700) { baseWidth *= 0.8; }
      
      const maxWidth = screenWidth * 0.45;
      const minWidth = 450;
      
      const newWidth = Math.max(minWidth, Math.min(baseWidth, maxWidth));
      setDynamicWidth(newWidth);
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  // A more robust function to find the optimal font size.
  const fitText = () => {
    const textElement = textRef.current;
    if (!textElement) return;

    // Use a binary search approach for efficiency and accuracy.
    let minFont = 10; // Minimum font size
    let maxFont = 100; // Maximum possible font size (a safe upper bound)
    let bestSize = minFont;

    // Run a few iterations to find the best fit.
    for (let i = 0; i < 7; i++) {
        let midFont = (minFont + maxFont) / 2;
        textElement.style.fontSize = `${midFont}px`;

        // Check for both vertical and horizontal overflow.
        if (textElement.scrollHeight <= textElement.clientHeight && textElement.scrollWidth <= textElement.clientWidth) {
            // It fits, so this is a potential best size. Try a larger font.
            bestSize = midFont;
            minFont = midFont;
        } else {
            // It overflows. Try a smaller font.
            maxFont = midFont;
        }
    }
    // Apply the best size found that didn't overflow.
    textElement.style.fontSize = `${bestSize}px`;
    // Make the text visible after calculation to prevent flicker.
    textElement.style.visibility = 'visible';
  };
  
  // This layout effect runs on resize or content change to refit the text.
  useLayoutEffect(() => {
    if (isRevealedState) {
        // Hide text initially to prevent seeing the adjustment.
        if(textRef.current) textRef.current.style.visibility = 'hidden';
        fitText();
    }
  }, [isRevealedState, dynamicWidth, data.content]);

  const handleButtonClick = () => {
    playClickSound();
    onButtonClick(data);
  };

  const handleImageClick = (imageSrc, event) => {
    event.stopPropagation();
    playClickSound();
    setExpandedImage(imageSrc);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedImage && !event.target.closest('.expanded-image-container')) {
        handleCloseExpandedImage();
      }
    };
    if (expandedImage) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [expandedImage]);

  return (
    <div className="info-card-container">
      <button className="info-card-button" onClick={handleButtonClick}>
        <img src={getAssetUrl(data.button_img)} alt={data.title} className="card-icon-image" />
      </button>

      <AnimatePresence>
        {isRevealedState && (
          <motion.div
            ref={containerRef}
            className="info-card-content-wrapper"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: dynamicWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            // This ensures the text size is calculated AFTER the slide-out animation finishes.
            onAnimationComplete={fitText}
          >
            <div className="info-card-content">
              <p ref={textRef}>{data.content}</p>
              <img
                src={getAssetUrl(data.content_img)}
                alt=""
                className="content-spill-image"
                onClick={(e) => handleImageClick(getAssetUrl(data.content_img), e)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            className="expanded-image-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseExpandedImage}
          >
            <motion.div
              className="expanded-image-container"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expandedImage}
                alt="Expanded view"
                className="expanded-image"
                onClick={handleCloseExpandedImage}
                style={{ cursor: 'pointer' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InfoCard;