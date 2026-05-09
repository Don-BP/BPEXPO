// src/components/CountryPage.jsx

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { countries, GLOBAL_NAV_BUTTONS, GLOBAL_PAGE_BANNERS } from '../data/countries.js';
import GlobalHUD from './GlobalHUD.jsx';
import GeneralInfo from './GeneralInfo';
import Culture from './Culture';
import SchoolLife from './SchoolLife';
import AltPage from './AltPage';
import Quiz from './Quiz';
import { getAssetUrl } from '../utils/assetUtils';
import './CountryPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

function CountryPage() {
  const { countryId } = useParams();
  const { playBackgroundMusic, stopAllSounds, playAnthem, fadeOutAnthem, fadeOutBackgroundMusic, playClickSound } = useAudio();

  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [isAnthemPlaying, setIsAnthemPlaying] = useState(false);
  const country = useMemo(() => countries.find(c => c.id === countryId), [countryId]);
  const [currentBg, setCurrentBg] = useState(country ? getAssetUrl(country.background_img) : '');

  const [areAllRevealed, setAreAllRevealed] = useState(false);

  const handleToggleRevealAll = () => {
    playClickSound();
    setAreAllRevealed(prev => !prev);
    // Force re-render of all components when toggling reveal all
    setActiveSubPage(current => current);
  };

  useEffect(() => {
    if (!activeSubPage) {
      setAreAllRevealed(false);
    }
  }, [activeSubPage]);

  // ================================================================
  //                            THE FIX IS HERE
  // This useEffect is now much simpler. It only runs when the country
  // changes and always sets the main country background image.
  // ================================================================
  useEffect(() => {
    if (country) {
      setCurrentBg(getAssetUrl(country.background_img));
    }
  }, [country]);

  useEffect(() => {
    if (country && country.background_music) {
      playBackgroundMusic(getAssetUrl(country.background_music));
    }
    return () => stopAllSounds();
  }, [country, playBackgroundMusic, stopAllSounds]);

  useEffect(() => {
    if (country && activeSubPage && isAnthemPlaying) {
      fadeOutAnthem(() => {
        setIsAnthemPlaying(false);
        if (country.background_music) {
          playBackgroundMusic(getAssetUrl(country.background_music));
        }
      });
    }
  }, [activeSubPage, country, isAnthemPlaying, playBackgroundMusic, fadeOutAnthem]);

  if (!country) return <div>Country not found!</div>;

  const pageStyles = { '--accent-color': country.accent_color, '--accent-color-secondary': country.accent_color_secondary } as React.CSSProperties;

  const handleAnthemToggle = () => {
    playClickSound();

    if (isAnthemPlaying) {
      setIsAnthemPlaying(false);
      fadeOutAnthem(() => {
        if (country.background_music) {
          playBackgroundMusic(getAssetUrl(country.background_music));
        }
      });
    } else if (country.national_anthem) {
      setIsAnthemPlaying(true);
      fadeOutBackgroundMusic(() => {
        playAnthem(getAssetUrl(country.national_anthem), () => {
          setIsAnthemPlaying(false);
          if (country.background_music) {
            playBackgroundMusic(getAssetUrl(country.background_music));
          }
        });
      });
    }
  };

  const handleNavButtonClick = (subPage: string) => { playClickSound(); if (subPage === 'quiz') setQuizKey(k => k + 1); setActiveSubPage(subPage); };
  const handleBackToCountry = () => { playClickSound(); setActiveSubPage(null); };

  const getSubPageBanner = () => {
    if (!activeSubPage) return null;
    const bannerSrc = GLOBAL_PAGE_BANNERS[activeSubPage as keyof typeof GLOBAL_PAGE_BANNERS];
    return bannerSrc ? getAssetUrl(bannerSrc) : null;
  };

  const renderSubPageContent = () => {
    const subPageProps = { isRevealed: areAllRevealed };

    switch (activeSubPage) {
      case 'general': return <GeneralInfo data={country.general_info} country={country} {...subPageProps} />;
      case 'culture': return <Culture data={country.culture} {...subPageProps} />;
      case 'school': return <SchoolLife data={country.school_life} {...subPageProps} />;
      case 'alt': if ((country as any).alt_info) return <AltPage data={(country as any).alt_info} {...subPageProps} />; return null;
      case 'quiz': return <Quiz key={quizKey} data={country.quiz.questions} onRestart={() => handleNavButtonClick('quiz')} />;
      default: return null;
    }
  };

  const backToCountryButton = { imgSrc: getAssetUrl("images/ui/button-back-to-country.png"), alt: `Back to ${country.name}`, onClick: handleBackToCountry };
  const backToMapButton = { imgSrc: getAssetUrl("images/ui/button-world-map.png"), alt: "Back to World Map", to: '../map' };

  return (
    <motion.div
      className="country-page-container"
      style={{ ...pageStyles, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentBg})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="page-top-header">
        {/* Row 1: Global Layout (Map, Mute, Lang) */}
        <GlobalHUD
          backButtonConfig={[backToMapButton] as any}
          isRevealAllActive={areAllRevealed}
          onToggleRevealAll={null}
        />

        {/* Row 2: Sub-page Controls (Back + Reveal) */}
        {activeSubPage && (
          <div className="subpage-controls">
            <button className="hud-image-button" onClick={handleBackToCountry}>
              <img src={backToCountryButton.imgSrc} alt={backToCountryButton.alt} className="hud-button-img" />
            </button>

            {/* Reveal All Button (not on quiz) */}
            {activeSubPage !== 'quiz' && (
              <button
                className="hud-image-button"
                onClick={handleToggleRevealAll}
              >
                <img
                  src={areAllRevealed ? getAssetUrl("images/ui/button-hide-all.png") : getAssetUrl("images/ui/button-reveal-all.png")}
                  alt={areAllRevealed ? "Hide All" : "Reveal All"}
                  className="hud-button-img"
                />
              </button>
            )}
          </div>
        )}

        {/* Row 3: Page Banner */}
        {activeSubPage && getSubPageBanner() && (<img src={getSubPageBanner()!} alt="" className="header-page-banner" />)}
      </div>

      <div className="main-content-area">
        <AnimatePresence mode="wait">
          {!activeSubPage ? (
            <motion.div key="landing" className="landing-content" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
              <motion.div className="landing-header-group" variants={itemVariants}>
                <div className="header-top-row">
                  <img src={getAssetUrl(country.flag_img)} alt={country.name} className="header-flag" />
                  {country.national_anthem && (<button onClick={handleAnthemToggle} className="anthem-button" aria-label="Play National Anthem">{isAnthemPlaying ? '❚❚' : '►'}</button>)}
                </div>
                <img src={getAssetUrl(country.name_header_img)} alt={country.name} className="header-name-img" />
              </motion.div>
              <motion.nav className="subpage-nav" variants={itemVariants}>
                {GLOBAL_NAV_BUTTONS.filter(button => button.id !== 'alt' || (country as any).alt_info).map(button => (<motion.button key={button.id} className="nav-image-button" onClick={() => handleNavButtonClick(button.targetPage)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><img src={getAssetUrl(button.imgSrc)} alt={button.alt} className="nav-button-img" /></motion.button>))}
              </motion.nav>
            </motion.div>
          ) : (
            <motion.div key={activeSubPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="subpage-content-wrapper">
              {renderSubPageContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CountryPage;
