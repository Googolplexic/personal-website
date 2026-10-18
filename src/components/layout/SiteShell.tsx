import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { DeferredAnalytics } from './DeferredAnalytics';
import { BackToTop } from '../ui/BackToTop';
import { useCustomCursor } from '../../utils/useCustomCursor';
import { useSpotlightPreference } from '../../useSpotlightPreference';

const SpotlightDust = lazy(() => import('../ui/SpotlightDust').then(m => ({ default: m.SpotlightDust })));

/** Navigation, footer and the gallery lighting that surround every page. */
export function SiteShell({ children }: { children: ReactNode }) {
    const location = useLocation();
    const isAdmin = location.pathname === '/admin';
    useCustomCursor(!isAdmin);
    const { enabled: spotlightEnabled } = useSpotlightPreference();
    // Don’t mount SpotlightDust until after main content can paint (preserves LCP).
    const [mountSpotlightDust, setMountSpotlightDust] = useState(false);
    useEffect(() => {
        if (isAdmin || !spotlightEnabled) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const frame = requestAnimationFrame(() => setMountSpotlightDust(true));
        return () => cancelAnimationFrame(frame);
    }, [isAdmin, spotlightEnabled]);

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-canvas text-ink transition-colors duration-500 md:text-base text-sm">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-300 focus:px-4 focus:py-3 focus:bg-canvas focus:border focus:border-solid focus:border-gold font-body text-xs uppercase tracking-[0.15em] text-gold no-underline"
            >
                Skip to content
            </a>
            {/* Global spotlight overlay — at root level so no ancestor transform can clip it */}
            {!isAdmin && <div id="global-spotlight" />}
            {/* Page-wide dim overlay — darkens everything outside cursor area */}
            {!isAdmin && <div id="page-dim" />}
            {!isAdmin && mountSpotlightDust && spotlightEnabled && (
                <Suspense fallback={null}>
                    <SpotlightDust />
                </Suspense>
            )}
            {!isAdmin && <Navbar />}
            <main id="main" tabIndex={-1} className="min-h-screen focus:outline-none">
                <PageTransition>{children}</PageTransition>
            </main>
            {!isAdmin && <Footer />}
            {!isAdmin && <BackToTop />}
            <DeferredAnalytics />
        </div>
    );
}
