import { useTheme } from '../../useTheme';
import { Button } from '../ui/base';
import { fixedPosition, themeClasses } from '../../utils/styles';

export function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <Button
            onClick={toggleDarkMode}
            variant="icon"
            className={`${fixedPosition('bottom-right')} text-xl rounded-lg ${themeClasses('bg-gray-800', 'bg-gray-300')}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? '🌞' : '🌙'}
        </Button>
    );
}
