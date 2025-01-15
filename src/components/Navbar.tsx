import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
    returnTo?: {
        path: string;
    };
}

export function Navbar({ returnTo }: NavbarProps) {
    
    return (
        <nav className="fixed top-0 w-full bg-gray-400 dark:bg-gray-950 shadow-sm z-50">
            <div className="max-w-5xl mx-auto px-12 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4 w-48">
                    <Link to="/" className="text-xl font-bold dark:text-white">CL</Link>
                    {returnTo && (
                        <NavLink to={returnTo.path} className="px-5">
                            ← Back
                        </NavLink>
                    )}
                </div>
                <div className="flex items-center gap-6">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/portfolio">Portfolio</NavLink>
                    <NavLink to="/origami">Origami</NavLink>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}

function NavLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors
        ${isActive ? 'font-semibold' : ''} ${className || ''}`}
        >
            {children}
        </Link>
    )
}
