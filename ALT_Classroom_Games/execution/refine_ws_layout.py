
import os

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

new_content = r"""import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CircleHelp, Search, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';

const WORD_LISTS = {
    ANIMALS: ["LION", "TIGER", "BEAR", "CAT", "DOG", "FISH", "BIRD"],
    FRUIT: ["APPLE", "BANANA", "GRAPE", "MELON", "PEACH", "KIWI", "BERRY"],
    SCHOOL: ["BOOK", "PEN", "DESK", "CHAIR", "RULER", "GLUE", "PAPER"],
    COLORS: ["RED", "BLUE", "GREEN", "PINK", "BLACK", "WHITE", "GOLD"]
};

const GRID_SIZE = 10;
const DIRECTIONS = [
    [0, 1],   // Horizontal right
    [1, 0],   // Vertical down
    [1, 1],   // Diagonal down-right
    [0, -1],  // Horizontal left
    [-1, 0],  // Vertical up
];

const WordSearch = () => {
    const [category, setCategory] = useState("FRUIT");
    const [grid, setGrid] = useState([]);
    const [placedWords, setPlacedWords] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [selection, setSelection] = useState([]); // Array of {r, c}
    const [isSelecting, setIsSelecting] = useState(false);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won
    const [showHelp, setShowHelp] = useState(false);

    const selectionStartRef = useRef(null);

    useEffect(() => {
        initGame();
    }, [category]);

    const initGame = () => {
        const words = WORD_LISTS[category];
        const { newGrid, placed } = generateGrid(words);
        setGrid(newGrid);
        setPlacedWords(placed);
        setFoundWords([]);
        setSelection([]);
        setIsSelecting(false);
        setGameStatus('playing');
        soundManager.play('start');
    };

    const generateGrid = (words) => {
        // Initialize empty grid
        let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        let placed = [];

        // Sort words by length descending
        const sortedWords = [...words].sort((a, b) => b.length - a.length);

        for (let word of sortedWords) {
            let placedWord = false;
            let attempts = 0;
            while (!placedWord && attempts < 100) {
                const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);

                if (canPlace(newGrid, word, r, c, dir)) {
                    const coords = place(newGrid, word, r, c, dir);
                    placed.push({ word, color: getRandomColor(), coords });
                    placedWord = true;
                }
                attempts++;
            }
        }

        // Fill empty spaces
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (newGrid[r][c] === '') {
                    newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }

        return { newGrid, placed };
    };

    const canPlace = (grid, word, r, c, [dr, dc]) => {
        if (r + dr * (word.length - 1) < 0 || r + dr * (word.length - 1) >= GRID_SIZE) return false;
        if (c + dc * (word.length - 1) < 0 || c + dc * (word.length - 1) >= GRID_SIZE) return false;

        for (let i = 0; i < word.length; i++) {
            const cell = grid[r + dr * i][c + dc * i];
            if (cell !== '' && cell !== word[i]) return false;
        }
        return true;
    };

    const place = (grid, word, r, c, [dr, dc]) => {
        const coords = [];
        for (let i = 0; i < word.length; i++) {
            grid[r + dr * i][c + dc * i] = word[i];
            coords.push({ r: r + dr * i, c: c + dc * i });
        }
        return coords;
    };

    const getRandomColor = () => {
        const colors = [
            'bg-red-500/30 border-red-400 text-red-100',
            'bg-blue-500/30 border-blue-400 text-blue-100',
            'bg-green-500/30 border-green-400 text-green-100',
            'bg-yellow-500/30 border-yellow-400 text-yellow-100',
            'bg-purple-500/30 border-purple-400 text-purple-100',
            'bg-pink-500/30 border-pink-400 text-pink-100'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleMouseDown = (r, c) => {
        if (gameStatus !== 'playing') return;
        setIsSelecting(true);
        selectionStartRef.current = { r, c };
        setSelection([{ r, c }]);
    };

    const handleMouseEnter = (r, c) => {
        if (!isSelecting || !selectionStartRef.current) return;

        const start = selectionStartRef.current;
        const dr = r - start.r;
        const dc = c - start.c;

        // Check if diagonal, horizontal, or vertical
        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
            // Valid straight line
            const steps = Math.max(Math.abs(dr), Math.abs(dc));
            const sr = dr === 0 ? 0 : dr / steps;
            const sc = dc === 0 ? 0 : dc / steps;

            const newSelection = [];
            for (let i = 0; i <= steps; i++) {
                newSelection.push({ r: start.r + sr * i, c: start.c + sc * i });
            }
            setSelection(newSelection);
        }
    };

    const handleMouseUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);
        checkSelection();
        setSelection([]);
    };

    const checkSelection = () => {
        const word = selection.map(pos => grid[pos.r][pos.c]).join('');
        const found = placedWords.find(pw => pw.word === word && !foundWords.includes(pw.word));

        if (found) {
            setFoundWords([...foundWords, found.word]);
            soundManager.play('correct');
            // Check win
            if (foundWords.length + 1 === placedWords.length) {
                setGameStatus('won');
                soundManager.play('win');
            }
        } else {
            // Check reverse
            const reverseWord = word.split('').reverse().join('');
            const foundRev = placedWords.find(pw => pw.word === reverseWord && !foundWords.includes(pw.word));
            if (foundRev) {
                setFoundWords([...foundWords, foundRev.word]);
                soundManager.play('correct');
                if (foundWords.length + 1 === placedWords.length) {
                    setGameStatus('won');
                    soundManager.play('win');
                }
            }
        }
    };

    const isSelected = (r, c) => {
        return selection.some(pos => pos.r === r && pos.c === c);
    };
    
    // Check if a cell belongs to a found word
    const getFoundColor = (r, c) => {
        // Iterate through found words objects
        for (let wordStr of foundWords) {
            const wordObj = placedWords.find(pw => pw.word === wordStr);
            if (wordObj) {
                const isPart = wordObj.coords.some(coord => coord.r === r && coord.c === c);
                if (isPart) return wordObj.color;
            }
        }
        return null;
    };

    return (
        <div
            className="h-screen w-full relative overflow-hidden font-sans text-white flex flex-col selection:bg-transparent"
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
        >
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-pink-900/10 to-transparent rounded-full blur-3xl opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-900/10 to-transparent rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header - Fixed Top Bar */}
            <header className="flex-none w-full flex items-center justify-between px-6 py-3 z-20 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition hover:scale-105 border border-white/5">
                        <ArrowLeft className="text-white" size={20} />
                    </Link>
                    <h1 className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                        WORD SEARCH
                    </h1>
                </div>

                <div className="flex gap-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-slate-800 border border-white/10 text-white rounded-lg px-3 py-1.5 font-bold outline-none cursor-pointer hover:bg-slate-700 text-sm"
                    >
                        {Object.keys(WORD_LISTS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button onClick={() => setShowHelp(true)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5">
                        <CircleHelp className="text-white" size={20} />
                    </button>
                    <button onClick={initGame} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5">
                        <RefreshCw className="text-white" size={20} />
                    </button>
                </div>
            </header>

            {/* Content Area - Split View */}
            <div className="flex-1 w-full flex overflow-hidden">
                
                {/* Sidebar - Pinned Left */}
                <div className="w-48 sm:w-64 flex-none bg-slate-900/50 backdrop-blur-sm border-r border-white/5 flex flex-col z-10">
                    <div className="p-4 bg-white/5 border-b border-white/5 font-bold text-slate-400 uppercase tracking-wider text-xs flex justify-between items-center">
                        <span>Word List</span>
                        <span className="text-white bg-slate-700 px-2 py-0.5 rounded-full text-[10px]">{placedWords.length - foundWords.length} left</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {placedWords.map((pw, i) => (
                            <div
                                key={i}
                                className={`
                                    px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 border flex items-center justify-between
                                    ${foundWords.includes(pw.word)
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 opacity-50'
                                    : 'bg-slate-800/40 text-slate-200 border-white/5 hover:bg-slate-800'
                                    }
                                `}
                            >
                                <span>{pw.word}</span>
                                {foundWords.includes(pw.word) && <Trophy size={14} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid - Expands to Fill */}
                <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 md:p-8 bg-slate-900/20 overflow-hidden">
                   <div
                        className="relative touch-none select-none max-w-full max-h-full aspect-square mx-auto shadow-2xl rounded-2xl overflow-hidden bg-slate-900/80 border border-white/10 p-2"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                            gap: '2px',
                            height: 'min(95vh, 95vw)', // Constraint to viewport
                            width: 'min(95vh, 95vw)' // Keep it square using CSS min
                        }}
                    >
                        {grid.map((row, r) => (
                            row.map((cell, c) => {
                                const selected = isSelected(r, c);
                                const foundColor = getFoundColor(r, c);
                                
                                let cellClass = "flex items-center justify-center font-bold rounded-sm cursor-pointer transition-all duration-150 relative text-[clamp(1rem,4vmin,3rem)] ";
                                
                                if (selected) {
                                    cellClass += 'bg-pink-500 text-white z-20 ';
                                } else if (foundColor) {
                                    cellClass += `${foundColor} z-10 `;
                                } else {
                                    cellClass += 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white ';
                                }

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onMouseDown={() => handleMouseDown(r, c)}
                                        onMouseEnter={() => handleMouseEnter(r, c)}
                                        className={cellClass}
                                    >
                                        {cell}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

            </div>

            {/* Win Modal */}
            <AnimatePresence>
                {gameStatus === 'won' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/20 rounded-[2.5rem] p-10 text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <Trophy size={80} className="text-yellow-400 mx-auto mb-6 filter drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />

                            <h2 className="text-4xl font-black mb-4 text-white">ALL FOUND!</h2>
                            <p className="text-slate-400 mb-8">You have eagle eyes!</p>

                            <button
                                onClick={initGame}
                                className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-xl font-black text-xl hover:scale-105 active:scale-95 transition shadow-lg"
                            >
                                PLAY AGAIN
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
             {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black mb-6 text-white text-center">HOW TO PLAY</h2>

                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Find all the words hidden in the grid!
                                <br /><br />
                                Click and drag to highlight words. They can be horizontal, vertical, or diagonal.
                            </p>

                            <button onClick={() => setShowHelp(false)} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/10 transition">
                                GOT IT!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default WordSearch;
"""

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"SUCCESS: Updated {target_file} with refined layout.")
