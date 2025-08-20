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

function AppContent() {
    return (
        <div className="min-h-screen w-screen transition-all duration-200 md:text-base text-sm">
            <Navbar />
            <div className="max-w-3xl lg:max-w-7xl mx-auto md:px-16 px-4 py-36">
                <Routes>
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/portfolio/*" element={<Portfolio />} />
                    <Route path="/origami" element={<Origami />} />
                    <Route path="/admin" element={<AdminPage />} />
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
