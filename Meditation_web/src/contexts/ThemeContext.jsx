import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    const [mood, setMood] = useState(() => {
        return localStorage.getItem('mood') || 'focus'; // default purple
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
        }


        localStorage.setItem('theme', theme);
    }, [theme]);

    // Apply Mood Colors
    useEffect(() => {
        const root = window.document.documentElement;
        // Map mood to specific hex colors matching iOS exactness where possible
        const moodMap = {
            focus: { primary: '#7C4DFF', grad1: '#7C4DFF', grad2: '#651FFF' }, // Purple
            calm: { primary: '#00BCD4', grad1: '#00BCD4', grad2: '#00E5FF' },  // Teal/Blue
            energized: { primary: '#FF9500', grad1: '#FF9500', grad2: '#FFB84D' }, // Orange
            balanced: { primary: '#4CD964', grad1: '#4CD964', grad2: '#80E594' }, // Green
        };

        const colors = moodMap[mood] || moodMap.focus;
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${colors.grad1} 0%, ${colors.grad2} 100%)`);
        root.style.setProperty('--primary-glow', `rgba(${hexToRgb(colors.primary)}, 0.15)`);

        localStorage.setItem('mood', mood);
    }, [mood]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mood, setMood }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Utility to convert hex to RGB string for rgba styling
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '124, 77, 255';
}

export function useTheme() {
    return useContext(ThemeContext);
}
