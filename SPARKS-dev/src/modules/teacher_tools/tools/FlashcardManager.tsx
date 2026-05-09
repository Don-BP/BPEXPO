import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  saveFlashcardSet,
  deleteFlashcardSet,
  importFlashcardDecks,
  saveTangoCardMutedState,
  setLiveFlashcardSet,
  FlashCard,
  FlashcardDecks,
} from '../../../utils/db';
import { getAllDecks } from '../../../utils/tango-bridge';
import { useWallet } from '../../../hooks/useWallet';
import AdModal from '../../../components/monetization/AdModal';
import { getTangoCategoryName, isTangoCategoryLocked } from '../../../utils/tangoCategories';
import './FlashcardManager.css';

interface FlashcardManagerProps {
  isFullscreen: boolean;
}

const FlashcardManager: React.FC<FlashcardManagerProps> = ({ isFullscreen }) => {
  const [decks, setDecks] = useState<FlashcardDecks>({});
  const [selectedSet, setSelectedSet] = useState('');
  const [setName, setSetName] = useState('');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [cardText, setCardText] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const { isPro, isUnlocked, unlockFeature } = useWallet();
  const [adTargetDeckKey, setAdTargetDeckKey] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    const d = await getAllDecks();
    setDecks(d);
    return d;
  }, []);

  useEffect(() => { loadDecks(); }, [loadDecks]);

  // Broadcast live (unsaved) card state so other tools reflect in-progress edits
  useEffect(() => { setLiveFlashcardSet(setName, cards); }, [setName, cards]);
  useEffect(() => () => { setLiveFlashcardSet('', []); }, []);

  function handleAdComplete() {
    if (!adTargetDeckKey) return;
    const catName = getTangoCategoryName(adTargetDeckKey)!;
    unlockFeature(`tango_cat_${catName}`);
    handleSetChange(adTargetDeckKey);
    setAdTargetDeckKey(null);
  }

  async function handleSetChange(name: string) {
    setSelectedSet(name);
    if (!name) {
      setSetName('');
      setCards([]);
      return;
    }
    const d = await getAllDecks();
    setDecks(d);
    setSetName(name);
    setCards(d[name] ? JSON.parse(JSON.stringify(d[name])) : []);
  }

  function handleAddCard() {
    const imgInput = document.getElementById('fm-card-img-input') as HTMLInputElement;
    const files = imgInput?.files;

    if (!cardText && (!files || files.length === 0)) {
      alert('Please provide text or select at least one image file.');
      return;
    }

    if (files && files.length > 0) {
      const promises = Array.from(files).map(file =>
        new Promise<FlashCard>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve({
            text: files.length === 1 ? cardText : '',
            image: e.target?.result as string,
            muted: false,
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
      Promise.all(promises).then(newCards => {
        setCards(prev => [...prev, ...newCards]);
        setCardText('');
        if (imgInput) imgInput.value = '';
      }).catch(() => alert('Error reading image files.'));
    } else {
      setCards(prev => [...prev, { text: cardText, muted: false }]);
      setCardText('');
    }
  }

  function handleRename(index: number) {
    const card = cards[index];
    const newText = window.prompt('Enter new text for this card:', card.text || '');
    if (newText !== null) {
      setCards(prev => prev.map((c, i) => i === index ? { ...c, text: newText.trim() } : c));
    }
  }

  async function handleToggleMute(index: number) {
    const card = cards[index];
    const muted = !card.muted;
    if (card.tangoId) await saveTangoCardMutedState(card.tangoId, muted);
    setCards(prev => prev.map((c, i) => i === index ? { ...c, muted } : c));
  }

  function handleRemove(index: number) {
    setCards(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const name = setName.trim();
    if (!name) { alert('Please enter a name for the set.'); return; }
    if (cards.length === 0) { alert('Please add at least one card.'); return; }
    try {
      await saveFlashcardSet(name, cards);
      alert(`Set "${name}" saved successfully!`);
      const d = await loadDecks();
      setSelectedSet(name);
      setDecks(d);
    } catch (e: any) {
      alert(`Failed to save set. Storage may be full. Error: ${e.name}`);
    }
  }

  async function handleDelete() {
    if (!selectedSet) return;
    if (!window.confirm(`Delete set "${selectedSet}"? This cannot be undone.`)) return;
    await deleteFlashcardSet(selectedSet);
    alert(`Set "${selectedSet}" deleted.`);
    const d = await loadDecks();
    setDecks(d);
    setSelectedSet('');
    setSetName('');
    setCards([]);
  }

  async function handleExport() {
    const d = await getAllDecks();
    const count = Object.keys(d).length;
    if (count === 0) { alert('No custom sets to export.'); return; }
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'don-flashcards.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    alert(`${count} set(s) exported!`);
  }

  function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
        await importFlashcardDecks(data as FlashcardDecks);
        alert('Sets imported successfully!');
        await loadDecks();
      } catch {
        alert('Import failed. File is not valid JSON or is corrupted.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }


  return (
    <div className={`flashcard-manager-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      <div className="fm-controls">

        {/* Row 1: Set select + delete */}
        <div className="fm-row">
          <select className="fm-select" value={selectedSet} onChange={e => {
            const k = e.target.value;
            if (k && isTangoCategoryLocked(k, isPro, isUnlocked)) { setAdTargetDeckKey(k); return; }
            handleSetChange(k);
          }}>
            <option value="">-- New Set --</option>
            {Object.keys(decks).map(k => {
              const catName = getTangoCategoryName(k);
              const locked = catName ? isTangoCategoryLocked(k, isPro, isUnlocked) : false;
              const icon = catName ? (locked ? '🔒 ' : '🔓 ') : '';
              return <option key={k} value={k}>{icon}{k}</option>;
            })}
          </select>
          <button className="tool-btn fm-delete-btn" onClick={handleDelete} disabled={!selectedSet}>
            🗑️ Delete Set
          </button>
        </div>

        {/* Row 2: Set name input */}
        <div className="fm-row">
          <input
            className="fm-text-input"
            type="text"
            placeholder="Set name..."
            value={setName}
            onChange={e => setSetName(e.target.value)}
          />
        </div>

        {/* Row 3: Add card */}
        <div className="fm-row">
          <input
            className="fm-text-input"
            type="text"
            placeholder="Card text..."
            value={cardText}
            onChange={e => setCardText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCard()}
          />
          <label className="fm-file-label" htmlFor="fm-card-img-input">📷 Image</label>
          <input
            id="fm-card-img-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <button className="tool-btn fm-add-btn" onClick={handleAddCard}>+ Add Card</button>
        </div>

        {/* Row 4: Save / Export / Import */}
        <div className="fm-row">
          <button className="tool-btn fm-save-btn" onClick={handleSave}>💾 Save Set</button>
          <button className="tool-btn fm-export-btn" onClick={handleExport}>📤 Export</button>
          <label className="fm-import-label" htmlFor="fm-import-input">📥 Import</label>
          <input
            id="fm-import-input"
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportChange}
          />
        </div>
      </div>

      {/* Card list */}
      <div className="fm-current-cards">
        {cards.length === 0
          ? <div className="fm-empty">No cards yet. Add some above.</div>
          : cards.map((card, i) => (
            <div key={i} className={`fm-card-item${card.muted ? ' fm-card-item--muted' : ''}`}>
              <div className="fm-card-details">
                {card.image && (
                  <img src={card.image} alt="thumb" className="fm-card-thumbnail" />
                )}
                <span className="fm-card-name">{card.text || '[Image Only]'}</span>
              </div>
              <div className="fm-card-actions">
                <button className="tool-btn fm-rename-btn" onClick={() => handleRename(i)}>Rename</button>
                <button
                  className={`tool-btn fm-mute-btn${card.muted ? ' muted' : ''}`}
                  onClick={() => handleToggleMute(i)}
                >
                  {card.muted ? 'Unmute' : 'Mute'}
                </button>
                <button className="tool-btn fm-remove-btn" onClick={() => handleRemove(i)}>Remove</button>
              </div>
            </div>
          ))
        }
      </div>

      <AdModal
        isOpen={adTargetDeckKey !== null}
        featureName={getTangoCategoryName(adTargetDeckKey ?? '') ?? ''}
        onComplete={handleAdComplete}
        onCancel={() => setAdTargetDeckKey(null)}
      />
    </div>
  );
};

export default FlashcardManager;
