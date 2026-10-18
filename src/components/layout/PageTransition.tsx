import { useLayoutEffect, useRef, useState, ReactNode } from 'react';
import { useLocation } from 'react-router';

interface PageTransitionProps {
    children: ReactNode;
}

/**
 * Fades page content in on route changes. Scrolls to the top before paint,
 * so the new page never appears at the previous page's scroll position.
 * Respects prefers-reduced-motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();
    const prevPathRef = useRef(location.pathname);
    const isFirstRender = useRef(true);
    // Skip the page-enter animation on initial load to avoid delaying LCP
    const [renderedPath, setRenderedPath] = useState(location.pathname);
    const [hasNavigated, setHasNavigated] = useState(false);
    if (location.pathname !== renderedPath) {
        setRenderedPath(location.pathname);
        setHasNavigated(true);
    }

    useLayoutEffect(() => {
        // The browser would otherwise restore the last scroll offset after a
        // client navigation and yank the new page back down.
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    }, []);

    useLayoutEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (location.pathname !== prevPathRef.current) {
            prevPathRef.current = location.pathname;

            // Safety: ensure body overflow is never left hidden by a
            // lightbox (or similar) that was unmounted during navigation.
            document.body.style.overflow = '';
            document.documentElement.classList.remove('scroll-locked');
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    return (
        <div key={location.pathname} className={hasNavigated ? 'page-enter' : ''}>
            {children}
        </div>
    );
}
