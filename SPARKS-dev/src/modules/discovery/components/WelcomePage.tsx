// src/components/WelcomePage.jsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { getAssetUrl } from '../utils/assetUtils';
import './WelcomePage.css';

function WelcomePage() {
  const { playClickSound } = useAudio();

  const handleExploreClick = () => {
    playClickSound();
  };

  return (
    <motion.div
      className="welcome-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ========== MODIFIED: ADDED HOVER EFFECTS & CORRECTED LINK ========== */}
      <motion.a
        href="https://bplabo.jp" // This is the absolute link to your main hub
        className="labo-home-button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.05 }} // Added hover effect
        whileTap={{ scale: 0.95 }}   // Added tap effect
      >
        ↩️ LABO
      </motion.a>
      {/* ======================= END MODIFICATION ======================= */}

      <img src={getAssetUrl('images/welcome-bg.jpg')} alt="Background" className="background-image-layer" />
      {/* <img src={getAssetUrl('images/brain-power-logo.png')} alt="Brain Power Logo" className="logo" /> */}
      <h1 className="text-4xl font-bold text-orange-500 mb-4">SPARKS</h1>
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        BP EXPO: Global Discovery
      </motion.h1>
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Your journey to understand the world starts here!
      </motion.p>

      <Link to="map" onClick={handleExploreClick} style={{ marginTop: '20px' }}>
        <motion.img
          src={getAssetUrl('images/ui/button-explore-world.png')}
          alt="Explore the World"
          className="explore-button-img"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
      </Link>
    </motion.div>
  );
}

export default WelcomePage;