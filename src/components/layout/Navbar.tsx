import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full bg-gray-300 dark:bg-gray-950 shadow-sm z-50">
            <div className="max-w-5xl mx-auto sm:px-12 px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4 w-48">
                    <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">CL</Link>
                </div>
                <div className="flex items-center sm:gap-6 gap-3">
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
            onClick={() => window.scrollTo(0, 0)}
            className={`text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors
        ${isActive ? 'font-semibold' : ''} ${className || ''}`}
        >
            {children}
        </Link>
    )
}
