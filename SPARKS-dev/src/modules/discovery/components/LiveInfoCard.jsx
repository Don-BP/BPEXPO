// src/components/LiveInfoCard.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { getAssetUrl } from '../utils/assetUtils';
import './InfoCard.css';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function LiveInfoCard({ type, country, apiItem, isRevealed, onButtonClick }) {
  const { playClickSound } = useAudio();
  const [liveContent, setLiveContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dynamicWidth, setDynamicWidth] = useState(750);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    const calculateWidth = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let baseWidth;
      if (screenWidth < 1200) {
        baseWidth = 650;
      } else if (screenWidth < 1600) {
        baseWidth = 750;
      } else if (screenWidth < 2000) {
        baseWidth = 850;
      } else {
        baseWidth = 950;
      }

      if (screenHeight < 700) {
        baseWidth *= 0.8;
      }

      const maxWidth = screenWidth * 0.45;
      const minWidth = 450;

      const newWidth = Math.max(minWidth, Math.min(baseWidth, maxWidth));
      setDynamicWidth(newWidth);
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  useEffect(() => {
    if (!isRevealed) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (type === 'time') {
          if (!country || !country.timezones || country.timezones.length === 0) {
            throw new Error("Timezone data missing.");
          }
          const now = new Date();
          const timeData = country.timezones.slice(0, 3).map(tz => ({
            zone: tz.split('/')[1].replace(/_/g, ' '),
            time: now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
          }));
          setLiveContent({ times: timeData });
        } else if (type === 'weather') {
          if (!country || !country.coordinates) {
            throw new Error("Coordinate data missing.");
          }
          if (!OPENWEATHER_API_KEY) throw new Error("API key missing.");
          const { lat, lon } = country.coordinates;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch weather.');
          const data = await response.json();
          setLiveContent({
            city: country.capital,
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isRevealed, type, country]);

  const handleButtonClick = () => {
    playClickSound();
    onButtonClick(apiItem);
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
  
  const renderSlideOutContent = () => {
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red', fontSize: '1rem' }}>Error: {error}</p>;
    if (!liveContent) return <p>{apiItem.title}</p>;

    if (type === 'time') {
      return <p>{liveContent.times.map(t => `${t.zone}: ${t.time}`).join(' | ')}</p>;
    }
    if (type === 'weather') {
      return <p>{liveContent.city}: {liveContent.temp}°C, {liveContent.description}</p>;
    }
    return null;
  };

  return (
    <div className="info-card-container">
      <button className="info-card-button" onClick={handleButtonClick}>
        <img src={getAssetUrl(apiItem.button_img)} alt={apiItem.title} className="card-icon-image" />
      </button>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            className="info-card-content-wrapper"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: dynamicWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="info-card-content">
              {renderSlideOutContent()}
              <img
                src={getAssetUrl(apiItem.content_img)}
                alt=""
                className="content-spill-image"
                onClick={(e) => handleImageClick(getAssetUrl(apiItem.content_img), e)}
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

export default LiveInfoCard;