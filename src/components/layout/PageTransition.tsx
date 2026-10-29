import { useLayoutEffect, useRef, useState, ReactNode } from 'react';
import { useLocation, useNavigation, useNavigationType } from 'react-router';
import { dropOffscreenNames, skipTransitionsOnBrowserBack } from '../../utils/viewTransition';

interface PageTransitionProps {
    children: ReactNode;
}

/** Scroll offset of each page last visited, so going back returns to the same spot */
const scrollPositions = new Map<string, number>();

/**
 * Fades page content in on route changes. Scrolls to the top before paint,
 * so the new page never appears at the previous page's scroll position, except
 * when going back, which returns to where the visitor was.
 * Respects prefers-reduced-motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();
    const navigationType = useNavigationType();
    const navigation = useNavigation();
    const prevPathRef = useRef(location.pathname);
    const isFirstRender = useRef(true);
    const scrollKey = location.pathname + location.search;
    const scrollKeyRef = useRef(scrollKey);
    // Decided once per page: no fade on initial load (it would delay LCP), under
    // a View Transition, which already cross-fades the pages, or going back,
    // where a phone has just animated the previous page in itself
    const [entered, setEntered] = useState({ path: location.pathname, fade: false });
    if (location.pathname !== entered.path) {
        setEntered({
            path: location.pathname,
            fade: navigationType !== 'POP'
                && (typeof document === 'undefined' || !document.documentElement.matches(':active-view-transition')),
        });
    }

    useLayoutEffect(() => {
        // The browser would otherwise restore the last scroll offset after a
        // client navigation and yank the new page back down.
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        const remember = () => scrollPositions.set(scrollKeyRef.current, window.scrollY);
        window.addEventListener('scroll', remember, { passive: true });
        const restoreTransitions = skipTransitionsOnBrowserBack();
        return () => {
            window.removeEventListener('scroll', remember);
            restoreTransitions();
        };
    }, []);

    useLayoutEffect(() => {
        scrollKeyRef.current = scrollKey;
    }, [scrollKey]);

    // Before the old page is captured for a View Transition
    useLayoutEffect(() => {
        if (navigation.state === 'loading') dropOffscreenNames();
    }, [navigation.state]);

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
            const returning = navigationType === 'POP' || (location.state as { restoreScroll?: boolean } | null)?.restoreScroll;
            window.scrollTo(0, returning ? scrollPositions.get(scrollKeyRef.current) ?? 0 : 0);
            // Before the new page is captured
            dropOffscreenNames();
        }
    }, [location.pathname, location.state, navigationType]);

    return (
        <div key={location.pathname} className={entered.fade ? 'page-enter' : ''}>
            {children}
        </div>
    );
}
