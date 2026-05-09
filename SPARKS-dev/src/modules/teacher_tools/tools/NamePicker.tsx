import React, { useState, useEffect, useRef } from 'react';
import './NamePicker.css';

const LOCAL_STORAGE_KEY = 'donClassLists';

type DisplayType = 'single' | 'group' | 'all';

interface DisplayState {
  type: DisplayType;
  data: string[] | string[][];
}

interface HistoryEntry {
  names: string[];
  prevDisplay: DisplayState | null;
}

interface NamePickerProps {
  isFullscreen: boolean;
}

const NamePicker: React.FC<NamePickerProps> = ({ isFullscreen }) => {
  const [nameList, setNameList] = useState('');
  const [savedLists, setSavedLists] = useState<Record<string, string>>({});
  const [selectedClass, setSelectedClass] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const [dontPickAgain, setDontPickAgain] = useState(false);
  const [groupSize, setGroupSize] = useState(2);

  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [pickedNames, setPickedNames] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [displayState, setDisplayState] = useState<DisplayState | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [nameDragSrc, setNameDragSrc] = useState<{ groupIdx: number; nameIdx: number } | null>(null);
  const [dropTargetGroupIdx, setDropTargetGroupIdx] = useState<number | null>(null);

  const fireworksRef = useRef<HTMLDivElement>(null);
  const singleNameRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const groupAllRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    setSavedLists(raw ? JSON.parse(raw) : {});
  }, []);

  useEffect(() => {
    const el = singleNameRef.current;
    if (!el || displayState?.type !== 'single') return;
    let size = 96;
    el.style.fontSize = `${size}px`;
    requestAnimationFrame(() => {
      const parent = el.parentElement;
      if (!parent) return;
      while ((el.scrollWidth > parent.clientWidth || el.scrollHeight > parent.clientHeight) && size > 12) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    });
  }, [displayState]);

  useEffect(() => {
    const el = groupRef.current;
    if (!el || displayState?.type !== 'group') return;
    const names = displayState.data as string[];
    const scale = () => {
      let size = 5;
      el.style.fontSize = `${size}rem`;
      let retries = 0;
      const measure = () => {
        if (!groupRef.current) return;
        const parent = el.parentElement;
        if (!parent || parent.clientHeight === 0 || parent.clientWidth === 0) {
          if (retries++ < 15) { requestAnimationFrame(measure); return; }
          el.style.fontSize = '1rem';
          return;
        }
        const basePx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fontFamily = getComputedStyle(el).fontFamily;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const availH = parent.clientHeight;
        const availW = parent.clientWidth - 16;
        const isOverflowing = () => {
          const pxSize = size * basePx;
          ctx.font = `bold ${pxSize}px ${fontFamily}`;
          const totalH = names.length * pxSize * 1.2 + (names.length - 1) * pxSize * 0.1;
          if (totalH > availH - 8) return true;
          return names.some(name => ctx.measureText(name).width > availW);
        };
        while (isOverflowing() && size > 0.3) {
          size = Math.round((size - 0.1) * 100) / 100;
        }
        el.style.fontSize = `${size}rem`;
      };
      requestAnimationFrame(() => requestAnimationFrame(measure));
    };
    scale();
    window.addEventListener('resize', scale);
    return () => window.removeEventListener('resize', scale);
  }, [displayState]);

  useEffect(() => {
    const el = groupAllRef.current;
    if (!el || displayState?.type !== 'all') return;
    const scale = () => {
      let size = 5;
      el.style.fontSize = `${size}rem`;

      let retries = 0;
      const measure = () => {
        if (!groupAllRef.current) return;
        const boxes = Array.from(el.querySelectorAll<HTMLElement>('.np-group-box'));
        // Retry until grid has laid out (clientHeight > 0)
        if (boxes.length === 0 || boxes.some(b => b.clientHeight === 0 || b.clientWidth === 0)) {
          if (retries++ < 15) { requestAnimationFrame(measure); return; }
          el.style.fontSize = '1rem';
          return;
        }

        const basePx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fontFamily = getComputedStyle(el).fontFamily;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const boxData = boxes.map(box => ({
          boxH: box.clientHeight,
          boxW: box.clientWidth,
          names: Array.from(box.querySelectorAll('li')).map(li => li.textContent || ''),
        }));

        const isOverflowing = () => {
          const pxSize = size * basePx;
          ctx.font = `500 ${pxSize}px ${fontFamily}`;
          const lineH   = pxSize * 1.3;
          const liPadV  = pxSize * 0.2;
          const boxPadH = pxSize * 1.2;
          const boxPadV = pxSize * 0.8;
          return boxData.some(({ boxH, boxW, names }) => {
            if (names.length * (lineH + liPadV) + boxPadV > boxH - 4) return true;
            const availW = boxW - boxPadH;
            return names.some(name => ctx.measureText(name).width > availW);
          });
        };

        while (isOverflowing() && size > 0.3) {
          size = Math.round((size - 0.1) * 100) / 100;
        }
        el.style.fontSize = `${size}rem`;
      };

      requestAnimationFrame(() => requestAnimationFrame(measure));
    };
    scale();
    window.addEventListener('resize', scale);
    return () => window.removeEventListener('resize', scale);
  }, [displayState]);

  function parseNames(list: string): string[] {
    return [...new Set(list.split('\n').map(n => n.trim()).filter(Boolean))];
  }

  function resetPickerState(list?: string) {
    setAvailableNames(parseNames(list ?? nameList));
    setPickedNames([]);
    setHistory([]);
    setDisplayState(null);
  }

  function handleNameListChange(value: string) {
    setNameList(value);
    resetPickerState(value);
  }

  function persistLists(lists: Record<string, string>) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
    setSavedLists(lists);
  }

  function handleClassSelect(className: string) {
    setSelectedClass(className);
    const list = className ? (savedLists[className] || '') : '';
    setNameList(list);
    resetPickerState(list);
  }

  function handleSaveClass() {
    const name = newClassName.trim();
    if (!name) return;
    persistLists({ ...savedLists, [name]: nameList });
    setSelectedClass(name);
    setNewClassName('');
    setShowSaveInput(false);
  }

  function handleDeleteClass() {
    if (!selectedClass) return;
    if (!confirm(`Delete the list "${selectedClass}"?`)) return;
    const updated = { ...savedLists };
    delete updated[selectedClass];
    persistLists(updated);
    setSelectedClass('');
    handleNameListChange('');
  }

  function triggerFireworks(count = 1) {
    const container = fireworksRef.current;
    if (!container) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const fw = document.createElement('div');
        fw.className = 'np-firework';
        fw.style.left = `${Math.random() * 100}%`;
        fw.style.top = `${Math.random() * 100}%`;
        const hue = Math.floor(Math.random() * 360);
        for (let j = 0; j < 30 + Math.floor(Math.random() * 20); j++) {
          const p = document.createElement('div');
          p.className = 'np-particle';
          const angle = Math.random() * 360;
          const dist = 50 + Math.random() * 100;
          p.style.setProperty('--transform-end', `translate(${Math.cos(angle * Math.PI / 180) * dist}px, ${Math.sin(angle * Math.PI / 180) * dist}px)`);
          p.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
          fw.appendChild(p);
        }
        container.appendChild(fw);
        setTimeout(() => fw.remove(), 2500);
      }, i * 200);
    }
  }

  function playPickSound() {
    try { new Audio('/teacher_tools/sounds/select.mp3').play(); } catch { /* no-op */ }
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function saveToHistory(names: string[]) {
    setHistory(prev => [...prev, { names, prevDisplay: displayState }]);
  }

  function pickSingleName() {
    if (availableNames.length === 0) {
      setDisplayState({ type: 'single', data: ['All picked!'] });
      return;
    }
    const idx = Math.floor(Math.random() * availableNames.length);
    const name = availableNames[idx];
    saveToHistory([name]);
    if (dontPickAgain) {
      setAvailableNames(prev => prev.filter((_, i) => i !== idx));
      setPickedNames(prev => [...prev, name]);
    }
    setDisplayState({ type: 'single', data: [name] });
    triggerFireworks(3);
    playPickSound();
  }

  function pickOneGroup() {
    if (availableNames.length < groupSize) return;
    const group = shuffle(availableNames).slice(0, groupSize);
    saveToHistory(group);
    if (dontPickAgain) {
      setAvailableNames(prev => prev.filter(n => !group.includes(n)));
      setPickedNames(prev => [...prev, ...group]);
    }
    setDisplayState({ type: 'group', data: group });
    triggerFireworks(4);
    playPickSound();
  }

  function groupAll() {
    if (availableNames.length === 0 || groupSize < 2) return;
    const shuffled = shuffle(availableNames);
    const groups: string[][] = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      groups.push(shuffled.slice(i, i + groupSize));
    }
    saveToHistory([...availableNames]);
    if (dontPickAgain) {
      setPickedNames(prev => [...prev, ...availableNames]);
      setAvailableNames([]);
    }
    setDisplayState({ type: 'all', data: groups });
    triggerFireworks(10);
    playPickSound();
  }

  function undoLastPick() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    if (dontPickAgain) {
      setPickedNames(prev => prev.filter(n => !last.names.includes(n)));
      setAvailableNames(prev => [...new Set([...prev, ...last.names])]);
    }
    setDisplayState(last.prevDisplay);
  }

  function handleDontPickAgainChange(checked: boolean) {
    setDontPickAgain(checked);
    resetPickerState();
  }

  function handleNameDrop(targetGroupIdx: number) {
    if (!nameDragSrc || nameDragSrc.groupIdx === targetGroupIdx) {
      setDropTargetGroupIdx(null);
      return;
    }
    const { groupIdx: srcIdx, nameIdx } = nameDragSrc;
    setDisplayState(prev => {
      if (!prev || prev.type !== 'all') return prev;
      const groups = (prev.data as string[][]).map(g => [...g]);
      const [name] = groups[srcIdx].splice(nameIdx, 1);
      groups[targetGroupIdx].push(name);
      return { ...prev, data: groups.filter(g => g.length > 0) };
    });
    setNameDragSrc(null);
    setDropTargetGroupIdx(null);
  }

  function renderDisplayContent() {
    if (!displayState) return null;
    const { type, data } = displayState;
    if (type === 'single') {
      return (
        <div className="np-picked-name-single" ref={singleNameRef}>
          {(data as string[])[0]}
        </div>
      );
    }
    if (type === 'group') {
      return (
        <div className="np-single-group-container" ref={groupRef}>
          {(data as string[]).map((name, i) => (
            <div key={i} className="np-single-group-member">{name}</div>
          ))}
        </div>
      );
    }
    if (type === 'all') {
      const groups = data as string[][];
      const cols = Math.ceil(Math.sqrt(groups.length));
      return (
        <div
          className="np-group-all-container"
          ref={groupAllRef}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {groups.map((group, gi) => (
            <div
              key={gi}
              className={`np-group-box${dropTargetGroupIdx === gi ? ' np-drop-target' : ''}`}
              onDragOver={e => { e.preventDefault(); setDropTargetGroupIdx(gi); }}
              onDragLeave={() => setDropTargetGroupIdx(null)}
              onDrop={e => { e.preventDefault(); handleNameDrop(gi); }}
            >
              <ul>
                {group.map((name, ni) => (
                  <li
                    key={ni}
                    draggable
                    className={nameDragSrc?.groupIdx === gi && nameDragSrc?.nameIdx === ni ? 'np-dragging-name' : ''}
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.stopPropagation();
                      setNameDragSrc({ groupIdx: gi, nameIdx: ni });
                    }}
                    onDragEnd={() => { setNameDragSrc(null); setDropTargetGroupIdx(null); }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  const canPick = availableNames.length > 0;
  const canUndo = history.length > 0;
  const canReset = pickedNames.length > 0 || history.length > 0 || displayState !== null;

  const displayArea = (
    <div className="np-display-area">
      <div ref={fireworksRef} className="np-fireworks-container" />
      {renderDisplayContent()}
    </div>
  );

  const nameListPanel = (
    <details className="np-collapsible" open={isFullscreen}>
      <summary>Show/Hide Name List</summary>
      <div className="np-collapsible-content">
        <div className="np-class-manager">
          <select className="np-select" value={selectedClass} onChange={e => handleClassSelect(e.target.value)}>
            <option value="">-- New List --</option>
            {Object.keys(savedLists).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button className="tool-btn np-delete-btn" onClick={handleDeleteClass} title="Delete class">🗑️</button>
        </div>

        <textarea
          className="np-name-list"
          placeholder="Paste student names here, one per line..."
          value={nameList}
          onChange={e => handleNameListChange(e.target.value)}
        />

        <div className="np-list-actions">
          {showSaveInput ? (
            <>
              <input
                type="text"
                className="np-save-input"
                placeholder="Class name..."
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveClass()}
                autoFocus
              />
              <button className="tool-btn np-save-confirm-btn" onClick={handleSaveClass}>Save</button>
              <button className="tool-btn np-icon-btn" onClick={() => { setShowSaveInput(false); setNewClassName(''); }}>✕</button>
            </>
          ) : (
            <button className="tool-btn np-save-btn" onClick={() => setShowSaveInput(true)}>💾 SAVE LIST</button>
          )}
        </div>
      </div>
    </details>
  );

  const confirmPopup = showResetConfirm && (
    <div className="np-confirm-overlay">
      <div className="np-confirm-popup">
        <h3>Reset Picker?</h3>
        <p>This will clear all picked names and groups.</p>
        <div className="np-confirm-buttons">
          <button className="tool-btn np-confirm-yes" onClick={() => { resetPickerState(); setShowResetConfirm(false); }}>
            Yes, Reset
          </button>
          <button className="tool-btn np-confirm-no" onClick={() => setShowResetConfirm(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // --- Hub (card) view ---
  if (!isFullscreen) {
    return (
      <div className="name-picker-tool">
        <div className="np-panel">
          {nameListPanel}

          <div className="np-controls">
            <button className="tool-btn np-pick-btn" onClick={pickSingleName} disabled={!canPick}>
              PICK A STUDENT!
            </button>
            <div className="np-bottom-controls">
              <label className="np-dont-pick-label">
                <input type="checkbox" checked={dontPickAgain} onChange={e => handleDontPickAgainChange(e.target.checked)} />
                Don't pick again until list is reset
              </label>
              <button className="tool-btn np-reset-btn" onClick={() => setShowResetConfirm(true)} disabled={!canReset}>
                RESET PICKS
              </button>
            </div>
          </div>

          {dontPickAgain && pickedNames.length > 0 && (
            <div className="np-picked-list">
              <h4>Already Picked ({pickedNames.length}):</h4>
              <ul>
                {[...pickedNames].sort().map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </div>

        {displayArea}
        {confirmPopup}
      </div>
    );
  }

  // --- Fullscreen view ---
  return (
    <div className="name-picker-tool np-fullscreen">
      <div className="np-content">

        <div className="np-panel">
          {nameListPanel}

          <div className="np-controls">
            <button className="tool-btn np-pick-btn" onClick={pickSingleName} disabled={!canPick}>
              PICK A STUDENT!
            </button>

            <div className="np-group-controls">
              <input
                type="number"
                className="np-group-size-input"
                value={groupSize}
                min={2}
                title="Group Size"
                onChange={e => setGroupSize(Math.max(2, parseInt(e.target.value) || 2))}
              />
              <button className="tool-btn np-group-btn" onClick={pickOneGroup} disabled={availableNames.length < groupSize}>
                GROUP
              </button>
              <button className="tool-btn np-group-btn" onClick={groupAll} disabled={!canPick}>
                CLASS
              </button>
              <button className="tool-btn np-icon-btn" onClick={undoLastPick} disabled={!canUndo} title="Undo last pick">
                ↩️
              </button>
            </div>

            <div className="np-bottom-controls">
              <label className="np-dont-pick-label">
                <input
                  type="checkbox"
                  checked={dontPickAgain}
                  onChange={e => handleDontPickAgainChange(e.target.checked)}
                />
                Don't pick again until list is reset
              </label>
              <button className="tool-btn np-reset-btn" onClick={() => setShowResetConfirm(true)} disabled={!canReset}>
                RESET
              </button>
            </div>
          </div>

          {dontPickAgain && pickedNames.length > 0 && (
            <div className="np-picked-list">
              <h4>Already Picked ({pickedNames.length}):</h4>
              <ul>
                {[...pickedNames].sort().map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </div>

        {displayArea}
      </div>

      {confirmPopup}
    </div>
  );
};

export default NamePicker;
