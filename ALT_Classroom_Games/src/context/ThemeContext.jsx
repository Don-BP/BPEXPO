import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // timeOfDay: 0 = Noon (Day), PI = Midnight (Night)
    const [timeOfDay, setTimeOfDay] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return Math.PI;
        }
        return 0;
    });

    const isDark = Math.cos(timeOfDay) < 0;

    const toggleTheme = () => {
        if (isDark) {
            setTimeOfDay(0);
        } else {
            setTimeOfDay(Math.PI);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, timeOfDay, setTimeOfDay, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
