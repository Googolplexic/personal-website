import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
    children: ReactNode;
}

/**
 * Wraps page content with a CSS-animation fade-in on route changes.
 * Uses `key` to force remount, which re-triggers the animation.
 * Respects prefers-reduced-motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();
    const prevPathRef = useRef(location.pathname);
    const isFirstRender = useRef(true);
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (location.pathname !== prevPathRef.current) {
            prevPathRef.current = location.pathname;
            isInitialLoad.current = false;
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    // Skip page-enter animation on initial load to avoid delaying LCP
    return (
        <div key={location.pathname} className={isInitialLoad.current ? '' : 'page-enter'}>
            {children}
        </div>
    );
}
