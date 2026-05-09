
import re

sl_path = r"d:\ALT_Classroom_Games\src\games\SnakesAndLadders.jsx"

with open(sl_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to change the return JSX structure completely.
# It is currently:
# return (
#   <div className="min-h-screen ... flex flex-col ...">
#      <Atmosphere />
#      <Header />
#      <AnimatePresence>
#          {SETUP ? ... : (
#             <div className="flex flex-col ...">
#                 <Board />
#                 <Controls />
#             </div>
#          )}
#      </AnimatePresence>
#      ... Modals ...
#   </div>
# )

# We want:
# return (
#   <div className="min-h-screen ... flex flex-row ...">  <-- Maybe just flex items-stretch?
#      <Atmosphere />
#      
#      {gameState === 'PLAYING' && (
#         <Sidebar>
#            <HeaderButtons /> (Maybe keep header on top or move to sidebar?)
#            <PlayerList />
#            <DiceContainer />
#         </Sidebar>
#      )}
#
#      <MainArea>
#         {SETUP ? ... : <Board />}
#      </MainArea>
#      ...
#   </div>
# )

# However, SETUP mode is centered.
# Let's keep the outer container as flex-col or whatever, but when PLAYING, we change the layout.
# Actually, the user wants a sidebar on the left.
# Let's make the main container `flex h-screen overflow-hidden`.
# Sidebar (Left): Fixed width or flex-shrink-0.
# Main (Right): Flex-grow.

# Strategy: Replace the entire `return (...)` block.

new_return_jsx = r"""return (
        <div className="h-screen w-full relative overflow-hidden font-sans text-white bg-slate-900 flex">
            
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent rounded-full blur-3xl opacity-50" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-900/20 to-transparent rounded-full blur-3xl opacity-50" />
            </div>

            <AnimatePresence mode='wait'>
                {gameState === 'SETUP' ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-12 rounded-[2rem] max-w-lg w-full text-center relative overflow-hidden"
                        >
                             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            <motion.div
                                animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="mb-8 inline-block p-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                            >
                                <TrendingUp size={64} className="text-indigo-400" />
                            </motion.div>

                            <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 drop-shadow-lg">
                                Snakes & Ladders
                            </h1>
                            <p className="text-slate-400 text-lg mb-10">Classic race to 100!</p>

                            <div className="space-y-6 mb-10">
                                <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Select Players</label>
                                <div className="flex gap-4">
                                    {[2, 3, 4].map(count => (
                                        <button
                                            key={count}
                                            onClick={() => setTeamCount(count)}
                                            className={`
                                                flex-1 py-4 rounded-xl font-black text-xl transition-all duration-300 border
                                                ${teamCount === count
                                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-105'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/30'
                                                }
                                            `}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-black text-2xl text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-emerald-400/50"
                            >
                                START GAME
                            </button>
                        </div>
                            <div className="mt-8 flex justify-center">
                                <Link to="/" className="text-slate-500 hover:text-white transition flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back to Menu
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex w-full h-full">
                        {/* LEFT SIDEBAR: Controls & Players */}
                        <div className="w-80 shrink-0 h-full glass-panel border-r border-white/10 p-6 flex flex-col gap-6 relative z-20 bg-slate-900/80 backdrop-blur-xl">
                            
                            {/* Header / Meta Actions */}
                            <div className="flex items-center justify-between">
                                <Link to="/" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                                    <ArrowLeft size={20} />
                                </Link>
                                <div className="flex gap-2">
                                     <button onClick={() => setShowTeacherMode(true)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                                        <Settings size={20} />
                                    </button>
                                    <button onClick={() => setGameState('SETUP')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Current Turn Indicator */}
                            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Turn</span>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${players[currentPlayer]?.color.bg} shadow-[0_0_10px_currentColor]`} />
                                    <span className={`text-2xl font-black ${players[currentPlayer]?.color.text}`}>
                                        {players[currentPlayer]?.name}
                                    </span>
                                </div>
                            </div>

                            {/* Dice Area (Expanded) */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                                <div className="w-64 h-64 relative bg-slate-800/50 rounded-3xl border-2 border-white/10 shadow-inner overflow-hidden">
                                     <ThreeDice rolling={isRolling} onResult={handleDiceRollComplete} />
                                     {!isRolling && gameState !== 'FINISHED' && (
                                        <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                                            <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Tap to Roll</span>
                                        </div>
                                     )}
                                     <div
                                        className="absolute inset-0 cursor-pointer z-10"
                                        onClick={rollDice}
                                    />
                                </div>
                                {diceValue && !isRolling && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 text-4xl font-black text-white drop-shadow-lg"
                                    >
                                        Rolled: {diceValue}
                                    </motion.div>
                                )}
                            </div>

                            {/* Players List (Vertical) */}
                            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[30vh]">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider px-2">Scoreboard</label>
                                {players.map((p, i) => (
                                    <div
                                        key={i}
                                        className={`
                                            flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-300
                                            ${i === currentPlayer
                                                ? `bg-white/10 border-white/30 shadow-lg`
                                                : 'bg-white/5 border-transparent opacity-60'}
                                        `}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${p.color.bg} flex items-center justify-center border border-white/20`}>
                                            <span className="font-bold text-white text-[10px]">{p.id + 1}</span>
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className={`font-bold text-sm ${i === currentPlayer ? 'text-white' : 'text-slate-400'}`}>
                                                {p.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-white/50">Pos: {p.position} | Score: {p.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT AREA: Game Board */}
                        <div className="flex-grow h-full flex items-center justify-center p-6 relative overflow-hidden bg-slate-900/50">
                             <div className="w-full h-full max-w-[90vh] max-h-[90vh] aspect-square relative glass-panel rounded-3xl border border-white/10 shadow-2xl p-4">
                                <div
                                    id="board"
                                    ref={boardRef}
                                    className="relative grid w-full h-full aspect-square rounded-xl shadow-2xl overflow-hidden"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(10, 1fr)',
                                        gridTemplateRows: 'repeat(10, 1fr)',
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                                    }}
                                >
                                    {/* SVG Lines */}
                                    <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible mix-blend-screen">
                                        {svgLines.map((line, i) => (
                                            <motion.line
                                                key={i}
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 0.6 }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                                                stroke={line.type === 'snake' ? '#ef4444' : '#10b981'}
                                                strokeWidth="1.5%"
                                                strokeLinecap="round"
                                                strokeDasharray={line.type === 'snake' ? "8, 12" : "0"}
                                                className="drop-shadow-[0_0_5px_currentColor]"
                                            />
                                        ))}
                                    </svg>

                                    {/* Cells */}
                                    {gridCells.map(num => (
                                        <div
                                            key={num}
                                            ref={el => cellsRef.current[num] = el}
                                            className={`
                                                relative flex items-center justify-center font-bold text-[10px] sm:text-xs md:text-sm lg:text-base border-[0.5px] border-white/5
                                                ${num === 100 ? 'bg-yellow-500/20 text-yellow-400 shadow-[inset_0_0_20px_rgba(250,204,21,0.3)]' : ''}
                                                ${num === 1 ? 'bg-green-500/20 text-green-400' : ''}
                                                ${(num !== 1 && num !== 100) ? 'text-slate-600' : ''}
                                            `}
                                        >
                                            <span className={`opacity-80 z-0 ${num === 100 ? 'scale-150 font-black' : ''}`}>{num}</span>
                                            {cellPoints[num] && (
                                                <div className="absolute top-0 right-0 p-0.5 text-[8px] text-amber-300 font-black">+{cellPoints[num]}</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Players */}
                                    <div className="absolute inset-0 pointer-events-none w-full h-full grid grid-cols-10 grid-rows-10">
                                        {gridCells.map(num => (
                                            <div key={num} className="relative flex items-center justify-center">
                                                <div className="flex flex-wrap justify-center items-center w-full h-full p-1">
                                                    {players.filter(p => p.position === num).map(p => (
                                                        <motion.div
                                                            layoutId={`player-${p.id}`}
                                                            key={p.id}
                                                            className={`
                                                                w-[30%] h-[30%] min-w-[12px] min-h-[12px] rounded-full ${p.color.bg} border-2 border-white shadow-lg z-20 mx-[1px]
                                                                ${p.col?.shadow || ''}
                                                            `}
                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                        >
                                                            {players[currentPlayer].id === p.id && (
                                                                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-50" />
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

             {/* Win Modal */}
            <AnimatePresence>
                {gameState === 'FINISHED' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="glass-panel p-12 rounded-[3rem] max-w-2xl w-full text-center relative overflow-hidden border-2 border-amber-400/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                            <confetti size={40} className="absolute top-0 left-1/2 -translate-x-1/2" />

                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                className="inline-block p-8 bg-amber-500/20 rounded-full mb-8 shadow-[0_0_50px_rgba(245,158,11,0.4)]"
                            >
                                <Trophy size={80} className="text-amber-400" />
                            </motion.div>

                            <h2 className="text-6xl font-black text-white mb-4 drop-shadow-lg">WINNER!</h2>
                            <h3 className={`text-5xl font-black mb-12 ${players[currentPlayer].color.text} drop-shadow-[0_0_20px_currentColor]`}>
                                {players[currentPlayer].name}
                            </h3>

                            <button
                                onClick={() => setGameState('SETUP')}
                                className="px-12 py-5 bg-white text-slate-900 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Question Modal */}
            <AnimatePresence>
                {showQuestionModal && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/20 p-8 rounded-[2rem] max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
                        >
                            <div className="mb-6">
                                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4 ${pendingMove?.type === 'ladder' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {pendingMove?.type === 'ladder' ? 'LADDER CHALLENGE!' : 'SNAKE DEFENSE!'}
                                </span>
                                <h2 className="text-3xl font-black text-white mb-2">{currentQuestion.q}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleQuestionAnswer(true)}
                                    className="p-6 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl group transition-all"
                                >
                                    <Check className="mx-auto mb-2 text-green-400 group-hover:scale-110 transition" size={32} />
                                    <span className="font-bold text-green-300">Correct</span>
                                </button>
                                <button
                                    onClick={() => handleQuestionAnswer(false)}
                                    className="p-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl group transition-all"
                                >
                                    <X className="mx-auto mb-2 text-red-400 group-hover:scale-110 transition" size={32} />
                                    <span className="font-bold text-red-300">Incorrect</span>
                                </button>
                            </div>

                            <div className="mt-6 text-sm text-slate-500">
                                Answer: <span className="font-bold text-slate-300 blur-sm hover:blur-none transition-all cursor-help">{currentQuestion.a}</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Teacher Mode Modal */}
            <AnimatePresence>
                {showTeacherMode && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                    <Settings /> Edit Questions
                                </h2>
                                <button onClick={() => setShowTeacherMode(false)} className="p-2 hover:bg-white/10 rounded-full transition">X</button>
                            </div>

                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-6">
                                <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">New Question</label>
                                <div className="space-y-3">
                                    <input
                                        value={newQuestion.q}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, q: e.target.value })}
                                        placeholder="Question"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            value={newQuestion.a}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, a: e.target.value })}
                                            placeholder="Answer"
                                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                        />
                                        <button
                                            onClick={() => {
                                                if (newQuestion.q && newQuestion.a) {
                                                    const updated = [...questions, { ...newQuestion, id: Date.now() }];
                                                    setQuestions(updated);
                                                    localStorage.setItem('snakes_questions', JSON.stringify(updated));
                                                    setNewQuestion({ q: '', a: '' });
                                                }
                                            }}
                                            disabled={!newQuestion.q || !newQuestion.a}
                                            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                                        >
                                            ADD
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {questions.map((q, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-white/10 transition">
                                        <div>
                                            <div className="font-bold text-white mb-1">{q.q}</div>
                                            <div className="text-sm text-green-400">A: {q.a}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updated = questions.filter((_, idx) => idx !== i);
                                                setQuestions(updated);
                                                localStorage.setItem('snakes_questions', JSON.stringify(updated));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );"""

# Replace the block
content = re.sub(r"return \(\s*<div className=\"min-h-screen.+?\);\n\};", new_return_jsx + "\n};", content, flags=re.DOTALL)

with open(sl_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Refactored layout in {sl_path}")
