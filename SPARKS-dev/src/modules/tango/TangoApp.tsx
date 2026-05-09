import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';
import './BPTango.css';
import TangoSetupScreen from './components/TangoSetupScreen';
import TangoPracticeScreen from './components/TangoPracticeScreen';
import CustomModal from './components/CustomModal';
import vocabulary from './data/pronunciation_vocab';
import { useWallet } from '../../hooks/useWallet';
import AdModal from '../../components/monetization/AdModal';
import { FREE_CATEGORIES } from '../../utils/tangoCategories';
// import LockOverlay from '../../components/monetization/LockOverlay';

function TangoApp() {
  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const navigate = useNavigate();

  // --- STATE DEFINITIONS ---
  const [appPhase, setAppPhase] = useState<'SETUP' | 'PRACTICE'>('SETUP');
  const [setupSelections, setSetupSelections] = useState<{ grade: number, categories: string[] } | null>(null);
  const [practiceSettings, setPracticeSettings] = useState<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Custom Sets & Scanner State
  const [savedSets, setSavedSets] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showSetsMenu, setShowSetsMenu] = useState(false);

  // Sharing State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState('');
  const [shareSetInfo, setShareSetInfo] = useState<{ name: string, count: number } | null>(null);

  // Monetization State
  const [adTargetCategory, setAdTargetCategory] = useState<string | null>(null);

  // --- EFFECT: Load Saved Sets ---
  useEffect(() => {
    // Only load from localStorage if PRO? 
    // Actually, logic says: "If they were Pro and became Free, they shouldn't access old sets?"
    // For now, let's just load them. Writing is restricted.
    const storedSets = localStorage.getItem('bp_tango_saved_sets');
    if (storedSets) {
      try {
        setSavedSets(JSON.parse(storedSets));
      } catch (e) {
        console.error("Failed to parse saved sets", e);
      }
    }
  }, []);

  // --- EFFECT: Persist Saved Sets (Pro Only) ---
  useEffect(() => {
    if (isPro) {
      localStorage.setItem('bp_tango_saved_sets', JSON.stringify(savedSets));
    }
  }, [savedSets, isPro]);

  // --- HANDLERS ---

  const handleStartPractice = () => {
    if (!setupSelections || setupSelections.categories.length === 0) {
      setShowErrorModal(true);
      return;
    }

    // Check for locked categories in selection
    const lockedCategories = setupSelections.categories.filter((cat: string) => {
      if (isPro || FREE_CATEGORIES.includes(cat)) return false;
      return !isUnlocked(`tango_cat_${cat}`);
    });

    if (lockedCategories.length > 0) {
      // Simplicity: Show ad for the first locked category
      setAdTargetCategory(lockedCategories[0]);
      return;
    }

    // Filter vocabulary based on selections
    const practiceWords = (vocabulary as any[]).filter(word =>
      word.grade <= setupSelections.grade && setupSelections.categories.includes(word.category)
    );

    if (practiceWords.length === 0) {
      alert("No words found for these settings.");
      return;
    }

    setPracticeSettings({
      ...setupSelections,
      words: practiceWords
    });
    setAppPhase('PRACTICE');
  };

  const handleAdComplete = () => {
    if (adTargetCategory) {
      unlockFeature(`tango_cat_${adTargetCategory}`);
      setAdTargetCategory(null);
      // Don't auto-start, let them click again to be sure
    }
  };

  const handleEndPractice = () => {
    setAppPhase('SETUP');
  };

  // --- SET MANAGEMENT HANDLERS ---

  const handleSaveSet = (name: string, wordIds: number[]) => {
    const newSet = {
      id: Date.now(),
      name: name,
      wordIds: wordIds,
      date: new Date().toLocaleDateString()
    };

    if (!isPro) {
      alert("Saving custom sets is a PRO feature. Upgrade to save your sets permanently!\n(This set will be lost if you refresh)");
      // Add to state but it won't be persisted due to useEffect check
      setSavedSets(prev => [newSet, ...prev]);
      return;
    }

    setSavedSets(prev => [newSet, ...prev]);
    alert(`Set "${name}" saved successfully!`);
  };

  const handleDeleteSet = (setId: number) => {
    if (window.confirm("Are you sure you want to delete this set?")) {
      setSavedSets(prev => prev.filter(s => s.id !== setId));
    }
  };

  const handleRenameSet = (setId: number) => {
    const set = savedSets.find(s => s.id === setId);
    const newName = prompt("Enter new name:", set ? set.name : "");
    if (newName && newName.trim() !== "") {
      setSavedSets(prev => prev.map(s => s.id === setId ? { ...s, name: newName } : s));
    }
  };

  const handleShareSet = (set: any) => {
    const setPayload = {
      name: set.name,
      words: set.wordIds
    };
    setShareData(JSON.stringify(setPayload));
    setShareSetInfo({ name: set.name, count: set.wordIds.length });
    setShowShareModal(true);
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setShareData('');
    setShareSetInfo(null);
  };

  // --- SCANNER HANDLERS ---

  const handleScanSuccess = (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    const rawData = detectedCodes[0].rawValue;

    try {
      const parsedData = JSON.parse(rawData);

      if (parsedData.words && Array.isArray(parsedData.words)) {
        // 1. Create the new set object
        const newSetName = parsedData.name || new Date().toISOString().split('T')[0];
        const newSet = {
          id: Date.now(),
          name: newSetName,
          wordIds: parsedData.words,
          date: new Date().toLocaleDateString()
        };

        // 2. Save to state (persistence handled by effect)
        // Note: Even if free, we load the shared set into current session
        setSavedSets(prev => [newSet, ...prev]);

        // 3. Close scanner
        setShowScanner(false);

        // 4. Immediately start practice
        loadSetForPractice(newSet);
      }
    } catch (e) {
      console.error("Failed to parse QR code data", e);
      alert("Invalid QR Code format.");
    }
  };

  const loadSetForPractice = (set: any) => {
    // Find the actual word objects from the IDs
    const setWords = (vocabulary as any[]).filter(w => set.wordIds.includes(w.id));

    if (setWords.length === 0) {
      alert("Could not find any matching words in the database.");
      return;
    }

    const uniqueCategories = [...new Set(setWords.map(w => w.category))];

    setPracticeSettings({
      grade: 0, // Custom sets ignore grade limits
      categories: uniqueCategories,
      words: setWords
    });

    setShowSetsMenu(false);
    setAppPhase('PRACTICE');
  };

  // --- RENDER HELPERS ---

  const renderCurrentPhase = () => {
    switch (appPhase) {
      case 'SETUP':
        const isStartDisabled = !setupSelections || setupSelections.categories.length === 0;
        return (
          <div className="tango-setup-page">
            {/* background applied via CSS */}

            {showErrorModal && (
              <CustomModal
                message="Please select at least one category to practice!"
                onClose={() => setShowErrorModal(false)}
              />
            )}

            {/* Share QR Modal */}
            {showShareModal && shareSetInfo && (
              <div className="modal-overlay">
                <div className="qr-modal-content">
                  <button className="modal-close-x" onClick={handleCloseShare}>&times;</button>
                  <h2>Share Set</h2>
                  <p><strong>{shareSetInfo.name}</strong> ({shareSetInfo.count} cards)</p>
                  <div className="qr-canvas-container">
                    <QRCodeCanvas value={shareData} size={256} level={"L"} />
                  </div>
                  <p>Ask a student to scan this code with "Get Set".</p>
                  <button onClick={handleCloseShare} className="practice-nav-button" style={{ color: '#333' }}>Close</button>
                </div>
              </div>
            )}

            {/* Scanner Modal */}
            {showScanner && (
              <div className="modal-overlay">
                <div className="scanner-modal-content">
                  <h2>Scan Teacher's QR Code</h2>
                  <div className="scanner-container">
                    <Scanner
                      onScan={handleScanSuccess}
                      formats={['qr_code']}
                    />
                  </div>
                  <button className="close-scanner-btn" onClick={() => setShowScanner(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Saved Sets Menu Modal */}
            {showSetsMenu && (
              <div className="modal-overlay" onClick={() => setShowSetsMenu(false)}>
                <div className="sets-menu-content" onClick={e => e.stopPropagation()}>
                  <div className="sets-menu-header">
                    <h2>Saved Sets</h2>
                    <button className="close-sets-btn" onClick={() => setShowSetsMenu(false)}>&times;</button>
                  </div>
                  <div className="sets-list">
                    {savedSets.length === 0 ? (
                      <p className="no-sets-msg">No saved sets yet. Use "Get Set" to scan one!</p>
                    ) : (
                      savedSets.map(set => (
                        <div key={set.id} className="saved-set-item">
                          <div className="set-info">
                            <span className="set-name">{set.name}</span>
                            <span className="set-details">{set.wordIds.length} words • {set.date}</span>
                          </div>
                          <div className="set-actions">
                            <button className="set-action-btn play" onClick={() => loadSetForPractice(set)}>Play ▶</button>
                            <button className="set-action-btn share" onClick={() => handleShareSet(set)} style={{ backgroundColor: '#2196F3', color: 'white' }}>Share 📤</button>
                            <button className="set-action-btn rename" onClick={() => handleRenameSet(set.id)}>✏️</button>
                            <button className="set-action-btn delete" onClick={() => handleDeleteSet(set.id)}>🗑</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <header className="tango-header">
              <div className="header-side-container">
                <button className="header-nav-button" onClick={() => navigate(-1)}>
                  &lt; Back
                </button>
                <button className="header-nav-button menu-button" onClick={() => setShowSetsMenu(true)}>
                  📂 Sets
                </button>
              </div>
              <h1>Word Box</h1>
              <div className="header-side-container">
                <button className="header-nav-button get-set-button" onClick={() => setShowScanner(true)}>
                  📷 Get Set
                </button>
              </div>
            </header>
            <main className="tango-main-content">
              <TangoSetupScreen onSelectionChange={setSetupSelections} />
            </main>

            <footer className="tango-footer-bar">
              <button
                className="tango-start-button full-width-button"
                onClick={handleStartPractice}
                disabled={isStartDisabled}
              >
                Start Practice ▶
              </button>
            </footer>
          </div>
        );

      case 'PRACTICE':
        return (
          <TangoPracticeScreen
            settings={practiceSettings}
            onEndPractice={handleEndPractice}
            onSaveSet={handleSaveSet}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="TangoApp h-full w-full" onContextMenu={(e) => e.preventDefault()}>
      <AdModal
        isOpen={!!adTargetCategory}
        featureName={`Unlock ${adTargetCategory} Category`}
        onComplete={handleAdComplete}
        onCancel={() => setAdTargetCategory(null)}
      />
      {renderCurrentPhase()}
    </div>
  );
}

export default TangoApp;