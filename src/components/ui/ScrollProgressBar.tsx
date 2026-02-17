import { useScrollProgress } from '../../utils/useScrollProgress';

/**
 * Thin gold progress bar fixed to the top of the viewport.
 * Shows scroll progress through the page.
 */
export function ScrollProgressBar() {
    const progress = useScrollProgress();

    // Hide when at top
    if (progress < 0.5) return null;

    return (
        <div
            className="fixed top-0 left-0 h-[2px] z-[60] pointer-events-none"
            style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-text))',
                opacity: 0.85,
                transition: 'width 0.1s linear',
            }}
        />
    );
}
