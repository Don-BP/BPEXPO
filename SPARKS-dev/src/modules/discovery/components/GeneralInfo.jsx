// src/components/GeneralInfo.jsx

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import InfoCard from './InfoCard';
import InfoPopup from './InfoPopup';
import LiveInfoCard from './LiveInfoCard';
import LiveInfoPopup from './LiveInfoPopup';
import './SubPage.css';

function GeneralInfo({ data, isRevealed, country }) {
  const [activePopup, setActivePopup] = useState(null);

  const handleCardClick = (itemData) => {
    setActivePopup(itemData);
  };
  
  // THE FIX: Get the popup image path dynamically from the country's data.
  // We use data.languages.popup_img as a reliable source for this country's popup background.
  // We also provide a generic fallback just in case.
  const countryPopupImg = data?.languages?.popup_img || 'images/countries/popups/default-popup-bg.png';

  const apiItems = {
    time_date: {
      type: 'live',
      liveType: 'time',
      title: 'Current Time & Date',
      button_img: 'images/ui/buttons/general-time-btn.png',
      popup_img: countryPopupImg, // Use the dynamic path
      content_img: "images/countries/general-info/content-images/general-time-img.png" // This is just for the slide-out, which is fine
    },
    weather: {
      type: 'live',
      liveType: 'weather',
      title: 'Current Weather',
      button_img: 'images/ui/buttons/general-weather-btn.png',
      popup_img: countryPopupImg, // Use the dynamic path
      content_img: "images/countries/general-info/content-images/general-weather-img.png" // This is just for the slide-out
    },
  };

  const leftColumnItems = [data.languages, apiItems.time_date, apiItems.weather];
  const rightColumnItems = [data.flight_time, data.currency, data.say_hello];

  return (
    <div className="subpage-layout">
      <div className="info-columns-container">
        <div className="info-column left">
          {leftColumnItems.map((item) => {
            if (!item) return null;
            if (item.type === 'live') {
              return <LiveInfoCard key={item.title} type={item.liveType} country={country} apiItem={item} isRevealed={isRevealed} onButtonClick={handleCardClick} />;
            }
            return <InfoCard key={item.title} data={item} isRevealed={isRevealed} onButtonClick={handleCardClick} />;
          })}
        </div>
        <div className="info-column right">
          {rightColumnItems.map((item) => (
            item && <InfoCard key={item.title} data={item} isRevealed={isRevealed} onButtonClick={handleCardClick} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activePopup && (
          activePopup.type === 'live'
            ? <LiveInfoPopup data={activePopup} country={country} onClose={() => setActivePopup(null)} />
            : <InfoPopup data={activePopup} onClose={() => setActivePopup(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default GeneralInfo;