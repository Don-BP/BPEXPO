import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllJeopardyGames, saveJeopardyGame, deleteJeopardyGame, importJeopardyGames,
  JeopardyGame, JeopardyClue,
} from '../../../utils/db';
import './AnswerMeThis.css';

interface AnswerMeThisProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

interface ActiveClue extends JeopardyClue {
  catIndex: number;
  clueIndex: number;
}

const emptyGame = (): JeopardyGame => ({ title: '', categories: [] });

const AnswerMeThis: React.FC<AnswerMeThisProps> = ({ isFullscreen, onGoToScoreboard }) => {
  const [mode, setMode] = useState<'play' | 'edit'>('play');
  const [game, setGame] = useState<JeopardyGame>(emptyGame());
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [loadTitle, setLoadTitle] = useState('');
  const [activeClue, setActiveClue] = useState<ActiveClue | null>(null);
  const [questionRevealed, setQuestionRevealed] = useState(false);

  const refreshSaved = useCallback(async () => {
    const games = await getAllJeopardyGames();
    setSavedTitles(Object.keys(games));
  }, []);

  useEffect(() => { refreshSaved(); }, [refreshSaved]);

  const handleLoadGame = async (title: string) => {
    if (!title) return;
    const games = await getAllJeopardyGames();
    if (games[title]) {
      setGame(JSON.parse(JSON.stringify(games[title])));
      setMode('edit');
    }
  };

  const handleSave = async () => {
    if (!game.title.trim()) { alert('Please enter a game title.'); return; }
    await saveJeopardyGame(game.title.trim(), game);
    await refreshSaved();
    alert(`Game "${game.title.trim()}" saved!`);
  };

  const handleDelete = async () => {
    if (!loadTitle || !confirm(`Delete "${loadTitle}"?`)) return;
    await deleteJeopardyGame(loadTitle);
    await refreshSaved();
    setLoadTitle('');
    if (game.title === loadTitle) setGame(emptyGame());
  };

  const handleExport = async () => {
    const games = await getAllJeopardyGames();
    if (!Object.keys(games).length) { alert('No saved games to export.'); return; }
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'answer-me-this-games.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        await importJeopardyGames(data);
        await refreshSaved();
        alert('Games imported successfully!');
      } catch { alert('Import failed. Invalid file format.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTileClick = (catIdx: number, clueIdx: number) => {
    const clue = game.categories[catIdx]?.clues[clueIdx];
    if (!clue || clue.revealed) return;
    setActiveClue({ ...JSON.parse(JSON.stringify(clue)), catIndex: catIdx, clueIndex: clueIdx });
    setQuestionRevealed(false);
    new Audio('/teacher_tools/assets/sounds/select.mp3').play().catch(() => {});
  };

  const handleCloseClue = () => {
    if (!activeClue) return;
    setGame(prev => {
      const next: JeopardyGame = JSON.parse(JSON.stringify(prev));
      next.categories[activeClue.catIndex].clues[activeClue.clueIndex].revealed = true;
      return next;
    });
    setActiveClue(null);
  };

  // Edit helpers — all use JSON clone to avoid mutation
  const updateCatTitle = (ci: number, v: string) =>
    setGame(prev => { const n: JeopardyGame = JSON.parse(JSON.stringify(prev)); n.categories[ci].title = v; return n; });

  const removeCat = (ci: number) =>
    setGame(prev => { const n: JeopardyGame = JSON.parse(JSON.stringify(prev)); n.categories.splice(ci, 1); return n; });

  const addCat = () =>
    setGame(prev => ({ ...prev, categories: [...prev.categories, { title: '', clues: [] }] }));

  const addClue = (ci: number) =>
    setGame(prev => {
      const n: JeopardyGame = JSON.parse(JSON.stringify(prev));
      n.categories[ci].clues.push({ points: (n.categories[ci].clues.length + 1) * 100, answer: '', question: '', image: null, revealed: false });
      return n;
    });

  const updateClue = (ci: number, li: number, field: keyof JeopardyClue, value: JeopardyClue[keyof JeopardyClue]) =>
    setGame(prev => {
      const n: JeopardyGame = JSON.parse(JSON.stringify(prev));
      (n.categories[ci].clues[li] as unknown as Record<string, unknown>)[field as string] = value;
      return n;
    });

  const removeClue = (ci: number, li: number) =>
    setGame(prev => { const n: JeopardyGame = JSON.parse(JSON.stringify(prev)); n.categories[ci].clues.splice(li, 1); return n; });

  const handleClueImage = (ci: number, li: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateClue(ci, li, 'image', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const numCats = game.categories.length;
  const numClues = numCats > 0 ? game.categories.reduce((max, cat) => Math.max(max, cat.clues.length), 0) : 0;


  const loadSelect = (
    <select className="amt-select" value={loadTitle}
      onChange={e => { setLoadTitle(e.target.value); handleLoadGame(e.target.value); }}>
      <option value="">-- Select Game --</option>
      {savedTitles.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );

  return (
    <div className={`answer-me-this-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      {/* ── Play Mode ── */}
      {mode === 'play' && (
        <div className="amt-play-mode">

          {isFullscreen ? (
            <div className="amt-bar-fullscreen">
              <button className="tool-btn amt-pill-btn" onClick={() => setMode('edit')}>EDIT</button>
              <button className="tool-btn amt-pill-btn" onClick={() => { setGame(emptyGame()); setMode('edit'); }}>NEW GAME</button>
              <button className="tool-btn amt-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
              <span className="amt-label">Load Saved Game:</span>
              {loadSelect}
            </div>
          ) : (
            <div className="amt-bar-hub">
              <div className="amt-hub-row">
                <button className="tool-btn amt-pill-btn" onClick={() => setMode('edit')}>EDIT</button>
                <button className="tool-btn amt-pill-btn" onClick={() => { setGame(emptyGame()); setMode('edit'); }}>NEW GAME</button>
                <button className="tool-btn amt-icon-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
              </div>
              <div className="amt-hub-row">
                <span className="amt-label">Load Saved Game:</span>
                {loadSelect}
              </div>
            </div>
          )}

          <div className="amt-board-container">
            {numCats === 0 ? (
              <div className="amt-board-placeholder">
                <p>No game loaded.</p>
                <p>Use "Edit Game" or "Load Game" to get started.</p>
              </div>
            ) : (
              <div className="amt-board" style={{ gridTemplateColumns: `repeat(${numCats}, 1fr)` }}>
                {game.categories.map((cat, ci) => (
                  <div key={ci} className="amt-tile amt-header">
                    <span>{cat.title || '—'}</span>
                  </div>
                ))}
                {Array.from({ length: numClues }, (_, li) =>
                  game.categories.map((cat, ci) => {
                    const clue = cat.clues[li];
                    return clue ? (
                      <div
                        key={`${ci}-${li}`}
                        className={`amt-tile amt-clue${clue.revealed ? ' revealed' : ''}`}
                        onClick={() => handleTileClick(ci, li)}
                      >
                        <div className="amt-tile-inner">
                          <div className="amt-tile-front"><span>${clue.points}</span></div>
                          <div className="amt-tile-back" />
                        </div>
                      </div>
                    ) : (
                      <div key={`${ci}-${li}`} className="amt-tile amt-empty" />
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Mode ── */}
      {mode === 'edit' && (
        <div className="amt-edit-mode">
          <div className="amt-edit-toolbar">
            <input
              type="text"
              className="amt-title-input"
              placeholder="Game Title"
              value={game.title}
              onChange={e => setGame(prev => ({ ...prev, title: e.target.value }))}
            />
            <button className="amt-btn" onClick={handleSave}>💾 Save</button>
            <select
              value={loadTitle}
              onChange={e => { setLoadTitle(e.target.value); handleLoadGame(e.target.value); }}
            >
              <option value="">-- Load --</option>
              {savedTitles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="amt-btn amt-btn-danger" onClick={handleDelete} disabled={!loadTitle}>🗑️</button>
            <button className="amt-btn amt-btn-green" onClick={handleExport}>📤 Export</button>
            <label className="amt-btn">📥 Import<input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} /></label>
            <button className="amt-btn amt-btn-primary" onClick={() => setMode('play')}>▶ Play</button>
            <button className="amt-btn amt-btn-green" onClick={addCat}>+ Category</button>
          </div>

          <div className="amt-edit-area">
            {game.categories.map((cat, ci) => (
              <div key={ci} className="amt-edit-category">
                <div className="amt-edit-cat-header">
                  <input
                    type="text"
                    placeholder="Category Title"
                    value={cat.title}
                    onChange={e => updateCatTitle(ci, e.target.value)}
                  />
                  <button className="amt-remove-btn" onClick={() => removeCat(ci)}>✖</button>
                </div>

                {cat.clues.map((clue, li) => (
                  <div key={li} className="amt-edit-clue">
                    <div className="amt-edit-clue-top">
                      <input
                        type="number"
                        placeholder="Points"
                        value={clue.points || ''}
                        step={100}
                        min={100}
                        onChange={e => updateClue(ci, li, 'points', parseInt(e.target.value, 10) || 0)}
                      />
                      <button className="amt-remove-btn" onClick={() => removeClue(ci, li)}>✖</button>
                    </div>
                    <textarea
                      placeholder="Answer (Clue Text)"
                      value={clue.answer}
                      onChange={e => updateClue(ci, li, 'answer', e.target.value)}
                    />
                    <textarea
                      placeholder="Question (e.g., What is...?)"
                      value={clue.question}
                      onChange={e => updateClue(ci, li, 'question', e.target.value)}
                    />
                    <div className="amt-clue-image-row">
                      <label className="amt-img-btn">
                        🖼️ Image
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleClueImage(ci, li, e)} />
                      </label>
                      {clue.image && <img src={clue.image} alt="thumb" className="amt-clue-thumb" onClick={() => updateClue(ci, li, 'image', null)} title="Click to remove" />}
                    </div>
                  </div>
                ))}

                <button className="amt-add-clue-btn" onClick={() => addClue(ci)}>+ Add Clue</button>
              </div>
            ))}
            {game.categories.length === 0 && (
              <p className="amt-edit-hint">Click "+ Category" above to start building your game.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Clue Modal ── */}
      {activeClue && (
        <div className="amt-modal-overlay" onClick={handleCloseClue}>
          <div className="amt-modal-content" onClick={e => e.stopPropagation()}>
            <button className="amt-modal-close" onClick={handleCloseClue}>✕</button>
            <div className="amt-modal-category">{game.categories[activeClue.catIndex]?.title}</div>
            <div className="amt-modal-points">${activeClue.points}</div>
            <div className="amt-modal-answer">{activeClue.answer}</div>
            {questionRevealed ? (
              <>
                {activeClue.image && (
                  <div className="amt-modal-image">
                    <img src={activeClue.image} alt="clue" />
                  </div>
                )}
                <div className="amt-modal-question">{activeClue.question}</div>
              </>
            ) : (
              <button className="amt-reveal-btn" onClick={() => setQuestionRevealed(true)}>
                Reveal Answer
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AnswerMeThis;
