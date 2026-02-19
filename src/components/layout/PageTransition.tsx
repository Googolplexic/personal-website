import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from '../../utils/useSmoothScroll';

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

            // Safety: ensure body overflow is never left hidden by a
            // lightbox (or similar) that was unmounted during navigation.
            document.body.style.overflow = '';

            // Use Lenis for scroll-to-top when active, fall back to native.
            const lenis = getLenis();
            if (lenis) {
                lenis.scrollTo(0, { immediate: true });
            } else {
                window.scrollTo(0, 0);
            }
        }
    }, [location.pathname]);

    // Skip page-enter animation on initial load to avoid delaying LCP
    return (
        <div key={location.pathname} className={isInitialLoad.current ? '' : 'page-enter'}>
            {children}
        </div>
    );
}
