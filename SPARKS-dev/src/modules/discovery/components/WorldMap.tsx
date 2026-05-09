// src/components/WorldMap.tsx

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, animate, useTransform, useMotionValueEvent, AnimatePresence, MotionValue } from 'framer-motion';
import { countries } from '../data/countries.js';
import { mapCoordinates } from '../data/mapCoordinates.js';
import GlobalHUD from './GlobalHUD.jsx';
import { getAssetUrl } from '../utils/assetUtils';
import './WorldMap.css';
import { useWallet } from '../../../hooks/useWallet';
import AdModal from '../../../components/monetization/AdModal';

const MAP_WIDTH = 7000;
const MAP_HEIGHT = 3815;

const STARTER_COUNTRIES = ['jp', 'us', 'au', 'ca', 'gb'];

interface Country {
  id: string;
  name: string;
  flag_img: string;
  coords: { x: number; y: number };
  [key: string]: any;
}

interface FlagProps {
  country: Country;
  mapScaleMotionValue: MotionValue<number>;
  onSelectCountry: (country: Country) => void;
}

// Flag sub-component
function Flag({ country, mapScaleMotionValue, onSelectCountry }: FlagProps) {
  const hoverScale = useMotionValue(1);
  const finalScale = useTransform(
    [mapScaleMotionValue, hoverScale],
    ([mapScale, individualScale]) => (1 / (mapScale as number)) * (individualScale as number)
  );

  const handleHoverStart = () => { animate(hoverScale, 1.2, { duration: 0.2, ease: "easeOut" }); };
  const handleHoverEnd = () => { animate(hoverScale, 1, { duration: 0.2, ease: "easeOut" }); };

  return (
    <motion.div
      className="flag-link"
      style={{
        top: `${(country.coords.y / MAP_HEIGHT) * 100}%`,
        left: `${(country.coords.x / MAP_WIDTH) * 100}%`,
        scale: finalScale,
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onTap={() => onSelectCountry(country)}
      whileHover={{ zIndex: 101 }}
    >
      <img src={getAssetUrl(country.flag_img)} alt={`${country.name} Flag`} className="flag-button-img" />
      <div className="country-name-label">{country.name}</div>
    </motion.div>
  );
}

function WorldMap() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Hooks & State ---
  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const [adTargetCountry, setAdTargetCountry] = useState<Country | null>(null);

  // Motion Values for Map
  const scaleMotionValue = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);

  // React State for constraints & logic
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showTitle, setShowTitle] = useState(true);

  const minScale = 1;
  const countriesOnMap = (countries as unknown) as Country[]; // Cast imported JS data

  // Sync motion value to state for memoized constraints
  useMotionValueEvent(scaleMotionValue, "change", (latest) => {
    setScale(latest as number);
  });

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Title fade out on interaction
  useEffect(() => {
    const unsubscribe = x.on("change", () => {
      if (showTitle) setShowTitle(false);
    });
    return () => unsubscribe();
  }, [x, showTitle]);


  // Separated animation logic for reuse
  const playEntryAnimation = (country: Country) => {
    // These values MUST match the margin percentages in your 'WorldMap.css' 
    const FLAG_CSS_OFFSET_X_PERCENT = -2.0;
    const FLAG_CSS_OFFSET_Y_PERCENT = -6.0;

    const zoomInScale = 8;

    const cssMarginX = MAP_WIDTH * (FLAG_CSS_OFFSET_X_PERCENT / 100);
    const cssMarginY = MAP_WIDTH * (FLAG_CSS_OFFSET_Y_PERCENT / 100);
    const flagVisualX = country.coords.x + cssMarginX;
    const flagVisualY = country.coords.y + cssMarginY;
    const flagOffsetX = flagVisualX - (MAP_WIDTH / 2);
    const flagOffsetY = flagVisualY - (MAP_HEIGHT / 2);
    const finalX = -flagOffsetX * zoomInScale;
    const finalY = -flagOffsetY * zoomInScale;

    const transition = {
      duration: 4,
      ease: [0.4, 0, 0.2, 1] as any
    };

    const opacityAnimation = animate(opacity, 0, {
      duration: 0.9,
      delay: 0.6,
      ease: 'easeOut'
    });

    // --- Animation Execution ---
    animate(scaleMotionValue, zoomInScale as any, transition as any);
    animate(x, finalX as any, transition as any);
    animate(y, finalY as any, transition as any);

    opacityAnimation.then(() => {
      navigate(`../country/${country.id}`);
    });
  };

  const handleCountrySelect = (country: Country) => {
    const featureId = `expo_${country.id}`;

    // 1. Check if Pro or Starter Country
    if (isPro || STARTER_COUNTRIES.includes(country.id)) {
      playEntryAnimation(country);
      return;
    }

    // 2. Check if already unlocked via Ad
    if (isUnlocked(featureId)) {
      playEntryAnimation(country);
      return;
    }

    // 3. Locked -> Show Ad
    setAdTargetCountry(country);
  };

  const handleAdComplete = () => {
    if (adTargetCountry) {
      unlockFeature(`expo_${adTargetCountry.id}`);
      playEntryAnimation(adTargetCountry);
      setAdTargetCountry(null);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = 0.3;
    const oldScale = scaleMotionValue.get();
    const newScale = direction === 'in' ? Math.min(oldScale + zoomFactor, 3) : Math.max(oldScale - zoomFactor, minScale);

    if (newScale === oldScale) return;

    const scaleRatio = newScale / oldScale;
    const idealX = x.get() * scaleRatio;
    const idealY = y.get() * scaleRatio;

    const { width, height } = containerSize;
    const newScaledMapWidth = MAP_WIDTH * newScale;
    const newScaledMapHeight = MAP_HEIGHT * newScale;

    const newHorizontalOverhang = Math.max(0, newScaledMapWidth - width);
    const newVerticalOverhang = Math.max(0, newScaledMapHeight - height);

    const newDragLimitX = newHorizontalOverhang / 2;
    const newDragLimitY = newVerticalOverhang / 2;

    const correctedX = Math.max(-newDragLimitX, Math.min(newDragLimitX, idealX));
    const correctedY = Math.max(-newDragLimitY, Math.min(newDragLimitY, idealY));

    const animTransition = { duration: 0.3, ease: 'easeOut' as any };

    animate(scaleMotionValue, newScale as any, animTransition);
    animate(x, correctedX as any, animTransition);
    animate(y, correctedY as any, animTransition);
  };

  const dragConstraints = useMemo(() => {
    const { width, height } = containerSize;
    if (!width || !height) return { left: 0, right: 0, top: 0, bottom: 0 };

    const scaledMapWidth = MAP_WIDTH * scale;
    const scaledMapHeight = MAP_HEIGHT * scale;

    const horizontalOverhang = Math.max(0, scaledMapWidth - width);
    const verticalOverhang = Math.max(0, scaledMapHeight - height);

    const dragLimitX = horizontalOverhang / 2;
    const dragLimitY = verticalOverhang / 2;

    return { left: -dragLimitX, right: dragLimitX, top: -dragLimitY, bottom: dragLimitY };
  }, [scale, containerSize]);

  const hudConfig: { imgSrc: string; alt: string; to: string }[] = [{ imgSrc: getAssetUrl("images/ui/button-home.png"), alt: "Back to Home", to: "/" }];

  return (
    <motion.div
      className="world-map-container"
      ref={containerRef}
      style={{ opacity }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlobalHUD
        backButtonConfig={hudConfig as any}
        isRevealAllActive={undefined}
        onToggleRevealAll={undefined}
      />

      <AdModal
        isOpen={!!adTargetCountry}
        featureName={`Travel to ${adTargetCountry?.name || 'Country'}`}
        onComplete={handleAdComplete}
        onCancel={() => setAdTargetCountry(null)}
      />

      <AnimatePresence>
        {showTitle && (
          <motion.img
            src={getAssetUrl("images/ui/header-choose-country.png")}
            alt="Choose a Country"
            className="map-title-img"
            initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 1.1, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      <div className="zoom-controls">
        <button onClick={() => handleZoom('in')} className="zoom-btn">+</button>
        <button onClick={() => handleZoom('out')} className="zoom-btn">-</button>
      </div>
      <div className="map-viewport">
        <motion.div
          className="map-draggable-area"
          drag
          dragConstraints={dragConstraints}
          dragElastic={0}
          dragMomentum={false}
          style={{ scale: scaleMotionValue, x, y, backgroundImage: `url(${getAssetUrl('images/world-map-bg.jpg')})` }}
        >
          {countriesOnMap.map((country) => (
            <Flag key={country.id} country={country} mapScaleMotionValue={scaleMotionValue} onSelectCountry={handleCountrySelect} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default WorldMap;