import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { SpotlightContext } from '../../context/SpotlightContext';

const STORAGE_KEY = 'spotlight-enabled';

const listeners = new Set<() => void>();
// Keeps the choice for this visit even when localStorage can't be written.
let sessionChoice: boolean | null = null;

function readPreference(): boolean {
    if (sessionChoice !== null) return sessionChoice;
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return stored === 'true';
    } catch {
        // localStorage may be unavailable (private mode, etc.) — fall through to default
    }
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function writePreference(enabled: boolean) {
    sessionChoice = enabled;
    try {
        window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
        // Ignore write failures — the session choice still applies.
    }
    listeners.forEach((listener) => listener());
}

/**
 * Provides the site-wide "spotlight effects" preference.
 * Persists to localStorage and toggles `html.spotlight-disabled`
 * so CSS + DOM-driven effects can opt out in one place.
 * Prerendered HTML assumes the effects are on; the head script in root.tsx
 * applies the class before paint, and this store catches up after hydration.
 */
export function SpotlightProvider({ children }: { children: React.ReactNode }) {
    const enabled = useSyncExternalStore(subscribe, readPreference, () => true);

    useEffect(() => {
        document.documentElement.classList.toggle('spotlight-disabled', !enabled);
    }, [enabled]);

    const setEnabled = useCallback((value: boolean) => writePreference(value), []);
    const toggleEnabled = useCallback(() => writePreference(!readPreference()), []);

    return (
        <SpotlightContext.Provider value={{ enabled, toggleEnabled, setEnabled }}>
            {children}
        </SpotlightContext.Provider>
    );
}
