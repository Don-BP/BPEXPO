// src/components/InfoPopup.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../utils/assetUtils';
import { useAudio } from '../contexts/AudioContext';
import './InfoPopup.css';

function InfoPopup({ data, onClose }) {
  const { playClickSound } = useAudio();
  const [expandedImage, setExpandedImage] = useState(null);

  if (!data) return null;

  // This stopPropagation is now only used for the expanded image, which is correct.
  const stopPropagation = (e) => e.stopPropagation();

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
    <motion.div
      className="popup-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="popup-wrapper"
        // THE FIX: Changed from stopPropagation to onClose. Now clicking the popup content
        // will also close it, just like clicking the overlay.
        onClick={onClose}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <h1 className="popup-title">{data.title}</h1>
        <div
          className="popup-container"
          style={{ backgroundImage: `url(${getAssetUrl(data.popup_img)})` }}
        >
          <div className="popup-content-layout-wrapper">
            <div className="popup-content">
              <p>{data.content}</p>
            </div>
            
            <img
              src={getAssetUrl(data.content_img)}
              alt=""
              className="popup-spill-image"
              onClick={(e) => handleImageClick(getAssetUrl(data.content_img), e)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* THE FIX: The close button has been removed. */}
        </div>
      </motion.div>

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
              onClick={stopPropagation} // This correctly prevents the image from closing when clicked on.
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
    </motion.div>
  );
}

export default InfoPopup;