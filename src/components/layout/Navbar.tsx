import { useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Link } from '../ui/base';
import { cn, container, themeClasses, spacing } from '../../utils/styles';

export function Navbar() {
    return (
        <nav className={`fixed top-0 w-full ${themeClasses('bg-gray-300', 'bg-gray-950')} shadow-sm z-50`}>
            <div className={`${container('md')} ${spacing({ py: '4' })} flex justify-between items-center`}>
                <div className={`flex items-center ${spacing({ mr: '4' })} w-48`}>
                    <Link to="/" className={`text-xl font-bold ${themeClasses('text-gray-900', 'text-white')}`}>
                        CL
                    </Link>
                </div>
                <div className="flex items-center sm:gap-6 gap-3">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/portfolio">Portfolio</NavLink>
                    <NavLink to="/origami">Origami</NavLink>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}

function NavLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            variant="nav"
            onClick={() => window.scrollTo(0, 0)}
            className={cn(
                isActive && 'font-semibold',
                className
            )}
        >
            {children}
        </Link>
    );
}
