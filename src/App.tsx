import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Portfolio } from './pages/Portfolio'
import { Origami } from './pages/Origami'
import { NotFound } from './pages/NotFound'
import { AdminPage } from './pages/AdminPage'
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { RootRoute } from './components/layout/RootRoute'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { BackToTop } from './components/ui/BackToTop'
import { useSmoothScroll } from './utils/useSmoothScroll'
import { useCustomCursor } from './utils/useCustomCursor'

function AppContent() {
    useSmoothScroll();
    useCustomCursor();

    return (
        <div className="min-h-screen w-full overflow-x-hidden transition-colors duration-500 md:text-base text-sm"
            style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            {/* Global spotlight overlay — at root level so no ancestor transform can clip it */}
            <div id="global-spotlight" />
            {/* Page-wide dim overlay — darkens everything outside cursor area */}
            <div id="page-dim" />
            <Navbar />
            <main>
                <PageTransition>
                    <Routes>
                        <Route path="/" element={<RootRoute />} />
                        <Route path="/portfolio/*" element={<Portfolio />} />
                        <Route path="/origami" element={<Origami />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </PageTransition>
            </main>
            <Footer />
            <BackToTop />
            <Analytics />
            <SpeedInsights />
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
