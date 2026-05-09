// src/components/Culture.jsx

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import InfoCard from './InfoCard';
import InfoPopup from './InfoPopup';
import './SubPage.css';

function Culture({ data, isRevealed }) {
  const [activePopup, setActivePopup] = useState(null);

  const handleCardClick = (itemData) => {
    if (isRevealed) return;
    setActivePopup(itemData);
  };

  const leftColumnItems = [data.famous_food, data.famous_people, data.jp_famous_in];
  const rightColumnItems = [data.national_sport, data.holidays, data.festivals];

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

export default Culture;