import { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router';
import { cn } from '../../utils/styles';
import { useHydrated } from '../../utils/useHydrated';
import { openCommandMenu, preloadCommandMenu, shortcutLabel } from '../command/openCommandMenu';
import { SearchIcon } from '../ui/SearchIcon';

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const shortcut = useHydrated() ? shortcutLabel() : 'Ctrl K';

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
                'fixed top-0 w-full z-200 pt-[env(safe-area-inset-top)] border-b border-solid transition-all duration-500',
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
                    viewTransition
                    onClick={() => { if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label="CL, Coleman Lai, home"
                    className="font-signature text-2xl tracking-wide no-underline select-none transition-colors duration-300 text-ink hover:text-gold"
                >
                    CL
                </RouterLink>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-4 md:gap-6 lg:gap-10 shrink-0">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/portfolio">Portfolio</NavLink>
                    <NavLink to="/origami">Origami</NavLink>
                    <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
                    {/* Styled as one more nav link; focus gets the gold underline, not a box round the whole thing */}
                    <button
                        type="button"
                        onClick={openCommandMenu}
                        onPointerEnter={preloadCommandMenu}
                        onFocus={preloadCommandMenu}
                        aria-keyshortcuts="Control+K Meta+K"
                        className="nav-link-gallery group/search flex items-center gap-2 min-h-11 px-0 shrink-0 bg-transparent cursor-pointer after:bottom-3 hover:text-gold focus-visible:outline-none focus-visible:text-gold focus-visible:after:w-full focus-visible:after:left-0"
                    >
                        <SearchIcon className="size-3.5" />
                        <span className="sr-only">Search the site</span>
                        {/* Fixed width, so the label swapping to ⌘ K after hydration doesn't shift the links */}
                        <span className="w-[3.25rem] normal-case tracking-[0.08em]">
                            {shortcut}
                        </span>
                    </button>
                </div>

                {/* Mobile search and menu buttons */}
                <div className="sm:hidden flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openCommandMenu}
                        onTouchStart={preloadCommandMenu}
                        aria-label="Search the site"
                        className="flex items-center justify-center w-11 h-11 p-0 bg-transparent text-ink transition-colors duration-300 hover:text-gold focus-visible:outline-none focus-visible:text-gold"
                    >
                        <SearchIcon />
                    </button>
                    <button
                        type="button"
                        className="flex items-center justify-center w-11 h-11 p-0 bg-transparent border border-solid border-line-strong text-ink transition-colors duration-300 hover:border-gold hover:text-gold"
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
            viewTransition
            onClick={() => { if (location.pathname === to) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
