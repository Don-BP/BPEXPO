// src/components/GlobalHUD.jsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { getAssetUrl } from '../utils/assetUtils';
import './GlobalHUD.css';

function GlobalHUD({ backButtonConfig = [], isRevealAllActive, onToggleRevealAll }) {
  const { isMuted, toggleMute, playClickSound } = useAudio();

  const handleMuteToggle = () => { playClickSound(); toggleMute(); };
  const handleLanguageToggle = () => { playClickSound(); };
  const handleButtonClick = (onClickFunc) => { playClickSound(); if (onClickFunc) onClickFunc(); };

  return (
    <div className="global-hud">
      {backButtonConfig.map((btn, index) => (
        <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {btn.to ? (
            <Link to={btn.to} onClick={playClickSound}>
              <img src={btn.imgSrc} alt={btn.alt} className="hud-button-img" />
            </Link>
          ) : (
            <button onClick={() => handleButtonClick(btn.onClick)} className="hud-image-button">
              <img src={btn.imgSrc} alt={btn.alt} className="hud-button-img" />
            </button>
          )}
        </motion.div>
      ))}

      {onToggleRevealAll && (
        <motion.button
          className="hud-image-button"
          onClick={onToggleRevealAll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={isRevealAllActive ? getAssetUrl("images/ui/button-hide-all.png") : getAssetUrl("images/ui/button-reveal-all.png")}
            alt={isRevealAllActive ? "Hide All" : "Reveal All"}
            className="hud-button-img"
          />
        </motion.button>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleMuteToggle} className="hud-image-button">
        <img
          src={isMuted ? getAssetUrl("images/ui/button-sound-off.png") : getAssetUrl("images/ui/button-sound-on.png")}
          alt="Mute/Unmute"
          className="hud-button-img"
        />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLanguageToggle} className="hud-image-button">
        <img src={getAssetUrl("images/ui/button-language-toggle.png")} alt="Toggle Language" className="hud-button-img" />
      </motion.button>
    </div>
  );
}

export default GlobalHUD;