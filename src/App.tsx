import './App.css'
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { Portfolio } from './pages/Portfolio'
import { Origami } from './pages/Origami'
import { NotFound } from './pages/NotFound'

function AppContent() {
    const location = useLocation();
    const showReturnButton = location.pathname.includes('/portfolio/') && location.pathname !== '/portfolio';

    const navbarProps = showReturnButton
        ? { returnTo: { path: '/portfolio' } }
        : {};

    return (
        <div className="min-h-screen w-screen transition-all duration-200">
            <Navbar {...navbarProps} />
            <div className="max-w-3xl lg:max-w-7xl mx-auto px-16 pt-24 pb-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/portfolio/*" element={<Portfolio />} />
                    <Route path="/origami" element={<Origami />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App
