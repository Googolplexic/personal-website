import './App.css'
import { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { HelmetProvider } from 'react-helmet-async';
import { DeferredAnalytics } from './components/layout/DeferredAnalytics'
import { RootRoute } from './components/layout/RootRoute'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { BackToTop } from './components/ui/BackToTop'
import { useSmoothScroll } from './utils/useSmoothScroll'
import { useCustomCursor } from './utils/useCustomCursor'
import { useSpotlightPreference } from './useSpotlightPreference'
import { bindBootHero } from './utils/bootHero'

const Portfolio = lazy(() => import('./pages/Portfolio').then(m => ({ default: m.Portfolio })))
const Origami = lazy(() => import('./pages/Origami').then(m => ({ default: m.Origami })))
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const SpotlightDust = lazy(() => import('./components/ui/SpotlightDust').then(m => ({ default: m.SpotlightDust })))

function AppContent() {
    const location = useLocation();
    const isAdmin = location.pathname === '/admin';
    useEffect(() => {
        const bootHero = document.getElementById('boot-hero');
        if (bootHero) {
            const show = location.pathname === '/';
            bootHero.hidden = !show;
            document.documentElement.classList.toggle('no-boot-hero', !show);
        }
        document.getElementById('boot-nav')?.toggleAttribute('hidden', isAdmin);
    }, [location.pathname, isAdmin]);
    useEffect(() => bindBootHero(), []);
    useSmoothScroll(!isAdmin);
    useCustomCursor(!isAdmin);
    const { enabled: spotlightEnabled } = useSpotlightPreference();
    // Don’t mount SpotlightDust until after main content can paint (preserves LCP).
    // Otherwise we pull in the shared-components chunk for dust before Home uses it for LCP.
    const [mountSpotlightDust, setMountSpotlightDust] = useState(false);
    useEffect(() => {
        if (isAdmin || !spotlightEnabled) return;
        setMountSpotlightDust(true);
    }, [isAdmin, spotlightEnabled]);

    return (
        <div className="min-h-screen w-full overflow-x-hidden transition-colors duration-500 md:text-base text-sm"
            style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            {/* Global spotlight overlay — at root level so no ancestor transform can clip it */}
            {!isAdmin && <div id="global-spotlight" />}
            {/* Page-wide dim overlay — darkens everything outside cursor area */}
            {!isAdmin && <div id="page-dim" />}
            {/* Dust starts with the shell. The hero text is already painted, so this no longer waits on idle. */}
            {!isAdmin && mountSpotlightDust && spotlightEnabled && (
                <Suspense fallback={null}>
                    <SpotlightDust />
                </Suspense>
            )}
            {!isAdmin && <Navbar />}
            <main className="min-h-screen">
                <PageTransition>
                    <Suspense fallback={null}>
                        <Routes>
                            <Route path="/" element={<RootRoute />} />
                            <Route path="/portfolio/*" element={<Portfolio />} />
                            <Route path="/origami/*" element={<Origami />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </PageTransition>
            </main>
            {!isAdmin && <Footer />}
            {!isAdmin && <BackToTop />}
            <DeferredAnalytics />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <AppContent />
            </HelmetProvider>
        </BrowserRouter>
    );
}

export default App
