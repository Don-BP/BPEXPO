import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import GlossyButton from '../design-system/GlossyButton';

const Navbar = () => {
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const isHome = location.pathname === '/';
    // Hide standard navbar for games that have their own embedded UI or fullscreen needs
    // We might want to standardize this eventually
    const hideNav = location.pathname.includes('/game/');

    if (hideNav) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Left Area: Back Button */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    {!isHome ? (
                        <Link to="/">
                            <div className="transform hover:scale-110 transition-transform active:scale-95">
                                <div className="bg-gradient-to-b from-[#4FACFE] to-[#00F2FE] p-3 rounded-full border-b-4 border-[#005596] shadow-lg text-white">
                                    <ArrowLeft size={28} strokeWidth={3} />
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <a href="/">
                            <GlossyButton variant="blue" size="sm" icon={<ArrowLeft size={20} />}>
                                Back to BP-Labo
                            </GlossyButton>
                        </a>
                    )}
                </div>

                {/* Right Actions: Theme Toggle */}
                <div className="flex gap-4 pointer-events-auto">
                    <button
                        onClick={toggleTheme}
                        className="transform hover:scale-110 transition-transform active:scale-95"
                        title={isDark ? "Switch to Day" : "Switch to Night"}
                    >
                        <div className="bg-gradient-to-b from-[#FFD54F] to-[#FF8F00] p-3 rounded-full border-b-4 border-[#E65100] shadow-lg text-white">
                            {isDark ? <Sun size={28} strokeWidth={3} /> : <Moon size={28} strokeWidth={3} />}
                        </div>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
