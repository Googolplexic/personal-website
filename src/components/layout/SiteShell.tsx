import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { DeferredAnalytics } from './DeferredAnalytics';
import { BackToTop } from '../ui/BackToTop';
import { useSmoothScroll } from '../../utils/useSmoothScroll';
import { useCustomCursor } from '../../utils/useCustomCursor';
import { useSpotlightPreference } from '../../useSpotlightPreference';

const SpotlightDust = lazy(() => import('../ui/SpotlightDust').then(m => ({ default: m.SpotlightDust })));

/** Navigation, footer and the gallery lighting that surround every page. */
export function SiteShell({ children }: { children: ReactNode }) {
    const location = useLocation();
    const isAdmin = location.pathname === '/admin';
    useSmoothScroll(!isAdmin);
    useCustomCursor(!isAdmin);
    const { enabled: spotlightEnabled } = useSpotlightPreference();
    // Don’t mount SpotlightDust until after main content can paint (preserves LCP).
    const [mountSpotlightDust, setMountSpotlightDust] = useState(false);
    useEffect(() => {
        if (isAdmin || !spotlightEnabled) return;
        const frame = requestAnimationFrame(() => setMountSpotlightDust(true));
        return () => cancelAnimationFrame(frame);
    }, [isAdmin, spotlightEnabled]);

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-canvas text-ink transition-colors duration-500 md:text-base text-sm">
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
            <main className="min-h-screen">
                <PageTransition>{children}</PageTransition>
            </main>
            {!isAdmin && <Footer />}
            {!isAdmin && <BackToTop />}
            <DeferredAnalytics />
        </div>
    );
}
