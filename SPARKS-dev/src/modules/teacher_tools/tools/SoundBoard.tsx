import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAllSoundBoards, saveSoundBoard, deleteSoundBoard, importSoundBoards,
  SfxItem, StoredBoard,
} from './soundBoardDB';
import './SoundBoard.css';

interface SoundBoardProps {
  isFullscreen: boolean;
}

interface MusicTrack {
  name: string;
  audio: HTMLAudioElement;
}

const PRESET_COLORS = [
  '#E53935', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FDD835', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B', '#212121',
];

const SoundBoard: React.FC<SoundBoardProps> = ({ isFullscreen }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<SfxItem[]>([]);
  const [boardNames, setBoardNames] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [boardNameInput, setBoardNameInput] = useState('');
  const [masterVolume, setMasterVolume] = useState(0.75);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackTick, setTrackTick] = useState(0); // triggers re-render when track list changes
  const [colorPickerOpenId, setColorPickerOpenId] = useState<string | null>(null);
  const [colorPopupPos, setColorPopupPos] = useState({ top: 0, left: 0 });

  const musicRef = useRef<MusicTrack[]>([]);
  const activeSfxRef = useRef<HTMLAudioElement | null>(null);
  const playGridRef = useRef<HTMLDivElement>(null);
  const trackIdxRef = useRef(-1);
  const volumeRef = useRef(0.75);

  // Keep refs in sync with state
  useEffect(() => { trackIdxRef.current = currentTrackIdx; }, [currentTrackIdx]);
  useEffect(() => { volumeRef.current = masterVolume; }, [masterVolume]);

  // Stable playMusic — all deps via refs
  const playMusic = useCallback((index: number) => {
    const tracks = musicRef.current;
    if (index < 0 || index >= tracks.length) return;
    const prev = trackIdxRef.current;
    if (prev >= 0 && tracks[prev]) tracks[prev].audio.pause();
    trackIdxRef.current = index;
    setCurrentTrackIdx(index);
    const track = tracks[index];
    track.audio.volume = volumeRef.current;
    track.audio.currentTime = 0;
    track.audio.play().catch(console.error);
    setIsPlaying(true);
  }, []);

  const stopMusic = useCallback(() => {
    const tracks = musicRef.current;
    const idx = trackIdxRef.current;
    if (idx >= 0 && tracks[idx]) {
      tracks[idx].audio.pause();
      tracks[idx].audio.currentTime = 0;
    }
    trackIdxRef.current = -1;
    setCurrentTrackIdx(-1);
    setIsPlaying(false);
  }, []);

  // Auto-size the play grid
  useEffect(() => {
    if (isEditMode || !playGridRef.current || currentBoard.length === 0) return;
    const grid = playGridRef.current;

    const adjustGrid = () => {
      const { clientWidth: w, clientHeight: h } = grid;
      const n = currentBoard.length;
      let cols = Math.ceil(Math.sqrt(n * (h / Math.max(w, 1))));
      cols = Math.min(n, Math.max(1, cols));
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      requestAnimationFrame(() => {
        grid.querySelectorAll<HTMLElement>('.sb-button-name').forEach(nameEl => {
          const wrapper = nameEl.parentElement!;
          let size = 40;
          nameEl.style.fontSize = `${size}px`;
          while (
            (nameEl.scrollWidth > wrapper.clientWidth - 10 ||
              nameEl.scrollHeight > wrapper.clientHeight - 10) &&
            size > 8
          ) {
            size--;
            nameEl.style.fontSize = `${size}px`;
          }
        });
      });
    };

    adjustGrid();
    const ro = new ResizeObserver(adjustGrid);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [isEditMode, currentBoard]);

  const refreshBoardNames = useCallback(async () => {
    const boards = await getAllSoundBoards();
    setBoardNames(Object.keys(boards));
  }, []);

  useEffect(() => { refreshBoardNames(); }, [refreshBoardNames]);

  const loadBoard = useCallback(async (name: string) => {
    if (!name) {
      setBoardNameInput('');
      setCurrentBoard([]);
      stopMusic();
      musicRef.current = [];
      setTrackTick(t => t + 1);
      return;
    }
    const boards = await getAllSoundBoards();
    const data: StoredBoard = boards[name];
    if (!data) return;
    setBoardNameInput(name);
    setCurrentBoard(data.sfx ?? []);
    const tracks: MusicTrack[] = (data.music ?? []).map(t => ({ name: t.name, audio: new Audio(t.data) }));
    tracks.forEach((track, i) => {
      track.audio.onended = () => {
        const next = (trackIdxRef.current + 1) % musicRef.current.length;
        playMusic(next);
      };
      void i;
    });
    stopMusic();
    musicRef.current = tracks;
    setTrackTick(t => t + 1);
  }, [playMusic, stopMusic]);

  const playSfx = (item: SfxItem) => {
    if (!item.soundData) return;
    if (activeSfxRef.current) {
      activeSfxRef.current.pause();
      activeSfxRef.current.currentTime = 0;
    }
    const sound = new Audio(item.soundData);
    sound.volume = masterVolume;
    activeSfxRef.current = sound;
    sound.onended = () => { if (activeSfxRef.current === sound) activeSfxRef.current = null; };
    sound.play().catch(console.error);
  };

  const togglePlayPause = () => {
    const tracks = musicRef.current;
    if (currentTrackIdx === -1) {
      if (tracks.length > 0) playMusic(0);
      return;
    }
    const audio = tracks[currentTrackIdx]?.audio;
    if (!audio) return;
    if (audio.paused) { audio.play(); setIsPlaying(true); }
    else { audio.pause(); setIsPlaying(false); }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMasterVolume(vol);
    volumeRef.current = vol;
    const tracks = musicRef.current;
    if (currentTrackIdx >= 0 && tracks[currentTrackIdx]) {
      tracks[currentTrackIdx].audio.volume = vol;
    }
  };

  const handleMusicLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const wasEmpty = musicRef.current.length === 0;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = re => {
        const audio = new Audio(re.target!.result as string);
        const track: MusicTrack = { name: file.name, audio };
        track.audio.onended = () => {
          const next = (trackIdxRef.current + 1) % musicRef.current.length;
          playMusic(next);
        };
        musicRef.current = [...musicRef.current, track];
        setTrackTick(t => t + 1);
        if (wasEmpty && musicRef.current.length === 1) {
          trackIdxRef.current = 0;
          setCurrentTrackIdx(0);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>, item: SfxItem) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = re => {
      setCurrentBoard(prev => prev.map(i => {
        if (i.id !== item.id) return i;
        const name = i.name === 'New Sound'
          ? (file.name.split('.').slice(0, -1).join('.') || 'Sound')
          : i.name;
        return { ...i, soundData: re.target!.result as string, name };
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveBoard = async () => {
    const name = boardNameInput.trim();
    if (!name) { alert('Please enter a name for the sound board.'); return; }
    const music = musicRef.current.map(t => ({ name: t.name, data: t.audio.src }));
    await saveSoundBoard(name, { sfx: currentBoard, music });
    alert(`Board "${name}" saved.`);
    await refreshBoardNames();
    setSelectedBoard(name);
  };

  const deleteBoard = async () => {
    if (!selectedBoard || !confirm(`Delete board "${selectedBoard}"?`)) return;
    await deleteSoundBoard(selectedBoard);
    alert(`Board "${selectedBoard}" deleted.`);
    setSelectedBoard('');
    setBoardNameInput('');
    setCurrentBoard([]);
    stopMusic();
    musicRef.current = [];
    setTrackTick(t => t + 1);
    await refreshBoardNames();
  };

  const exportBoards = async () => {
    const boards = await getAllSoundBoards();
    if (Object.keys(boards).length === 0) { alert('No custom boards to export.'); return; }
    const blob = new Blob([JSON.stringify(boards, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'don-sound-boards.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importBoards = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importSoundBoards(JSON.parse(text));
      alert('Sound boards imported successfully!');
      await refreshBoardNames();
    } catch {
      alert('Import failed. Invalid file format.');
    }
    e.target.value = '';
  };

  // trackTick is consumed to ensure re-renders when musicRef changes
  void trackTick;

  useEffect(() => { if (!isEditMode) setColorPickerOpenId(null); }, [isEditMode]);

  const openColorPicker = (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => {
    e.stopPropagation();
    if (colorPickerOpenId === itemId) { setColorPickerOpenId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const popupW = 204;
    const popupH = 210;
    const margin = 8;
    const left = Math.max(margin, Math.min(rect.right - 188, window.innerWidth - popupW - margin));
    const fitsBelow = rect.bottom + 6 + popupH <= window.innerHeight - margin;
    const top = fitsBelow ? rect.bottom + 6 : Math.max(margin, rect.top - popupH - 6);
    setColorPopupPos({ top, left });
    setColorPickerOpenId(itemId);
  };

  const tracks = musicRef.current;
  const currentTrackName = currentTrackIdx >= 0 ? tracks[currentTrackIdx]?.name : '';
  const colorItem = colorPickerOpenId ? (currentBoard.find(i => i.id === colorPickerOpenId) ?? null) : null;

  return (
    <div className={`sb-tool${isEditMode ? ' sb-edit-mode' : ''}`}>
      <div className="sb-header">
        <span className="sb-title">🔊 Sound Board</span>
        <button className="tool-btn sb-mode-btn" onClick={() => setIsEditMode(m => !m)}>
          {isEditMode ? '✅ Done' : '✏️ Edit Board'}
        </button>
      </div>

      {isEditMode ? (
        <div className="sb-edit-panel">
          <div className="sb-edit-top-bar">
            <div className="sb-edit-left">
              <select
                value={selectedBoard}
                onChange={e => { setSelectedBoard(e.target.value); loadBoard(e.target.value); }}
              >
                <option value="">-- New Sound Board --</option>
                {boardNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <input
                type="text"
                placeholder="Board name…"
                value={boardNameInput}
                onChange={e => setBoardNameInput(e.target.value)}
              />
            </div>
            <div className="sb-edit-right">
              <button className="tool-btn sb-edit-pill" onClick={saveBoard}>💾 Save</button>
              <button className="tool-btn sb-edit-pill" onClick={deleteBoard} disabled={!selectedBoard}>🗑️ Delete</button>
              <button className="tool-btn sb-edit-pill" onClick={exportBoards}>📤 Export</button>
              <label className="sb-file-label-btn">
                📥 Import
                <input type="file" accept=".json" onChange={importBoards} style={{ display: 'none' }} />
              </label>
              <span className="sb-sep" />
              <button
                className="tool-btn sb-add-btn"
                onClick={() => setCurrentBoard(prev => [...prev, { id: `sb-${Date.now()}`, name: 'New Sound', soundData: null }])}
              >
                ➕ Add Sound
              </button>
            </div>
          </div>

          <div className="sb-edit-grid">
            {currentBoard.length === 0 && (
              <p className="sb-edit-empty">Click "Add Sound" to add buttons to this board.</p>
            )}
            {currentBoard.map(item => (
              <div key={item.id} className="sb-edit-card">
                <div className="sb-edit-overlay">
                  <label className="sb-edit-action" title="Upload Sound">
                    🎵
                    <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => handleSoundUpload(e, item)} />
                  </label>
                  <button
                    className="sb-edit-action sb-color-swatch"
                    title="Button color"
                    style={{ background: item.color ?? '#8BC34A' }}
                    onClick={e => openColorPicker(e, item.id)}
                  />
                  <button
                    className="sb-edit-action sb-edit-delete"
                    onClick={() => {
                      if (confirm(`Delete button "${item.name}"?`)) {
                        setCurrentBoard(prev => prev.filter(i => i.id !== item.id));
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
                <input
                  className="sb-edit-name"
                  type="text"
                  value={item.name}
                  onChange={e => setCurrentBoard(prev => prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                />
                {item.soundData && <span className="sb-sound-indicator">🔊</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sb-play-panel">
          <div className="sb-music-player">
            <div className="sb-music-controls">
              <button className="tool-btn sb-transport-btn" onClick={() => { if (tracks.length > 0) playMusic((currentTrackIdx - 1 + tracks.length) % tracks.length); }}>⏮</button>
              <button className="tool-btn sb-transport-btn" onClick={togglePlayPause}>{isPlaying ? '⏸' : '▶'}</button>
              <button className="tool-btn sb-transport-btn" onClick={stopMusic}>⏹</button>
              <button className="tool-btn sb-transport-btn" onClick={() => { if (tracks.length > 0) playMusic((currentTrackIdx + 1) % tracks.length); }}>⏭</button>
              <label className="sb-file-label-btn">
                🎵 Music
                <input type="file" accept="audio/*" multiple onChange={handleMusicLoad} style={{ display: 'none' }} />
              </label>
              <input
                type="range" min="0" max="1" step="0.05"
                className="sb-volume"
                value={masterVolume}
                onChange={handleVolumeChange}
                title="Volume"
              />
            </div>
            <div className="sb-track-info">{currentTrackName || 'No track playing'}</div>
            {tracks.length > 0 && (
              <details className="sb-track-details">
                <summary>Track list ({tracks.length})</summary>
                <ul className="sb-track-list">
                  {tracks.map((t, i) => (
                    <li key={i} className={i === currentTrackIdx ? 'playing' : ''} onClick={() => playMusic(i)}>
                      {t.name}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          <div className="sb-play-grid" ref={playGridRef}>
            {currentBoard.length === 0 ? (
              <div className="sb-grid-placeholder">Click "Edit Board" to add sounds!</div>
            ) : (
              currentBoard.map(item => (
                <div
                  key={item.id}
                  className={`sb-button-wrapper${!item.soundData ? ' disabled' : ''}`}
                  style={item.color ? { background: item.color, boxShadow: `0 4px 0 rgba(0,0,0,0.28)` } : undefined}
                  onClick={() => playSfx(item)}
                >
                  <div className="sb-button-name">{item.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {colorItem && (
        <>
          <div className="sb-color-backdrop" onClick={() => setColorPickerOpenId(null)} />
          <div className="sb-color-popup" style={{ top: colorPopupPos.top, left: colorPopupPos.left }}>
            <div className="sb-color-popup-title">Button Color</div>
            <div className="sb-color-grid">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  className={`sb-color-option${(colorItem.color ?? '#8BC34A') === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => {
                    setCurrentBoard(prev => prev.map(i => i.id === colorItem.id ? { ...i, color: c } : i));
                    setColorPickerOpenId(null);
                  }}
                />
              ))}
            </div>
            <label className="sb-color-custom-row">
              <span>Custom</span>
              <input
                type="color"
                value={colorItem.color ?? '#8BC34A'}
                onChange={e => setCurrentBoard(prev => prev.map(i => i.id === colorItem.id ? { ...i, color: e.target.value } : i))}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default SoundBoard;
