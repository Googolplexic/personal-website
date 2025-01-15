import './App.css'
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { Portfolio } from './pages/Portfolio'
import { Origami } from './pages/Origami'
import { NotFound } from './pages/NotFound'
import projects from './assets/projects';

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
