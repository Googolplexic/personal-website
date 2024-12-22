import { useTheme } from '../useTheme';

export function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed bottom-12 right-12 p-2 text-xl rounded-lg dark:bg-gray-300 bg-gray-800"
        >
            {darkMode ? '🌞' : '🌙'}
        </button>
    );
}
