import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Lock, Lightbulb, Check, X, Image as ImageIcon, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const DEFAULT_SET = {
    name: 'Animals (Sample)',
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Fox
    questions: [
        "What color is a banana?", "Name a fruit.", "Count to 5.", "Say hello.",
        "What is it?", "Is it big?", "Can it fly?", "Do you like it?",
        "What sound does a dog make?", "Stand up.", "Sit down.", "Touch your nose.",
        "What is 1 + 1?", "Name a color.", "Spell 'CAT'.", " What time is it?",
        "Do you like pizza?", "Name an animal.", "Touch your head.", "Jump!",
        "Spin around.", "Clap your hands.", "Wink.", "Smile!",
        "Say 'Thank you'.", "Count to 10."
    ]
};

const HiddenPicture = () => {
    // Setup State
    const [gameState, setGameState] = useState('SETUP'); // SETUP, PLAYING, FINISHED
    const [gridSize, setGridSize] = useState(16); // 9, 16, 25
    const [teamCount, setTeamCount] = useState(2);

    // Play State
    const [teams, setTeams] = useState([]); // [{name, score}]
    const [currentTeam, setCurrentTeam] = useState(0);
    const [revealedTiles, setRevealedTiles] = useState([]); // Array of indices
    const [activeTile, setActiveTile] = useState(null); // { index, question } used for modal
    const [guessing, setGuessing] = useState(false); // Guess Picture Modal logic

    // Teacher Mode
    const [customImages, setCustomImages] = useState(() => {
        const saved = localStorage.getItem('hidden_picture_queue');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [showEditor, setShowEditor] = useState(false);
    const [newImageInput, setNewImageInput] = useState('');

    const startGame = () => {
        const newTeams = Array.from({ length: teamCount }, (_, i) => ({
            name: `Team ${i + 1}`,
            score: 0
        }));
        setTeams(newTeams);
        setCurrentTeam(0);
        setRevealedTiles([]);
        setGameState('PLAYING');
        soundManager.play('start');
    };

    const handleTileClick = (index) => {
        if (gameState !== 'PLAYING' || revealedTiles.includes(index)) return;

        const question = DEFAULT_SET.questions[index % DEFAULT_SET.questions.length];
        setActiveTile({ index, question });
        soundManager.play('pop');
    };

    const handleAnswer = (correct) => {
        if (!activeTile) return;

        if (correct) {
            soundManager.play('correct');
            // Update score
            setTeams(prev => {
                const newTeams = [...prev];
                newTeams[currentTeam].score += 10;
                return newTeams;
            });
            // Reveal tile
            setRevealedTiles(prev => [...prev, activeTile.index]);
        } else {
            soundManager.play('wrong');
        }

        // Close modal and next turn
        setActiveTile(null);
        setCurrentTeam(prev => (prev + 1) % teamCount);
    };

    const handleGuessReveal = () => {
        // Award massive points
        setTeams(prev => {
            const newTeams = [...prev];
            newTeams[currentTeam].score += 50;
            return newTeams;
        });

        // Reveal All
        const allIndices = Array.from({ length: gridSize }, (_, i) => i);
        setRevealedTiles(allIndices);

        soundManager.play('win');
        confetti({ particleCount: 200, spread: 100 });

        setGuessing(false);
        setTimeout(() => setGameState('FINISHED'), 2000);
    };

    const gridCols = Math.sqrt(gridSize);

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center p-4">

            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(60,20,150,0.15)_0%,transparent_70%)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(20,50,200,0.1)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-8 z-10 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                {gameState === 'PLAYING' && (
                    <GlossyCard variant="default" className="px-8 py-2 flex gap-4 items-center">
                        <span className="text-[#8D6E63] font-bold uppercase text-xs tracking-widest">Current Turn</span>
                        <motion.span
                            key={currentTeam}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 drop-shadow-sm"
                        >
                            {teams[currentTeam]?.name}
                        </motion.span>
                    </GlossyCard>
                )}

                <div className="flex gap-2">
                    <GlossyButton onClick={() => setShowEditor(true)} variant="pink" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <ImageIcon size={20} />
                    </GlossyButton>
                    <GlossyButton onClick={() => setGameState('SETUP')} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw size={20} />
                    </GlossyButton>
                </div>
            </header>

            <AnimatePresence mode='wait'>
                {gameState === 'SETUP' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-lg z-10"
                    >
                        <GlossyCard variant="default" className="text-center overflow-hidden">
                            <RibbonHeader text="HIDDEN PICTURE" color="purple" icon={<ImageIcon className="w-6 h-6" />} />

                            <div className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Grid Size</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {[9, 16, 25, 36, 64].map(size => (
                                                <GlossyButton
                                                    key={size}
                                                    onClick={() => setGridSize(size)}
                                                    variant={gridSize === size ? "blue" : "default"}
                                                    className="flex-1 min-w-[60px]"
                                                >
                                                    {Math.sqrt(size)}x{Math.sqrt(size)}
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-500 font-bold text-xs uppercase tracking-widest mb-3">Teams</label>
                                        <div className="flex gap-2">
                                            {[2, 3, 4].map(count => (
                                                <GlossyButton
                                                    key={count}
                                                    onClick={() => setTeamCount(count)}
                                                    variant={teamCount === count ? "purple" : "default"}
                                                    className="flex-1"
                                                >
                                                    {count} Teams
                                                </GlossyButton>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <GlossyButton onClick={startGame} variant="green" size="xl" className="w-full py-6 text-2xl">
                                    START GAME
                                </GlossyButton>
                            </div>
                        </GlossyCard>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-4 w-full max-w-7xl h-[80vh] z-10">

                        {/* Game Area (Centered & Maximized) */}
                        <div className="flex-grow flex items-center justify-center p-2 relative overflow-hidden">
                            {/* Grid Container */}
                            <GlossyCard variant="default" className="relative aspect-video w-full h-full max-h-full overflow-hidden shadow-2xl p-2 bg-slate-900">
                                <div
                                    className="w-full h-full relative rounded-xl overflow-hidden"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                                        gridTemplateRows: `repeat(${gridCols}, 1fr)`,
                                        gap: '2px'
                                    }}
                                >
                                    {/* Background Image - Use custom queue if available */}
                                    <img
                                        src={(customImages.length > 0 && customImages[currentImageIdx]) ? customImages[currentImageIdx] : DEFAULT_SET.image}
                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                        alt="Hidden"
                                    />

                                    {/* Tiles Overlay */}
                                    {Array.from({ length: gridSize }).map((_, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{
                                                opacity: revealedTiles.includes(i) ? 0 : 1,
                                                scale: revealedTiles.includes(i) ? 0.8 : 1
                                            }}
                                            transition={{ duration: 0.5 }}
                                            onClick={() => handleTileClick(i)}
                                            disabled={revealedTiles.includes(i)}
                                            whileHover={{ zIndex: 10, scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-slate-800 border-2 border-slate-700/50 flex items-center justify-center text-xl md:text-3xl font-black z-10 hover:bg-slate-700 hover:border-indigo-400 transition-all cursor-pointer relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] text-slate-600 hover:text-white rounded-md"
                                        >
                                            <span className="drop-shadow-md">{i + 1}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </GlossyCard>
                        </div>

                        {/* Bottom Bar: Scoreboard & Controls */}
                        <GlossyCard variant="default" className="w-full p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex gap-4 overflow-x-auto p-1 custom-scrollbar w-full md:w-auto">
                                {teams.map((team, i) => (
                                    <div
                                        key={i}
                                        className={`px-6 py-2 rounded-xl border-2 flex items-center gap-4 transition-all min-w-[160px] ${i === currentTeam ? 'bg-amber-100 border-amber-300 shadow-sm' : 'bg-white/50 border-transparent opacity-70'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${i === currentTeam ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className={`font-bold text-xs uppercase ${i === currentTeam ? 'text-amber-800' : 'text-slate-500'}`}>{team.name}</span>
                                            <span className={`text-2xl font-black ${i === currentTeam ? 'text-amber-600' : 'text-slate-400'}`}>{team.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 border-l border-slate-200 pl-4 w-full md:w-auto justify-end">
                                {(customImages.length > 0) && (
                                    <div className="flex flex-col items-end mr-4">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Queue</span>
                                        <span className="text-slate-700 font-bold">{currentImageIdx + 1} / {customImages.length}</span>
                                    </div>
                                )}
                                <GlossyButton
                                    onClick={() => setGuessing(true)}
                                    variant="orange"
                                    size="lg"
                                    icon={<Lightbulb size={24} />}
                                >
                                    SOLVE
                                </GlossyButton>
                            </div>
                        </GlossyCard>
                    </div>
                )}
            </AnimatePresence>

            {/* Questions Modal */}
            <AnimatePresence>
                {activeTile && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <GlossyCard variant="default" className="text-center overflow-hidden min-h-[400px] flex flex-col">
                                <RibbonHeader text={`Question #${activeTile.index + 1}`} color="blue" />

                                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10">
                                    <p className="text-4xl md:text-6xl font-black text-[#5D4037] leading-tight drop-shadow-sm">
                                        {activeTile.question}
                                    </p>

                                    <div className="grid grid-cols-2 gap-6 w-full">
                                        <GlossyButton onClick={() => handleAnswer(false)} variant="red" size="xl" icon={<X size={32} />}>
                                            WRONG
                                        </GlossyButton>
                                        <GlossyButton onClick={() => handleAnswer(true)} variant="green" size="xl" icon={<Check size={32} />}>
                                            CORRECT
                                        </GlossyButton>
                                    </div>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Guess Modal */}
            <AnimatePresence>
                {guessing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlossyCard variant="orange" className="border-4 border-amber-300">
                                <div className="p-8 text-center space-y-6">
                                    <div className="w-20 h-20 bg-amber-100/50 text-white rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-white/30">
                                        <Lightbulb size={40} />
                                    </div>

                                    <h2 className="text-4xl font-black text-white drop-shadow-md">Solve the Puzzle?</h2>
                                    <p className="text-amber-100 font-bold text-lg">Revealing the picture will award <strong className="text-white text-2xl">50 points</strong>!</p>

                                    <div className="flex flex-col gap-4">
                                        <GlossyButton onClick={handleGuessReveal} variant="white" size="xl" className="text-amber-600">
                                            YES, REVEAL IT!
                                        </GlossyButton>
                                        <GlossyButton onClick={() => setGuessing(false)} variant="default" size="sm" className="bg-black/20 text-white hover:bg-black/30 border-transparent">
                                            Cancel
                                        </GlossyButton>
                                    </div>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                {gameState === 'FINISHED' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg"
                        >
                            <GlossyCard variant="orange" className="border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                                <RibbonHeader text="GAME OVER!" color="red" />
                                <div className="p-8 pb-12 text-center flex flex-col items-center">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                        className="inline-block p-4 bg-yellow-400 rounded-full mb-6 shadow-lg border-2 border-white/20"
                                    >
                                        <Trophy size={64} className="text-white drop-shadow-md" />
                                    </motion.div>

                                    <div className="space-y-4 w-full mb-8">
                                        {[...teams].sort((a, b) => b.score - a.score).map((team, i) => (
                                            <div
                                                key={i}
                                                className={`flex justify-between items-center p-4 rounded-xl border-2 ${i === 0 ? 'bg-white text-amber-600 border-white shadow-md' : 'bg-black/10 text-amber-100 border-black/5'}`}
                                            >
                                                <div className="flex items-center gap-4 text-xl font-black">
                                                    {i === 0 && '👑'} {team.name}
                                                </div>
                                                <span className="text-2xl font-black">{team.score}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <GlossyButton onClick={() => setGameState('SETUP')} variant="white" size="xl" className="w-full text-orange-600">
                                        Start New Game
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-2xl h-[80vh]"
                        >
                            <GlossyCard variant="default" className="h-full flex flex-col">
                                <RibbonHeader text="IMAGE SETTINGS" color="purple" icon={<Settings className="w-5 h-5" />} />

                                <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
                                    <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200">
                                        <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Add Image URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={newImageInput}
                                                onChange={(e) => setNewImageInput(e.target.value)}
                                                placeholder="https://..."
                                                className="flex-grow bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold focus:outline-none focus:border-purple-400 transition"
                                            />
                                            <GlossyButton
                                                onClick={() => {
                                                    if (newImageInput) {
                                                        const updated = [...customImages, newImageInput];
                                                        setCustomImages(updated);
                                                        localStorage.setItem('hidden_picture_queue', JSON.stringify(updated));
                                                        setNewImageInput('');
                                                    }
                                                }}
                                                disabled={!newImageInput}
                                                variant="green" size="sm"
                                            >
                                                ADD
                                            </GlossyButton>
                                        </div>
                                    </div>

                                    <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                        {customImages.length === 0 ? (
                                            <div className="text-center text-slate-400 py-10 italic border-2 border-dashed border-slate-300 rounded-xl">
                                                No images queued. Using default.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                {customImages.map((url, i) => (
                                                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border-4 border-white shadow-sm hover:shadow-md transition">
                                                        <img src={url} alt={`Queue ${i}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                            <GlossyButton
                                                                onClick={() => {
                                                                    if (currentImageIdx === i) setCurrentImageIdx(0);
                                                                    const updated = customImages.filter((_, idx) => idx !== i);
                                                                    setCustomImages(updated);
                                                                    localStorage.setItem('hidden_picture_queue', JSON.stringify(updated));
                                                                }}
                                                                variant="red" size="sm"
                                                            >
                                                                DELETE
                                                            </GlossyButton>
                                                        </div>
                                                        <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">#{i + 1}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center rounded-b-3xl">
                                    <button
                                        onClick={() => {
                                            setCustomImages([]);
                                            localStorage.removeItem('hidden_picture_queue');
                                            setCurrentImageIdx(0);
                                        }}
                                        className="text-red-400 font-bold hover:text-red-500 text-sm px-4"
                                    >
                                        Clear Queue
                                    </button>
                                    <GlossyButton onClick={() => setShowEditor(false)} variant="blue" size="md">
                                        DONE
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default HiddenPicture;
