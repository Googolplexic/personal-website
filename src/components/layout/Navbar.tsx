import { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { cn } from '../../utils/styles';

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-0 w-full z-[200] transition-all duration-500',
                scrolled
                    ? 'shadow-sm'
                    : 'bg-transparent'
            )}
            style={{
                backgroundColor: scrolled ? 'var(--nav-bg)' : 'transparent',
                borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
                backdropFilter: scrolled ? 'blur(16px) saturate(1.2)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.2)' : 'none',
            }}
        >
            <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
                {/* CL Monogram */}
                <RouterLink
                    to="/"
                    onClick={() => window.scrollTo(0, 0)}
                    className="font-heading italic text-xl tracking-wide no-underline select-none"
                    style={{ color: 'var(--color-text-primary)', opacity: 1 }}
                >
                    CL
                </RouterLink>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-10">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/portfolio">Portfolio</NavLink>
                    <NavLink to="/origami">Origami</NavLink>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="sm:hidden p-1"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    style={{ background: 'none', border: 'none' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        {mobileOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="sm:hidden px-6 pb-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--nav-bg)' }}>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/portfolio">Portfolio</NavLink>
                    <NavLink to="/origami">Origami</NavLink>
                </div>
            )}
        </nav>
    );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to ||
        (to !== '/' && location.pathname.startsWith(to));

    return (
        <RouterLink
            to={to}
            onClick={() => window.scrollTo(0, 0)}
            className={cn(
                'nav-link-gallery',
                isActive && 'active'
            )}
            style={{ opacity: 1 }}
        >
            {children}
        </RouterLink>
    );
}

