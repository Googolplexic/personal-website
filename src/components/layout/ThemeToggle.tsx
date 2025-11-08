import { useTheme } from '../../useTheme';
import { Button } from '../ui/base';

export function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <Button
            onClick={toggleDarkMode}
            variant="icon"
            className="fixed bottom-12 right-12 text-xl rounded-lg dark:bg-gray-300 bg-gray-800"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? '🌞' : '🌙'}
        </Button>
    );
}
