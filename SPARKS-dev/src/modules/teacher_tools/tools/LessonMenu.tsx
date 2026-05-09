import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LessonMenu.css';
import {
  MenuItem,
  SavedMenus,
  saveLessonMenu,
  getAllLessonMenus,
  deleteLessonMenu,
  importLessonMenus,
} from '../../../utils/db';

// --- Constants ---

const PRESET_ACTIVITIES = [
  'Greeting', 'Warm-up', 'Demo', 'Practice', 'Activity',
  'Speaking', 'Listening', 'Game', 'Quiz', 'Review',
];

function getActivitySlug(text: string): string {
  const slug = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const presetSlugs = PRESET_ACTIVITIES.map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ''));
  if (presetSlugs.includes(slug)) return slug;
  return 'custom';
}

// --- Types ---

interface PresetInput {
  time: string;
  notes: string;
  notesVisible: boolean;
}

interface LessonMenuProps {
  isFullscreen: boolean;
}

// --- Component ---

const LessonMenu: React.FC<LessonMenuProps> = ({ isFullscreen }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menuName, setMenuName] = useState('');
  const [savedMenus, setSavedMenus] = useState<SavedMenus>({});
  const [selectedMenu, setSelectedMenu] = useState('');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [visibleNotes, setVisibleNotes] = useState<Set<number>>(new Set());

  const [presetInputs, setPresetInputs] = useState<Record<string, PresetInput>>(
    () => Object.fromEntries(PRESET_ACTIVITIES.map(a => [a, { time: '', notes: '', notesVisible: false }]))
  );
  const [customInput, setCustomInput] = useState({ text: '', time: '', notes: '', notesVisible: false });

  const displayRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Load saved menus on mount
  useEffect(() => {
    getAllLessonMenus().then(setSavedMenus);
  }, []);

  // Clear isNew flag after animation completes
  useEffect(() => {
    if (!items.some(i => i.isNew)) return;
    const t = setTimeout(() => {
      setItems(prev => prev.map(i => i.isNew ? { ...i, isNew: false } : i));
    }, 700);
    return () => clearTimeout(t);
  }, [items]);

  // Reset panel collapse when entering fullscreen
  useEffect(() => {
    if (isFullscreen) setIsPanelCollapsed(false);
  }, [isFullscreen]);

  // Font size auto-adjustment — desktop fullscreen only
  const adjustFontSize = useCallback(() => {
    const el = displayRef.current;
    if (!el) return;
    if (window.innerWidth <= 768) {
      el.style.removeProperty('--menu-item-font-size');
      return;
    }
    if (!isFullscreen || items.length === 0) return;

    let size = 2.5;
    el.style.setProperty('--menu-item-font-size', `${size}rem`);

    const overflowing = () => {
      if (el.scrollHeight > el.clientHeight) return true;
      return [...el.querySelectorAll('.lm-menu-item')].some(
        item => item.scrollWidth > item.clientWidth + 2
      );
    };

    while (overflowing() && size > 0.8) {
      size -= 0.1;
      el.style.setProperty('--menu-item-font-size', `${size}rem`);
    }
  }, [isFullscreen, items.length]);

  useEffect(() => {
    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [adjustFontSize]);

  // Total time (computed)
  const totalMinutes = items.reduce((sum, item) => {
    const m = item.time?.match(/\d+/);
    return sum + (m ? parseInt(m[0], 10) : 0);
  }, 0);

  // --- Item actions ---

  function addActivity(text: string, time: string, notes: string) {
    if (!text.trim()) return;
    setItems(prev => [...prev, {
      text: text.trim(),
      time: time.trim() || null,
      notes: notes.trim() || null,
      cleared: false,
      isNew: true,
    }]);
  }

  function toggleCleared(index: number) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, cleared: !item.cleared } : item));
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
    setVisibleNotes(prev => {
      const next = new Set<number>();
      prev.forEach(n => { if (n < index) next.add(n); else if (n > index) next.add(n - 1); });
      return next;
    });
  }

  function toggleNotes(index: number) {
    setVisibleNotes(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  // --- Drag & drop ---

  function onDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex !== null && index !== draggedIndex) setDragOverIndex(index);
  }

  function onDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex !== null && index !== draggedIndex) {
      setItems(prev => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(index, 0, moved);
        return next;
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function onDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  // --- DB handlers ---

  async function handleSave() {
    if (!menuName.trim()) { alert('Please enter a name for the menu.'); return; }
    if (items.length === 0) { alert('Please add at least one activity to the menu.'); return; }
    try {
      const clean = items.map(({ isNew, ...rest }) => rest);
      await saveLessonMenu(menuName.trim(), clean);
      alert(`Menu "${menuName.trim()}" saved successfully!`);
      const updated = await getAllLessonMenus();
      setSavedMenus(updated);
      setSelectedMenu(menuName.trim());
    } catch { alert('Error saving menu.'); }
  }

  async function handleDelete() {
    if (!selectedMenu) { alert('Select a saved menu to delete.'); return; }
    if (!confirm(`Are you sure you want to delete the menu "${selectedMenu}"?`)) return;
    await deleteLessonMenu(selectedMenu);
    alert(`Menu "${selectedMenu}" deleted.`);
    setSavedMenus(await getAllLessonMenus());
    setSelectedMenu('');
    setMenuName('');
    setItems([]);
  }

  function handleLoadSelect(name: string) {
    setSelectedMenu(name);
    if (!name) { setItems([]); setMenuName(''); return; }
    const menu = savedMenus[name];
    if (menu) {
      setItems(menu.map(item => ({ ...item, cleared: item.cleared ?? false, notes: item.notes ?? null })));
      setMenuName(name);
    }
  }

  async function handleExport() {
    if (!Object.keys(savedMenus).length) { alert('No saved menus to export.'); return; }
    const blob = new Blob([JSON.stringify(savedMenus, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'don-lesson-menus.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await importLessonMenus(JSON.parse(ev.target?.result as string));
        alert('Menus imported successfully!');
        setSavedMenus(await getAllLessonMenus());
      } catch { alert('Import failed. The file is not valid JSON.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // --- Render helpers ---

  function renderItem(item: MenuItem, index: number, inFullscreen: boolean) {
    const cls = [
      'lm-menu-item',
      draggedIndex === index ? 'dragging' : '',
      dragOverIndex === index ? 'drag-over' : '',
      item.cleared ? 'cleared' : '',
      visibleNotes.has(index) ? 'notes-visible' : '',
      item.isNew ? 'animate-in' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={`${inFullscreen ? 'fs' : 'grid'}-${index}-${item.text}`}
        className={cls}
        data-activity={getActivitySlug(item.text)}
        draggable={inFullscreen}
        onDragStart={inFullscreen ? e => onDragStart(e, index) : undefined}
        onDragOver={inFullscreen ? e => onDragOver(e, index) : undefined}
        onDragLeave={inFullscreen ? () => setDragOverIndex(null) : undefined}
        onDrop={inFullscreen ? e => onDrop(e, index) : undefined}
        onDragEnd={inFullscreen ? onDragEnd : undefined}
        onClick={e => {
          if ((e.target as HTMLElement).closest('button, .lm-item-drag-handle')) return;
          toggleCleared(index);
        }}
      >
        {inFullscreen && <span className="lm-item-drag-handle">☰</span>}
        <span className="lm-item-text">{item.text}</span>
        {item.time && <span className="lm-item-time">{item.time}</span>}
        <div className="lm-item-controls">
          <button
            className="lm-item-notes-btn"
            title="Toggle Notes"
            onClick={e => { e.stopPropagation(); toggleNotes(index); }}
          >📝</button>
          <button
            className="lm-item-check-btn"
            title="Mark as Completed"
            onClick={e => { e.stopPropagation(); toggleCleared(index); }}
          >✓</button>
          {inFullscreen && (
            <button
              className="lm-item-delete"
              title="Remove item"
              onClick={e => { e.stopPropagation(); removeItem(index); }}
            >×</button>
          )}
        </div>
        <img src="/teacher_tools/assets/lesson-menu/clear-stamp.png" className="lm-item-stamp" alt="" />
        {item.notes && <div className="lm-item-notes">{item.notes}</div>}
      </div>
    );
  }

  const placeholder = (
    <div className="lm-placeholder">
      {isFullscreen
        ? 'Add an activity from the panel to start building your menu!'
        : 'Go fullscreen to build your lesson menu!'}
    </div>
  );

  return (
    <div className={`lesson-menu-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>

      {/* === Compact card view (non-fullscreen) === */}
      {!isFullscreen && (
        <div className="lm-display-area" id="lm-menu-display-grid">
          {items.length === 0 ? placeholder : items.map((item, i) => renderItem(item, i, false))}
        </div>
      )}

      {/* === Fullscreen view === */}
      {isFullscreen && (
        <div className={`lm-fullscreen-view${isPanelCollapsed ? ' panel-collapsed' : ''}`}>

          {/* Left controls panel */}
          <div id="lm-controls-panel">
            <div className="lm-controls-content">
              <h4>Lesson Menu</h4>

              {/* Save / Load */}
              <details className="lm-collapsible-section" open>
                <summary>Save / Load Menus</summary>
                <div className="lm-save-load-controls">
                  <select value={selectedMenu} onChange={e => handleLoadSelect(e.target.value)}>
                    <option value="">-- New Menu --</option>
                    {Object.keys(savedMenus).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Menu name..."
                    value={menuName}
                    onChange={e => setMenuName(e.target.value)}
                  />
                  <div className="lm-button-group">
                    <button className="tool-btn" onClick={handleSave} title="Save">💾</button>
                    <button className="tool-btn" onClick={handleDelete} title="Delete">🗑️</button>
                    <button className="tool-btn" onClick={handleExport} title="Export">📤</button>
                    <label className="button-like-label tool-btn" title="Import" style={{ cursor: 'pointer' }}>
                      📥
                      <input
                        ref={importRef}
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImport}
                      />
                    </label>
                  </div>
                </div>
              </details>

              {/* Add Activities */}
              <details className="lm-collapsible-section" open>
                <summary>Add Activities</summary>
                <div className="lm-add-activities-content">

                  {/* Preset activity buttons */}
                  <div className="lm-activity-buttons">
                    {PRESET_ACTIVITIES.map(activity => {
                      const inp = presetInputs[activity];
                      return (
                        <div key={activity} className="lm-activity-item-wrapper">
                          <div className="lm-activity-item">
                            <button onClick={() => {
                              addActivity(activity, inp.time, inp.notes);
                              setPresetInputs(prev => ({
                                ...prev,
                                [activity]: { time: '', notes: '', notesVisible: false },
                              }));
                            }}>
                              {activity}
                            </button>
                            <input
                              type="text"
                              className="lm-time-input"
                              placeholder="Time?"
                              value={inp.time}
                              onChange={e => setPresetInputs(prev => ({
                                ...prev,
                                [activity]: { ...prev[activity], time: e.target.value },
                              }))}
                            />
                            <button
                              className="lm-notes-toggle-btn"
                              onClick={() => setPresetInputs(prev => ({
                                ...prev,
                                [activity]: { ...prev[activity], notesVisible: !prev[activity].notesVisible },
                              }))}
                            >📝</button>
                          </div>
                          {inp.notesVisible && (
                            <textarea
                              className="lm-notes-input"
                              placeholder={`Notes for ${activity}...`}
                              value={inp.notes}
                              onChange={e => setPresetInputs(prev => ({
                                ...prev,
                                [activity]: { ...prev[activity], notes: e.target.value },
                              }))}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom activity */}
                  <div className="lm-custom-activity-wrapper">
                    <h4>Custom Activity</h4>
                    <div className="lm-activity-item">
                      <input
                        type="text"
                        placeholder="Activity name..."
                        value={customInput.text}
                        onChange={e => setCustomInput(prev => ({ ...prev, text: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="lm-time-input"
                        placeholder="Time?"
                        value={customInput.time}
                        onChange={e => setCustomInput(prev => ({ ...prev, time: e.target.value }))}
                      />
                      <button
                        className="lm-notes-toggle-btn"
                        onClick={() => setCustomInput(prev => ({ ...prev, notesVisible: !prev.notesVisible }))}
                      >📝</button>
                      <button
                        id="lm-add-custom-btn"
                        onClick={() => {
                          addActivity(customInput.text, customInput.time, customInput.notes);
                          setCustomInput({ text: '', time: '', notes: '', notesVisible: false });
                        }}
                      >+</button>
                    </div>
                    {customInput.notesVisible && (
                      <textarea
                        className="lm-notes-input"
                        placeholder="Notes for custom activity..."
                        value={customInput.notes}
                        onChange={e => setCustomInput(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    )}
                  </div>

                  {/* Total time */}
                  <div className="lm-total-time-display">
                    <h4>Total Planned Time: <span className="lm-total-time-value">{totalMinutes} min</span></h4>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Panel collapse toggle */}
          <button
            id="lm-panel-toggle-btn"
            onClick={() => setIsPanelCollapsed(prev => !prev)}
            title={isPanelCollapsed ? 'Show Panel' : 'Hide Panel'}
          >
            {isPanelCollapsed ? '»' : '«'}
          </button>

          {/* Menu display area */}
          <div className="lm-display-area" ref={displayRef} id="lm-menu-display-fullscreen">
            {items.length === 0 ? placeholder : items.map((item, i) => renderItem(item, i, true))}
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonMenu;
