import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NeonCard from '../../components/neon/NeonCard';
import NeonButton from '../../components/neon/NeonButton';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../hooks/useWallet';
import { ADMIN_EMAIL } from '../../constants/admin';
import LanguageToggle from '../../components/common/LanguageToggle';
import './DashboardApp.css';

const DashboardApp: React.FC = () => {
    const { user, logout } = useAuth();
    const { sparks } = useWallet();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // For now, treat all authenticated users as 'staff' equivalent for seeing apps
    // Later we can implement proper role checks
    const isAuthenticated = !!user;

    // Quick Admin check (replace with real role later)
    const isAdmin = user?.email === ADMIN_EMAIL;

    return (
        <div className="dashboard-app min-h-screen w-full relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
            {/* User Info Bar */}
            <div className="user-info z-50">
                <LanguageToggle />
                {user ? (
                    <>
                        {isAdmin && <a href="/admin" className="admin-link">Admin</a>}
                        <span className="user-greeting font-bold text-sm md:text-lg drop-shadow-md">
                            Welcome, {user.user_metadata?.full_name || user.email}! ({sparks} Sparks)
                        </span>
                        <NeonButton variant="orange" size="sm" onClick={handleLogout}>Logout</NeonButton>
                    </>
                ) : (
                    <Link to="/login">
                        <NeonButton variant="orange" size="sm">Login</NeonButton>
                    </Link>
                )}
            </div>

            <div className="hub-container relative z-10 py-8 md:py-12 px-4">
                <div className="hub-header mb-8 md:mb-12 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        {/* <img src="/assets/bp-labo.png" alt="BP LABO Logo" ... /> Replaced */}
                        <div className="flex flex-col items-center justify-center mb-4">
                            <h1 className="text-4xl md:text-6xl font-black text-orange-500 tracking-tighter drop-shadow-lg">SPARKS</h1>
                            <span className="text-base md:text-xl text-teal-200 font-light tracking-widest uppercase">Teacher Tools</span>
                        </div>
                    </motion.div>
                    <p className="hub-subtitle text-base md:text-2xl text-white font-bold drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
                        Explore our collection of interactive educational experiences
                    </p>

                    {!user && (
                        <div className="mt-8">
                            <Link to="/login">
                                <NeonButton variant="green" size="lg">Login / Register</NeonButton>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="apps-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">


                    {/* TEACHER TOOLS - Authenticated Users */}
                    {isAuthenticated && (
                        <Link to="/teacher-tools" className="no-underline">
                            <NeonCard variant="purple" className="h-[420px] hover:scale-105 transition-transform duration-300">
                                <div className="flex flex-col items-center h-full text-white">
                                    <div className="rounded-full border-4 border-white/30 overflow-hidden w-40 h-40 mb-6 shadow-lg bg-black/20">
                                        <video src="/assets/bp-tools.mp4" className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 drop-shadow-md tracking-wider">Tools & Games</h3>
                                    <p className="text-center opacity-90 text-lg font-medium leading-relaxed">
                                        Expanded toolkit for classroom interactivity.
                                    </p>
                                </div>
                            </NeonCard>
                        </Link>
                    )}

                    {/* CLASSROOM GAMES - Hidden */}
                    {false && (
                        <a href="/classroom_games/index.html" className="no-underline">
                            <NeonCard variant="pink" className="h-[420px] hover:scale-105 transition-transform duration-300">
                                <div className="flex flex-col items-center h-full text-white">
                                    <div className="rounded-full border-4 border-white/30 overflow-hidden w-40 h-40 mb-6 shadow-lg bg-black/20">
                                        <video src="/assets/bp-welcome.mp4" className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase mb-3 drop-shadow-md tracking-wider">Classroom Games</h3>
                                    <p className="text-center opacity-90 text-lg font-medium leading-relaxed">
                                        Fun and interactive games for the classroom.
                                    </p>
                                </div>
                            </NeonCard>
                        </a>
                    )}

                    {/* BP EXPO (DISCOVERY) - Hidden */}
                    {false && (
                        <Link to="/discovery" className="no-underline">
                            <NeonCard variant="orange" className="h-[420px] hover:scale-105 transition-transform duration-300">
                                <div className="flex flex-col items-center h-full text-white">
                                    <div className="rounded-full border-4 border-white/30 overflow-hidden w-40 h-40 mb-6 shadow-lg bg-black/20">
                                        <video src="/assets/bp-expo.mp4" className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase mb-3 drop-shadow-md tracking-wider">BP Expo</h3>
                                    <p className="text-center opacity-90 text-lg font-medium leading-relaxed">
                                        Travel the world and discover different countries, cultures, and traditions.
                                    </p>
                                </div>
                            </NeonCard>
                        </Link>
                    )}

                    {/* BP TANGO - Authenticated Users */}
                    {isAuthenticated && (
                        <Link to="/tango" className="no-underline">
                            <NeonCard variant="green" className="h-[420px] hover:scale-105 transition-transform duration-300">
                                <div className="flex flex-col items-center h-full text-white">
                                    <div className="rounded-full border-4 border-white/30 overflow-hidden w-40 h-40 mb-6 shadow-lg bg-black/20">
                                        <video src="/assets/bp-tango.mp4" className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 drop-shadow-md tracking-wider">Word Box</h3>
                                    <p className="text-center opacity-90 text-lg font-medium leading-relaxed">
                                        Master English vocabulary with interactive, grade-aligned flashcards.
                                    </p>
                                </div>
                            </NeonCard>
                        </Link>
                    )}

                    {/* BP PLANNER - Authenticated Users (Staff Only Later) */}
                    {isAuthenticated && (
                        <Link to="/planner" className="no-underline">
                            <NeonCard variant="dark" className="h-[420px] hover:scale-105 transition-transform duration-300">
                                <div className="flex flex-col items-center h-full text-white">
                                    <div className="rounded-full border-4 border-white/30 overflow-hidden w-40 h-40 mb-6 shadow-lg bg-black/20">
                                        <video src="/assets/bp-planner.mp4" className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 drop-shadow-md tracking-wider">Build & Link</h3>
                                    <p className="text-center opacity-90 text-lg font-medium leading-relaxed">
                                        AI-powered lesson plan builder and curriculum assistant.
                                    </p>
                                </div>
                            </NeonCard>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardApp;
