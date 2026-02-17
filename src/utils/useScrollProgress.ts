import { useState, useEffect } from 'react';

/**
 * Thin scroll progress bar at the top of the page.
 * Returns a value 0-100 representing scroll %.
 */
export function useScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, percent)));
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        update();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return progress;
}
