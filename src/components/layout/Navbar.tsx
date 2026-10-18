import { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router';
import { cn } from '../../utils/styles';

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    const [menuPath, setMenuPath] = useState(location.pathname);
    if (menuPath !== location.pathname) {
        setMenuPath(location.pathname);
        setMobileOpen(false);
    }

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const solid = scrolled || mobileOpen;

    return (
        <nav
            aria-label="Primary"
            className={cn(
                'fixed top-0 w-full z-200 border-b border-solid transition-all duration-500',
                solid
                    ? 'bg-(--nav-bg) border-(--nav-border) backdrop-blur-lg backdrop-saturate-120'
                    : 'bg-transparent border-transparent',
            )}
        >
            {/* Same edges as the page grid, so the monogram lines up with the content below */}
            <div className="max-w-(--page-max) mx-auto px-(--page-margin) py-4 flex justify-between items-center">
                {/* CL Monogram */}
                <RouterLink
                    to="/"
                    onClick={() => window.scrollTo(0, 0)}
                    aria-label="CL, Coleman Lai, home"
                    className="font-signature text-2xl tracking-wide no-underline select-none transition-colors duration-300 text-ink hover:text-gold"
                >
                    CL
                </RouterLink>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-10">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/portfolio">Portfolio</NavLink>
                    <NavLink to="/origami">Origami</NavLink>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="sm:hidden flex items-center justify-center w-11 h-11 p-0 bg-transparent border border-solid border-line-strong text-ink transition-colors duration-300 hover:border-gold hover:text-gold"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-menu"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
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
                <div id="mobile-menu" className="sm:hidden px-(--page-margin) pb-4 flex flex-col">
                    <NavLink to="/" block>Home</NavLink>
                    <NavLink to="/portfolio" block>Portfolio</NavLink>
                    <NavLink to="/origami" block>Origami</NavLink>
                </div>
            )}
        </nav>
    );
}

function NavLink({ to, block = false, children }: { to: string; block?: boolean; children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to ||
        (to !== '/' && location.pathname.startsWith(to));

    return (
        <RouterLink
            to={to}
            onClick={() => window.scrollTo(0, 0)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'nav-link-gallery',
                // Keep the active underline under the word, not at the foot of the 44px tap target
                block && 'self-start flex items-center min-h-11 after:bottom-3',
                isActive && 'active',
            )}
        >
            {children}
        </RouterLink>
    );
}
