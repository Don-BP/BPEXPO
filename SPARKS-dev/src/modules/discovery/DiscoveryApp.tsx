// Note: We use relative routes here because this app is mounted at /discovery/*
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AudioProvider } from './contexts/AudioContext';
import WelcomePage from './components/WelcomePage';
import WorldMap from './components/WorldMap';
import CountryPage from './components/CountryPage';
import './App.css'; // Module specific styles

function DiscoveryApp() {
  const location = useLocation();

  return (
    <AudioProvider>
      <div className="discovery-module h-full w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route index element={<WelcomePage />} />
            <Route path="map" element={<WorldMap />} />
            <Route path="country/:countryId" element={<CountryPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </AudioProvider>
  );
}

export default DiscoveryApp;