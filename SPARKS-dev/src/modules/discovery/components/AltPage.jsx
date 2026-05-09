// src/components/AltPage.jsx

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import InfoCard from './InfoCard';
import InfoPopup from './InfoPopup';
import './SubPage.css';

function AltPage({ data, isRevealed }) {
  const [activePopup, setActivePopup] = useState(null);

  const handleCardClick = (itemData) => {
    if (isRevealed) return;
    setActivePopup(itemData);
  };

  const altDetails = data.details;
  const leftColumnItems = [altDetails.skills_hobbies, altDetails.likes, altDetails.dislikes];
  const rightColumnItems = [altDetails.birth_month, altDetails.fav_jp_food, altDetails.love_jp];

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

export default AltPage;