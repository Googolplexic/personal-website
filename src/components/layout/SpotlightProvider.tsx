import { useCallback, useEffect, useState } from 'react';
import { SpotlightContext } from '../../context/SpotlightContext';

const STORAGE_KEY = 'spotlight-enabled';

function readInitialPreference(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return stored === 'true';
    } catch {
        // localStorage may be unavailable (private mode, etc.) — fall through to default
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
}

/**
 * Provides the site-wide "spotlight effects" preference.
 * Persists to localStorage and toggles `html.spotlight-disabled`
 * so CSS + DOM-driven effects can opt out in one place.
 */
export function SpotlightProvider({ children }: { children: React.ReactNode }) {
    const [enabled, setEnabledState] = useState<boolean>(readInitialPreference);

    useEffect(() => {
        document.documentElement.classList.toggle('spotlight-disabled', !enabled);
        try {
            window.localStorage.setItem(STORAGE_KEY, String(enabled));
        } catch {
            // Ignore write failures — the class is still applied for the session.
        }
    }, [enabled]);

    const setEnabled = useCallback((value: boolean) => setEnabledState(value), []);
    const toggleEnabled = useCallback(() => setEnabledState((v) => !v), []);

    return (
        <SpotlightContext.Provider value={{ enabled, toggleEnabled, setEnabled }}>
            {children}
        </SpotlightContext.Provider>
    );
}
