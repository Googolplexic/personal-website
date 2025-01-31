import './App.css'
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Portfolio } from './pages/Portfolio'
import { Origami } from './pages/Origami'
import { NotFound } from './pages/NotFound'
import projects from './assets/projects';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { RootRoute } from './components/RootRoute'

function AppContent() {
    const location = useLocation();
    const projectSlug = location.pathname.split('/portfolio/')[1];
    const projectExists = projectSlug ? projects.some(p =>
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === projectSlug
    ) : false;

    const showReturnButton = location.pathname.includes('/portfolio/')
        && location.pathname !== '/portfolio'
        && projectExists;

    const navbarProps = showReturnButton
        ? { returnTo: { path: '/portfolio' } }
        : {};

    return (
        <div className="min-h-screen w-screen transition-all duration-200 md:text-base text-sm">
            <Navbar {...navbarProps} />
            <div className="max-w-3xl lg:max-w-7xl mx-auto md:px-16 px-4 py-36">
                <Routes>
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/portfolio/*" element={<Portfolio />} />
                    <Route path="/origami" element={<Origami />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
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
