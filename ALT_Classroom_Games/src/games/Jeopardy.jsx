import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Check, X as XIcon, Settings, DollarSign, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundManager } from '../utils/sound';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';

const DEFAULT_TEAMS = [
    { id: 0, name: "Team 1", score: 0, variant: "blue" },
    { id: 1, name: "Team 2", score: 0, variant: "red" },
    { id: 2, name: "Team 3", score: 0, variant: "green" },
    { id: 3, name: "Team 4", score: 0, variant: "yellow" }
];

const GAME_DATA = {
    'default': {
        name: 'Mixed Review',
        categories: ['Vocabulary', 'Grammar', 'Verbs', 'Numbers', 'Culture'],
        questions: [
            ['What is a synonym of "happy"?', 'What does "noun" mean?', 'Past tense of "run"?', 'What is 15 + 23?', 'What is the capital of Japan?'],
            ['Spell: DICTIONARY', 'Is this correct: "He don\'t like"?', 'Past tense of "eat"?', 'What is 100 - 47?', 'Name a Japanese festival'],
            ['What\'s the opposite of "big"?', 'Plural of "child"?', 'Past tense of "swim"?', '12 × 5 = ?', 'What is sushi?'],
            ['Use "because" in a sentence', 'What is an adjective?', 'Past tense of "go"?', 'What is 50% of 80?', 'Name 3 Japanese cities'],
            ['What does "curious" mean?', 'Fix: "She go to school"', 'Past tense of "write"?', 'What is 7 × 8?', 'What are chopsticks?']
        ]
    }
};

const Jeopardy = () => {
    // Game State
    const [teams, setTeams] = useState(DEFAULT_TEAMS);
    const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
    const [board, setBoard] = useState(() => {
        const saved = localStorage.getItem('jeopardy_board');
        return saved ? JSON.parse(saved) : GAME_DATA['default'];
    });
    const [answered, setAnswered] = useState([]);
    const [dailyDoubles, setDailyDoubles] = useState([]);

    // Editor State
    const [showEditor, setShowEditor] = useState(false);
    const [editBoard, setEditBoard] = useState(null); // Temp state for editing
    const [activeEditCat, setActiveEditCat] = useState(0); // 0-4

    // Modal State
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [wager, setWager] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        setTeams(DEFAULT_TEAMS.map(t => ({ ...t, score: 0 })));
        setAnswered([]);
        setCurrentTeamIdx(0);
        soundManager.play('start');

        const dds = [];
        while (dds.length < 2) {
            const col = Math.floor(Math.random() * 5);
            const row = Math.floor(Math.random() * 5);
            const id = `${col}-${row}`;
            if (!dds.includes(id)) dds.push(id);
        }
        setDailyDoubles(dds);
    };

    const handleTileClick = (col, row, points) => {
        const id = `${col}-${row}`;
        if (answered.includes(id)) return;

        const questionText = board.questions[row][col];
        const questionObj = { col, row, points, text: questionText, id };

        if (dailyDoubles.includes(id)) {
            setActiveQuestion(questionObj);
            setActiveModal('dailydouble');
            soundManager.play('daily_double');
        } else {
            setActiveQuestion(questionObj);
            setActiveModal('question');
            setShowAnswer(false);
            soundManager.play('click');
        }
    };

    const handleWagerSubmit = (amount) => {
        const currentScore = teams[currentTeamIdx].score;
        const maxWager = Math.max(currentScore, 1000);
        const finalWager = Math.min(Math.max(100, amount), maxWager);

        setActiveQuestion(prev => ({ ...prev, points: finalWager }));
        setActiveModal('question');
        setWager(0);
    };

    const handleAnswer = (correct) => {
        const points = activeQuestion.points;
        const teamIdx = currentTeamIdx;

        setTeams(prev => prev.map((t, i) => {
            if (i === teamIdx) {
                return { ...t, score: t.score + (correct ? points : -points) };
            }
            return t;
        }));

        if (correct) {
            soundManager.play('correct');
        } else {
            soundManager.play('wrong');
        }

        setAnswered(prev => [...prev, activeQuestion.id]);

        // Auto-switch turns
        setCurrentTeamIdx(prev => (prev + 1) % teams.length);

        closeModal();
    };

    const closeModal = () => {
        setActiveModal(null);
        setActiveQuestion(null);
        setShowAnswer(false);
    };

    return (
        <div className="h-screen fixed inset-0 overflow-hidden font-sans text-white flex flex-col items-center p-2 pt-4">
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(60,20,150,0.15)_0%,transparent_70%)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(20,50,200,0.1)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-4 z-10 px-4 shrink-0">
                <Link to="/">
                    <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                        Quit
                    </GlossyButton>
                </Link>

                <div className="flex flex-col items-center">
                    <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 drop-shadow-md">
                        JEOPARDY
                    </h1>
                    <span className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">
                        {board.name}
                    </span>
                </div>

                <div className="flex gap-2">
                    <GlossyButton onClick={initGame} variant="green" size="sm" className="w-12 h-12 flex items-center justify-center p-0">
                        <RefreshCw size={20} />
                    </GlossyButton>
                    <GlossyButton
                        onClick={() => {
                            setEditBoard(JSON.parse(JSON.stringify(board)));
                            setActiveEditCat(0);
                            setShowEditor(true);
                        }}
                        variant="orange"
                        size="sm"
                        className="w-12 h-12 flex items-center justify-center p-0"
                    >
                        <Settings size={20} />
                    </GlossyButton>
                </div>
            </header>

            {/* Teams Scoreboard - Compact */}
            <div className="flex gap-3 mb-2 w-full max-w-6xl justify-center overflow-x-auto p-1 shrink-0 scrollbar-hide">
                {teams.map((team, i) => (
                    <GlossyCard
                        key={team.id}
                        variant={team.variant}
                        className={`min-w-[140px] transition-all duration-300 ${currentTeamIdx === i ? 'scale-110 z-10 ring-4 ring-white/50' : 'scale-95 opacity-80'}`}
                        onClick={() => setCurrentTeamIdx(i)}
                    >
                        <div className="flex flex-col items-center py-1 px-4">
                            {currentTeamIdx === i && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase shadow-sm">
                                    Turn
                                </div>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-0.5">
                                {team.name}
                            </span>
                            <div className="flex items-center gap-1">
                                <span className={`text-2xl font-black drop-shadow-md ${team.score < 0 ? 'text-red-200' : 'text-white'}`}>
                                    ${team.score}
                                </span>
                            </div>
                        </div>
                    </GlossyCard>
                ))}
            </div>

            {/* Game Board */}
            <div className="flex-1 w-full max-w-7xl min-h-0 relative z-10 p-2">
                <div className="w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-3 shadow-2xl flex flex-col items-center justify-center">
                    <div className="grid grid-cols-5 grid-rows-[auto_repeat(5,1fr)] gap-2 md:gap-3 w-full h-full">

                        {/* Headers */}
                        {board.categories.map((cat, i) => (
                            <div key={`cat-${i}`} className="bg-gradient-to-b from-blue-900/80 to-blue-950/80 flex items-center justify-center p-2 text-center rounded-xl shadow-inner border border-white/5">
                                <span className="text-[10px] md:text-sm lg:text-base font-black uppercase tracking-tight text-blue-100 leading-none line-clamp-2">
                                    {cat}
                                </span>
                            </div>
                        ))}

                        {/* Questions */}
                        {board.questions.map((rowQuestions, rowIdx) => (
                            rowQuestions.map((q, colIdx) => {
                                const points = (rowIdx + 1) * 100;
                                const id = `${colIdx}-${rowIdx}`;
                                const isAnswered = answered.includes(id);

                                return (
                                    <motion.button
                                        key={id}
                                        whileHover={!isAnswered ? { scale: 1.05, zIndex: 10 } : {}}
                                        whileTap={!isAnswered ? { scale: 0.95 } : {}}
                                        onClick={() => handleTileClick(colIdx, rowIdx, points)}
                                        disabled={isAnswered}
                                        className={`
                                            relative w-full h-full rounded-xl flex items-center justify-center font-black text-2xl md:text-4xl shadow-md border 
                                            transition-all duration-200
                                            ${isAnswered
                                                ? 'bg-slate-800/40 text-slate-600 border-transparent shadow-none cursor-default'
                                                : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-amber-300 border-white/20 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]'}
                                        `}
                                    >
                                        {!isAnswered && (
                                            <>
                                                <span className="drop-shadow-sm">${points}</span>
                                                {/* Shine effect */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-xl" />
                                            </>
                                        )}
                                    </motion.button>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>

            {/* Question Modal */}
            <AnimatePresence>
                {activeModal === 'question' && activeQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <GlossyCard variant="default" className="min-h-[50vh] flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <div className="bg-amber-400 text-slate-900 font-black px-4 py-1 rounded-full text-xl shadow-lg border-2 border-white/50">
                                        ${activeQuestion.points}
                                    </div>
                                </div>

                                <RibbonHeader text={board.categories[activeQuestion.col]} color="blue" />

                                <div className="p-8 md:p-12 text-center flex flex-col justify-center items-center flex-1 gap-8">
                                    <h2 className="text-3xl md:text-5xl font-black text-[#5D4037] leading-tight drop-shadow-sm">
                                        {activeQuestion.text}
                                    </h2>

                                    <AnimatePresence>
                                        {showAnswer && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-green-100 border-2 border-green-400 text-green-800 p-4 rounded-xl font-bold text-2xl shadow-inner"
                                            >
                                                (Teacher Verification Required)
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-4">
                                        <GlossyButton onClick={() => setShowAnswer(!showAnswer)} variant="blue" className="md:col-span-3">
                                            {showAnswer ? "Hide Answer Hints" : "Reveal Answer Hints"}
                                        </GlossyButton>

                                        <GlossyButton onClick={() => handleAnswer(false)} variant="red" size="xl" icon={<XIcon />}>
                                            INCORRECT
                                        </GlossyButton>
                                        {/* Spacer for touch targets or centered layout if needed */}
                                        <div className="hidden md:block"></div>

                                        <GlossyButton onClick={() => handleAnswer(true)} variant="green" size="xl" icon={<Check />}>
                                            CORRECT
                                        </GlossyButton>
                                    </div>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Double Modal */}
            <AnimatePresence>
                {activeModal === 'dailydouble' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-blue-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -5 }} animate={{ scale: 1, rotate: 0 }}
                            className="w-full max-w-2xl text-center"
                        >
                            <GlossyCard variant="orange" className="border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.5)]">
                                <div className="p-8 flex flex-col items-center">
                                    <h2 className="text-6xl md:text-7xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] mb-2 italic transform -skew-x-12">
                                        DAILY
                                    </h2>
                                    <h2 className="text-6xl md:text-7xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] mb-8 italic transform -skew-x-12">
                                        DOUBLE!
                                    </h2>

                                    <p className="text-xl text-yellow-100 mb-6 font-bold">
                                        <span className="text-white bg-black/20 px-3 py-1 rounded-lg">{teams[currentTeamIdx].name}</span>, place your wager!
                                    </p>

                                    <div className="bg-black/20 p-6 rounded-2xl w-full max-w-sm mb-6 border-2 border-white/20">
                                        <div className="text-xs text-white/60 uppercase font-bold mb-2">Max Wager: ${Math.max(teams[currentTeamIdx].score, 1000)}</div>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-300" size={32} />
                                            <input
                                                type="number"
                                                autoFocus
                                                className="w-full bg-transparent border-b-4 border-white/30 py-2 pl-12 pr-4 text-5xl font-black text-white text-center outline-none focus:border-yellow-300 transition placeholder-white/30"
                                                placeholder="0"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleWagerSubmit(parseInt(e.target.value) || 0);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <GlossyButton onClick={() => handleWagerSubmit(1000)} variant="default" size="sm" className="mb-2">
                                        Max it ($1000 min)
                                    </GlossyButton>
                                    <p className="text-xs text-white/50">Press ENTER to confirm</p>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && editBoard && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowEditor(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-5xl h-[85vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <GlossyCard variant="default" className="h-full flex flex-col">
                                <RibbonHeader text="EDITOR" color="purple" icon={<Settings className="w-6 h-6" />} />

                                <div className="flex-1 overflow-hidden flex flex-col p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[#8D6E63] font-bold">Edit Categories & Questions</p>
                                        <GlossyButton
                                            onClick={() => {
                                                if (window.confirm('Reset to default Mixed Review?')) {
                                                    setEditBoard(JSON.parse(JSON.stringify(GAME_DATA['default'])));
                                                }
                                            }}
                                            variant="red" size="sm"
                                        >
                                            Reset Defaults
                                        </GlossyButton>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 custom-scrollbar mb-4">
                                        {editBoard.categories.map((cat, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveEditCat(i)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-b-4 ${activeEditCat === i
                                                    ? 'bg-purple-500 text-white border-purple-700 shadow-md'
                                                    : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300'
                                                    }`}
                                            >
                                                {cat || `Category ${i + 1}`}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Form */}
                                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                            <label className="block text-xs font-bold text-purple-800 uppercase tracking-widest mb-2">Category Name</label>
                                            <input
                                                value={editBoard.categories[activeEditCat]}
                                                onChange={(e) => {
                                                    const newCats = [...editBoard.categories];
                                                    newCats[activeEditCat] = e.target.value;
                                                    setEditBoard({ ...editBoard, categories: newCats });
                                                }}
                                                className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 outline-none font-bold text-slate-700"
                                            />
                                        </div>

                                        {editBoard.questions.map((row, rowIdx) => (
                                            <div key={rowIdx} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-start shadow-sm">
                                                <div className="w-16 pt-3 font-black text-amber-500 text-xl text-center border-r border-slate-100">${(rowIdx + 1) * 100}</div>
                                                <div className="flex-grow">
                                                    <textarea
                                                        value={row[activeEditCat]}
                                                        onChange={(e) => {
                                                            const newQuestions = [...editBoard.questions];
                                                            const newRow = [...newQuestions[rowIdx]];
                                                            newRow[activeEditCat] = e.target.value;
                                                            newQuestions[rowIdx] = newRow;
                                                            setEditBoard({ ...editBoard, questions: newQuestions });
                                                        }}
                                                        rows={2}
                                                        className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-slate-700 font-medium resize-none"
                                                        placeholder={`Question for $${(rowIdx + 1) * 100}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 rounded-b-3xl">
                                    <GlossyButton onClick={() => setShowEditor(false)} variant="red" size="md">
                                        CANCEL
                                    </GlossyButton>
                                    <GlossyButton
                                        onClick={() => {
                                            setBoard(editBoard);
                                            localStorage.setItem('jeopardy_board', JSON.stringify(editBoard));
                                            setShowEditor(false);
                                            initGame();
                                        }}
                                        variant="green"
                                        size="md"
                                    >
                                        SAVE & RESTART
                                    </GlossyButton>
                                </div>
                            </GlossyCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div >
    );
};

export default Jeopardy;
