// src/components/SchoolLife.jsx

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import InfoCard from './InfoCard';
import InfoPopup from './InfoPopup';
import './SubPage.css';

function SchoolLife({ data, isRevealed }) {
  const [activePopup, setActivePopup] = useState(null);

  const handleCardClick = (itemData) => {
    if (isRevealed) return;
    setActivePopup(itemData);
  };

  const leftColumnItems = [data.school_routine, data.subjects, data.common_games];
  const rightColumnItems = [data.school_holidays, data.school_lunch, data.after_school];

  return (
    <div className="subpage-layout">
      <div className="info-columns-container">
        <div className="info-column left">
          {leftColumnItems.map((item) => (
            item && <InfoCard key={item.title} data={item} isRevealed={isRevealed} onButtonClick={handleCardClick} />
          ))}
        </div>
        <div className="info-column right">
          {rightColumnItems.map((item) => (
            item && <InfoCard key={item.title} data={item} isRevealed={isRevealed} onButtonClick={handleCardClick} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activePopup && <InfoPopup data={activePopup} onClose={() => setActivePopup(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default SchoolLife;