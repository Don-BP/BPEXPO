// src/components/LiveInfoPopup.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../utils/assetUtils';
import { useAudio } from '../contexts/AudioContext';
import './InfoPopup.css';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function LiveInfoPopup({ data, country, onClose }) {
  const { playClickSound } = useAudio();
  const [liveContent, setLiveContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (data.liveType === 'time') {
          if (!country || !country.timezones || country.timezones.length === 0) {
            throw new Error("Timezone data is missing.");
          }
          const now = new Date();
          const japanHour = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })).getHours();
          const timeData = country.timezones.map(tz => {
            const countryHour = new Date(now.toLocaleString('en-US', { timeZone: tz })).getHours();
            const hourDiff = countryHour - japanHour;
            let diffText = hourDiff >= 0 ? `+${hourDiff}` : `${hourDiff}`;
            if (hourDiff === 0) diffText = "±0";

            return {
              zone: tz.split('/')[1].replace(/_/g, ' '),
              date: now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
              time: now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }),
              diff: `(Japan Time ${diffText} hrs)`,
            };
          });
          setLiveContent({ times: timeData });
        } else if (data.liveType === 'weather') {
          if (!country || !country.coordinates) {
            throw new Error("Coordinate data is missing.");
          }
          if (!OPENWEATHER_API_KEY) throw new Error("OpenWeather API key missing.");
          const { lat, lon } = country.coordinates;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch weather.');
          const weatherData = await response.json();
          setLiveContent({
            city: country.capital,
            temp: Math.round(weatherData.main.temp),
            description: weatherData.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
            temp_max: Math.round(weatherData.main.temp_max),
            temp_min: Math.round(weatherData.main.temp_min),
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [data, country]);

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

  const renderContent = () => {
    if (isLoading) return <p className="live-popup-text">Loading...</p>;
    if (error) return <p className="live-popup-text error">Error: {error}</p>;
    if (!liveContent) return null;

    if (data.liveType === 'time') {
      const isCrowded = liveContent.times.length > 4;
      const gridClassName = `live-popup-time-grid ${isCrowded ? 'is-crowded' : ''}`;
      return (
        <div className={gridClassName}>
          {liveContent.times.map(t => (
            <div key={t.zone}>
              <h3>{t.zone}</h3>
              <p className="time">{t.time}</p>
              <p className="date">{t.date}</p>
              <p className="diff">{t.diff}</p>
            </div>
          ))}
        </div>
      );
    }

    if (data.liveType === 'weather') {
      return (
        <div className="live-popup-weather">
          <h3 className="city-name">{liveContent.city}</h3>
          <div className="weather-data-row">
            <img src={liveContent.icon} alt={liveContent.description} onClick={(e) => handleImageClick(liveContent.icon, e)} style={{ cursor: 'pointer' }}/>
            <div className="weather-details">
              <h2>{liveContent.temp}°C</h2>
              <p className="description">{liveContent.description}</p>
              <p className="high-low">H: {liveContent.temp_max}° / L: {liveContent.temp_min}°</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const isTimePopup = data.liveType === 'time';
  const isCrowded = isTimePopup && liveContent?.times?.length > 4;
  const contentAreaClassName = `live-popup-content-area ${isCrowded ? 'is-crowded' : ''}`;

  return (
    <motion.div className="popup-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="popup-container"
        // THE FIX: Changed from stopPropagation to onClose to make the whole popup dismissible.
        onClick={onClose}
        style={{ backgroundImage: `url(${getAssetUrl(data.popup_img)})` }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
      >
        <div className="popup-content">
          <h1>{data.title}</h1>
          <div className={contentAreaClassName}>
            {renderContent()}
          </div>
        </div>
        {/* THE FIX: The close button has been removed. */}
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
    </motion.div>
  );
}

export default LiveInfoPopup;