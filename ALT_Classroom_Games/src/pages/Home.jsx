import { motion } from 'framer-motion';
import { Gamepad2, Mic, Brain, DollarSign, Play, Grid3X3, Hammer, Image as ImageIcon, TrendingUp, Search, Shuffle, Skull, BookOpen, Layers, Music, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlossyCard from '../components/design-system/GlossyCard';
import GlossyButton from '../components/design-system/GlossyButton';
import RibbonHeader from '../components/design-system/RibbonHeader';

const GAMES = [
    { id: 'tornado', title: 'Tornado', icon: <Gamepad2 size={32} />, color: 'red', ribbon: 'QUIZ', desc: 'Teacher-led Quiz' },
    { id: 'jeopardy', title: 'Jeopardy', icon: <DollarSign size={32} />, color: 'blue', ribbon: 'TRIVIA', desc: 'High Stakes' },
    { id: 'wheel', title: 'Spin & Speak', icon: <Mic size={32} />, color: 'green', ribbon: 'SPEAKING', desc: 'Random Qs' },
    { id: 'karuta', title: 'Karuta', icon: <Play size={32} />, color: 'orange', ribbon: 'SPEED', desc: 'Card Race' },
    { id: 'bingo', title: 'Bingo', icon: <Grid3X3 size={32} />, color: 'purple', ribbon: 'LUCK', desc: 'Lucky Numbers' },
    { id: 'vocab-pop', title: 'Vocab Pop', icon: <Hammer size={32} />, color: 'green', ribbon: 'ACTION', desc: 'Whack-a-Mole' },
    { id: 'hidden-picture', title: 'Hidden Pic', icon: <ImageIcon size={32} />, color: 'blue', ribbon: 'GUESS', desc: 'Reveal Image' },
    { id: 'memory-match', title: 'Memory Match', icon: <Brain size={32} />, color: 'orange', ribbon: 'MEMORY', desc: 'Find Pairs' },
    { id: 'snakes-ladders', title: 'Snakes', icon: <TrendingUp size={32} />, color: 'green', ribbon: 'RACE', desc: 'Race to 100!' },
    { id: 'hangman', title: 'Hangman', icon: <Brain size={32} />, color: 'orange', ribbon: 'CLASSIC', desc: 'Guess Word' },
    { id: 'word-search', title: 'Word Search', icon: <Search size={32} />, color: 'blue', ribbon: 'PUZZLE', desc: 'Hidden Words' },
    { id: 'sentence-scramble', title: 'Sentences', icon: <Shuffle size={32} />, color: 'purple', ribbon: 'GRAMMAR', desc: 'Mixer' },
    { id: 'word-detect', title: 'Word Detect', icon: <BookOpen size={32} />, color: 'green', ribbon: 'LOGIC', desc: 'Code Break' },
    { id: 'design-system', title: 'UI Kit', icon: <Layers size={32} />, color: 'blue', ribbon: 'DEV', desc: 'Showcase' },
    { id: 'typing-dead', title: 'Typing Dead', icon: <Skull size={32} />, color: 'red', ribbon: 'HORROR', desc: 'Type to Survive' },
    { id: 'beat-chant', title: 'Beat Chant', icon: <Music size={32} />, color: 'yellow', ribbon: 'RHYTHM', desc: 'Oh-Kay-Lets-Go!' },
];

const FREE_GAMES = ['bingo', 'snakes-ladders', 'karuta', 'memory-match', 'hangman'];

const Home = ({ monetization }) => {
    // Check locked status
    const isLocked = (gameId) => {
        if (!monetization) return false;
        if (FREE_GAMES.includes(gameId)) return false;
        if (gameId === 'design-system') return false;
        return !monetization.isPro && !monetization.isUnlocked(gameId);
    };

    const showBanner = monetization && !monetization.isPro;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 pt-24 pb-32">
            {/* Header Area */}
            <header className="text-center mb-16 relative">

                {showBanner && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-20 w-full max-w-2xl bg-slate-200/50 backdrop-blur border border-white/50 rounded-lg p-2 flex items-center justify-center text-slate-500 text-sm font-mono tracking-widest h-12">
                        AD PLACEMENT
                    </div>
                )}

                <div className="inline-block relative">
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-black text-7xl md:text-9xl text-white drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] tracking-wider"
                        style={{
                            textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                            // Assuming Chewy is loaded
                        }}
                    >
                        CLASSROOM
                        <div className="text-[#FFEB3B] drop-shadow-[0_5px_0_rgba(0,0,0,0.5)]">
                            GAMES
                        </div>
                    </motion.h1>
                </div>
            </header>

            {/* Games Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
                {GAMES.map((game, i) => {
                    const locked = isLocked(game.id);

                    return (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link to={game.id === 'design-system' ? '/design-system' : `/game/${game.id}`} className="block group h-full">
                                <GlossyCard
                                    variant={locked ? 'disabled' : 'default'} /* Need 'disabled' variant support or just override */
                                    className={`h-full transform transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-2 relative overflow-hidden ${locked ? 'opacity-80 grayscale-[0.3]' : ''}`}
                                >
                                    {locked && (
                                        <div className="absolute top-2 right-2 z-20 bg-white/90 rounded-full p-1.5 shadow-md">
                                            <Lock size={16} className="text-slate-500" />
                                        </div>
                                    )}

                                    <RibbonHeader text={game.title} color={game.color} subText={game.ribbon} />

                                    <div className="flex flex-col items-center justify-between h-40 pt-4">
                                        {/* Icon Circle */}
                                        <div className={`p-4 rounded-full bg-white/50 border-4 border-white shadow-inner mb-2`}>
                                            <div className={`text-${game.color}-500 opacity-80`}>
                                                {game.icon}
                                            </div>
                                        </div>

                                        <div className="text-center mb-4">
                                            <p className="text-[#8D6E63] font-bold leading-tight">
                                                {game.desc}
                                            </p>
                                        </div>

                                        <div className="pb-2 w-full">
                                            <GlossyButton
                                                variant={game.color}
                                                size="sm"
                                                className="w-full text-base py-1"
                                                disabled={locked}
                                            >
                                                {locked ? 'LOCKED' : 'PLAY'}
                                            </GlossyButton>
                                        </div>
                                    </div>
                                </GlossyCard>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
