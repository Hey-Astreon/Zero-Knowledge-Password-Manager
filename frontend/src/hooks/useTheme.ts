'use client';

import { useCallback, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'alyra-theme';

function readCurrentTheme(): Theme {
    if (typeof document !== 'undefined') {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
}

export function useTheme(): { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void } {
    // Lazy init reads the class the bootstrap script already set (no effect needed)
    const [theme, setThemeState] = useState<Theme>(readCurrentTheme);

    const applyTheme = useCallback((t: Theme) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
        try {
            localStorage.setItem(STORAGE_KEY, t);
        } catch { /* ignore */ }
        setThemeState(t);
    }, []);

    const toggleTheme = useCallback(() => {
        applyTheme(readCurrentTheme() === 'dark' ? 'light' : 'dark');
    }, [applyTheme]);

    return { theme, toggleTheme, setTheme: applyTheme };
}
