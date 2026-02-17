import { ThemeContext } from '../../context/ThemeContext';

/**
 * Dark-only theme. No toggle.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeContext.Provider value={{ darkMode: true, toggleDarkMode: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
}
