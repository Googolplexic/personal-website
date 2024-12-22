import { useTheme } from '../useTheme';

export function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed top-5 right-5 p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
        >
            {darkMode ? '🌞' : '🌙'}
        </button>
    );
}
