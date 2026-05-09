import React from 'react';
import { Heart, Diamond, Plus, Zap, Divide, Star, Crown, Droplets, Check, X, ArrowRight, Pause, RotateCcw, Home, Menu } from 'lucide-react';
import NeonButton from '../components/design-system/neon-joy/NeonButton';
import NeonCard from '../components/design-system/neon-joy/NeonCard';
import NeonIcon from '../components/design-system/neon-joy/NeonIcon';
import NeonProgressBar from '../components/design-system/neon-joy/NeonProgressBar';
import GlossyButton from '../components/design-system/GlossyButton';
import GlossyCard from '../components/design-system/GlossyCard';
import RibbonHeader from '../components/design-system/RibbonHeader';
import IceButton from '../components/design-system/ice-pop/IceButton';
import IceCard from '../components/design-system/ice-pop/IceCard';
import IceProgressBar from '../components/design-system/ice-pop/IceProgressBar';
import FruitButton from '../components/design-system/fruity-rush/FruitButton';
import FruitCard from '../components/design-system/fruity-rush/FruitCard';
import FruitProgressBar from '../components/design-system/fruity-rush/FruitProgressBar';
import MagnoButton from '../components/design-system/magno/MagnoButton';
import MagnoCard from '../components/design-system/magno/MagnoCard';
import MagnoProgressBar from '../components/design-system/magno/MagnoProgressBar';

const DesignShowcase = () => {
    return (
        <div className="min-h-screen bg-[#1a0b2e] p-8 md:p-16 text-white overflow-auto font-sans">

            <header className="mb-12 text-center">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                    NEON JOY SYSTEM
                </h1>
                <p className="text-slate-400 mt-4 text-lg">Vibrant, candy-colored components for high-energy games.</p>
            </header>

            <div className="max-w-6xl mx-auto space-y-16">

                {/* Section 1: Buttons */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-pink-400 border-b border-pink-500/30 pb-2">01. Action Buttons</h2>
                    <div className="flex flex-wrap gap-6 items-center justify-center p-8 bg-[#2d1b4e]/50 rounded-3xl border border-white/5">
                        <NeonButton variant="blue" size="lg">PLAY</NeonButton>
                        <NeonButton variant="pink" size="md">PAUSE</NeonButton>
                        <NeonButton variant="yellow" size="md">RESTART</NeonButton>
                        <NeonButton variant="orange" size="lg">NEXT</NeonButton>
                        <NeonButton variant="green" size="md">START</NeonButton>
                    </div>
                </section>

                {/* Section 2: Icons */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-cyan-400 border-b border-cyan-500/30 pb-2">02. Neon Icons</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 justify-items-center p-8 bg-[#2d1b4e]/50 rounded-3xl border border-white/5">

                        {/* Round Icons */}
                        <NeonIcon icon={Heart} color="red" shape="circle" />
                        <NeonIcon icon={Diamond} color="pink" shape="circle" />
                        <NeonIcon icon={Plus} color="green" shape="circle" />
                        <NeonIcon icon={Zap} color="blue" shape="circle" />

                        <NeonIcon icon={Crown} color="yellow" shape="circle" />
                        <NeonIcon icon={Star} color="yellow" shape="circle" />

                        {/* Square Icons */}
                        <NeonIcon icon={Home} color="green" shape="square" />
                        <NeonIcon icon={Menu} color="blue" shape="square" />
                        <NeonIcon icon={Pause} color="pink" shape="square" />
                        <NeonIcon icon={RotateCcw} color="blue" shape="square" />
                        <NeonIcon icon={Check} color="green" shape="square" />
                        <NeonIcon icon={X} color="red" shape="square" />
                    </div>
                </section>

                {/* Section 3: Panels & Cards */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-purple-400 border-b border-purple-500/30 pb-2">03. Game Panels</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Score Panel */}
                        <NeonCard variant="blue" className="w-full max-w-sm mx-auto">
                            <div className="flex justify-center mb-4">
                                <span className="bg-pink-500 text-white px-3 py-1 rounded-lg font-bold text-xs uppercase shadow-md border-b-2 border-pink-700">
                                    Level 2
                                </span>
                            </div>

                            {/* Stars */}
                            <div className="flex justify-center gap-2 mb-4">
                                <Star size={48} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                                <Star size={64} className="text-yellow-300 fill-yellow-300 drop-shadow-lg filter brightness-110" />
                                <Star size={48} className="text-slate-600 fill-slate-800" />
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-blue-100 font-bold tracking-widest text-sm mb-1 uppercase">Score</h3>
                                <p className="text-4xl font-black text-white drop-shadow-sm">23,000</p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <NeonIcon icon={RotateCcw} shape="square" size="sm" color="purple" />
                                <NeonButton variant="orange" size="sm" className="min-w-0 px-6">Next</NeonButton>
                            </div>
                        </NeonCard>

                        {/* Win Panel */}
                        <NeonCard variant="blue" className="w-full max-w-sm mx-auto">
                            <div className="relative flex justify-center -mt-10 mb-4">
                                {/* Badge */}
                                <div className="w-24 h-24 bg-yellow-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative z-10">
                                    <span className="text-4xl font-black text-yellow-800">1</span>
                                </div>
                                {/* Ribbons */}
                                <div className="absolute top-10 w-24 h-12 bg-red-500 transform rotate-45 translate-x-6 -z-0 rounded-b-lg border-b-4 border-red-700"></div>
                                <div className="absolute top-10 w-24 h-12 bg-red-500 transform -rotate-45 -translate-x-6 -z-0 rounded-b-lg border-b-4 border-red-700"></div>
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-black text-white mb-1">You Win!</h2>
                                <p className="text-blue-200 text-sm font-bold">SCORE 23000</p>
                            </div>

                            <div className="flex justify-between px-4 bg-black/20 rounded-xl py-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <NeonIcon icon={Crown} size="sm" color="yellow" shape="circle" />
                                    <span className="font-bold text-xl">230</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <NeonIcon icon={Diamond} size="sm" color="pink" shape="circle" />
                                    <span className="font-bold text-xl">30</span>
                                </div>
                            </div>
                        </NeonCard>
                    </div>
                </section>

                {/* Section 4: Progress Bars */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-green-400 border-b border-green-500/30 pb-2">04. Progress Bars</h2>
                    <div className="space-y-6 max-w-2xl mx-auto p-8 bg-[#2d1b4e]/50 rounded-3xl border border-white/5">
                        <NeonProgressBar value={55} color="green" striped />
                        <NeonProgressBar value={25} color="yellow" striped />
                        <NeonProgressBar value={75} color="orange" striped />

                        <div className="h-4"></div>

                        <NeonProgressBar value={100} color="purple" showButton={false} />
                        <NeonProgressBar value={40} color="blue" showButton={false} />
                    </div>
                </section>

                {/* Section 5: Juicy UI (Original) */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-amber-400 border-b border-amber-500/30 pb-2">05. Juicy UI (Wood & Gloss)</h2>
                    <div className="grid md:grid-cols-2 gap-8 items-start">

                        {/* Buttons */}
                        <div className="p-8 bg-slate-800/50 rounded-3xl border border-white/5 flex flex-wrap gap-4 justify-center">
                            <GlossyButton variant="green" size="lg">START</GlossyButton>
                            <GlossyButton variant="red" size="md">STOP</GlossyButton>
                            <GlossyButton variant="blue" size="sm">HELP</GlossyButton>
                            <GlossyButton variant="orange" size="xl">PLAY</GlossyButton>
                        </div>

                        {/* Card */}
                        <GlossyCard variant="default" className="text-center p-8">
                            <RibbonHeader text="LEVEL CLEARED" color="green" />
                            <div className="mt-6 space-y-4">
                                <p className="text-[#8D6E63] font-bold text-xl">Fantastic Job!</p>
                                <div className="flex justify-center gap-2">
                                    <GlossyButton variant="blue" size="sm">Menu</GlossyButton>
                                    <GlossyButton variant="green" size="md">Next</GlossyButton>
                                </div>
                            </div>
                        </GlossyCard>
                    </div>
                </section>

                {/* Section 6: Ice Pop UI */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-cyan-400 border-b border-cyan-500/30 pb-2">06. Ice Pop UI (Casual Gloss)</h2>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Column 1: Buttons & Bars */}
                        <div className="space-y-8">

                            {/* Buttons */}
                            <div className="p-8 bg-cyan-900/20 rounded-3xl border border-cyan-500/30 flex flex-wrap gap-4 justify-center">
                                <IceButton variant="blue" size="lg" icon={<Zap size={20} fill="white" />}>PLAY</IceButton>
                                <IceButton variant="green" size="md" icon={<Check size={18} />}>OK</IceButton>
                                <IceButton variant="pink" size="md" icon={<Heart size={18} fill="white" />}> LIVES</IceButton>
                                <IceButton variant="yellow" size="icon" icon={<Star size={24} fill="white" />} />
                            </div>

                            {/* Progress Bars */}
                            <div className="p-8 bg-cyan-900/20 rounded-3xl border border-cyan-500/30 space-y-6">
                                <IceProgressBar value={80} color="blue" icon="energy" />
                                <IceProgressBar value={45} color="orange" icon="energy" />
                                <IceProgressBar value={100} color="pink" icon="heart" />
                            </div>
                        </div>

                        {/* Column 2: Cards */}
                        <div className="space-y-6">
                            <IceCard variant="blue" title="LEVEL SELECT" className="h-full">
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                                        <IceButton
                                            key={lvl}
                                            variant={lvl <= 3 ? 'blue' : 'blue'}
                                            size="sm"
                                            className={lvl > 3 ? 'opacity-50 grayscale' : ''}
                                        >
                                            {lvl}
                                        </IceButton>
                                    ))}
                                </div>
                            </IceCard>

                            <IceCard variant="beige" title="Settings">
                                <div className="space-y-4 mt-2">
                                    <div className="flex justify-between items-center text-slate-600 font-bold">
                                        <span>MUSIC</span>
                                        <IceButton variant="green" size="sm">ON</IceButton>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600 font-bold">
                                        <span>SOUND</span>
                                        <IceButton variant="red" size="sm">OFF</IceButton>
                                    </div>
                                </div>
                            </IceCard>
                        </div>
                    </div>
                </section>

                {/* Section 7: Fruity Rush UI */}
                <section className="pb-20">
                    <h2 className="text-3xl font-bold mb-8 text-pink-500 border-b border-pink-500/30 pb-2">07. Fruity Rush (Match-3 Style)</h2>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Column 1: Buttons & Bars */}
                        <div className="space-y-8">

                            {/* Buttons */}
                            <div className="p-8 bg-green-900/20 rounded-3xl border border-green-500/30 flex flex-wrap gap-6 justify-center items-center">
                                <FruitButton variant="green" size="lg">PLAY</FruitButton>
                                <FruitButton variant="pink" size="md">EXIT</FruitButton>
                                <div className="flex gap-4">
                                    <FruitButton variant="gold" size="icon" icon={<Check />} />
                                    <FruitButton variant="gold" size="icon" icon={<X />} />
                                </div>
                                <FruitButton variant="blue" size="circle" icon={<Home size={28} />} />
                            </div>

                            {/* Progress Bars */}
                            <div className="p-8 bg-pink-900/20 rounded-3xl border border-pink-500/30 space-y-8">
                                <FruitProgressBar value={80} max={100} variant="pink" icon="heart" />
                                <FruitProgressBar value={350} max={1000} variant="green" icon="energy" />
                                <FruitProgressBar value={5} max={10} variant="blue" icon="gem" />
                            </div>
                        </div>

                        {/* Column 2: Cards */}
                        <div className="space-y-6">
                            <FruitCard variant="pink" title="BONUS" stars={3}>
                                <div className="flex justify-around items-center mt-6 mb-4">
                                    <div className="text-center">
                                        <div className="text-yellow-400 font-black text-2xl drop-shadow-md">2560</div>
                                        <div className="text-white text-xs font-bold opacity-80">COINS</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-pink-200 font-black text-2xl drop-shadow-md">x4</div>
                                        <div className="text-white text-xs font-bold opacity-80">MULTIPLIER</div>
                                    </div>
                                </div>
                                <div className="flex justify-center mt-6">
                                    <FruitButton variant="green" size="md">CLAIM</FruitButton>
                                </div>
                            </FruitCard>

                            <FruitCard variant="green" className="mt-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <FruitButton variant="orange" size="sm" width="full">Options</FruitButton>
                                    <FruitButton variant="blue" size="sm" width="full">Sound</FruitButton>
                                    <FruitButton variant="pink" size="sm" width="full">Music</FruitButton>
                                    <FruitButton variant="green" size="sm" width="full">Help</FruitButton>
                                </div>
                            </FruitCard>
                        </div>
                    </div>
                </section>

                {/* Section 8: Magno UI */}
                <section className="pb-40">
                    <h2 className="text-3xl font-bold mb-8 text-[#FFB300] border-b border-[#FFB300]/30 pb-2">08. Magno (Royal & Ancient)</h2>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Column 1: Buttons & Bars */}
                        <div className="space-y-8">

                            {/* Navigation Buttons */}
                            <div className="p-8 bg-[#2D0A0A] rounded-3xl border border-[#FFB300]/30 flex flex-wrap gap-4 justify-center">
                                <MagnoButton variant="orange" size="lg">PLAY GAME</MagnoButton>
                                <MagnoButton variant="orange" size="md">SHOP</MagnoButton>
                                <MagnoButton variant="orange" size="sm">EXIT</MagnoButton>
                            </div>

                            {/* Circular Action Buttons */}
                            <div className="p-8 bg-[#2D0A0A] rounded-3xl border border-[#FFB300]/30 flex flex-wrap gap-4 justify-center">
                                <MagnoButton size="icon" variant="red" icon={<Pause size={20} />} />
                                <MagnoButton size="icon" variant="purple" icon={<Menu size={20} />} />
                                <MagnoButton size="icon" variant="blue" icon={<RotateCcw size={20} />} />
                                <MagnoButton size="icon" variant="green" icon={<Check size={20} />} />
                                <MagnoButton size="icon" variant="orange" icon={<Zap size={20} />} />
                            </div>

                            {/* Progress Bars */}
                            <div className="p-8 bg-[#2D0A0A] rounded-3xl border border-[#FFB300]/30 space-y-6">
                                <MagnoProgressBar value={120} max={200} color="blue" />
                                <MagnoProgressBar value={75} max={100} color="purple" variant="pellet" />
                                <MagnoProgressBar value={1500} max={2000} color="orange" variant="pellet" pelletCount={40} />
                                <MagnoProgressBar value={40} max={100} color="green" />
                            </div>
                        </div>

                        {/* Column 2: Cards & Modals */}
                        <div className="space-y-8">
                            {/* Settings/Options Card */}
                            <MagnoCard title="OPTIONS" className="w-full">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-4 bg-black/30 p-4 rounded-lg border border-[#FFB300]/20">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#FFB300] font-bold text-sm">SOUND</span>
                                            <MagnoProgressBar value={70} max={100} color="purple" variant="pellet" pelletCount={10} className="w-32" showText={false} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#FFB300] font-bold text-sm">SFX</span>
                                            <MagnoProgressBar value={85} max={100} color="purple" variant="pellet" pelletCount={10} className="w-32" showText={false} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#FFB300] font-bold text-sm">SPEED</span>
                                            <MagnoProgressBar value={45} max={100} color="purple" variant="pellet" pelletCount={10} className="w-32" showText={false} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <MagnoButton variant="orange" width="full">SAVE</MagnoButton>
                                        <MagnoButton variant="orange" width="full">BACK</MagnoButton>
                                    </div>
                                </div>
                            </MagnoCard>

                            {/* Win Modal Style */}
                            <div className="flex justify-center">
                                <MagnoCard title="LEVEL UP" className="max-w-xs text-center">
                                    <div className="py-4 space-y-4">
                                        <div className="flex justify-center gap-2">
                                            <Star size={32} fill="#FFB300" className="text-[#FFB300]" />
                                            <Star size={40} fill="#FFB300" className="text-[#FFB300] -mt-2" />
                                            <Star size={32} fill="#FFB300" className="text-[#FFB300]" />
                                        </div>
                                        <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter drop-shadow-lg">
                                            Amazing!
                                        </h3>
                                        <p className="text-[#FFD54F] font-bold text-sm">SCORE: 15,000</p>
                                        <MagnoButton variant="orange" size="lg" width="full">CLAIM</MagnoButton>
                                    </div>
                                </MagnoCard>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DesignShowcase;
