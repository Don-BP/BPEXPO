import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import PlayfulBackground from '../PlayfulBackground';

const Layout = () => {
    const location = useLocation();

    // Check if we are in the Horror Game
    const isHorror = location.pathname.includes('typing-dead');

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className={`min-h-screen flex flex-col font-sans ${isHorror ? '' : 'text-slate-900'}`}>

            {/* Playful Theme Elements (Hidden for Horror) */}
            {!isHorror && (
                <>
                    <PlayfulBackground />
                    <Navbar />
                </>
            )}

            <main className="flex-grow relative w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
