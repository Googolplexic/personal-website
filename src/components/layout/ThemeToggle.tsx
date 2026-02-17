import { useTheme } from '../../useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border-none bg-transparent transition-all duration-300 hover:bg-[var(--color-accent-soft)]"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ color: 'var(--color-text-tertiary)' }}
        >
            <div className="relative w-4 h-4">
                <FiSun
                    className={`absolute inset-0 w-4 h-4 transition-all duration-500 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'
                        }`}
                    style={{ color: 'var(--color-accent)' }}
                />
                <FiMoon
                    className={`absolute inset-0 w-4 h-4 transition-all duration-500 ${darkMode ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                        }`}
                />
            </div>
        </button>
    );
}

