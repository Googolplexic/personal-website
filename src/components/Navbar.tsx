import { ThemeToggle } from './ThemeToggle'
export function Navbar() {
    return (
        <nav className="fixed top-0 w-full bg-gray-200 dark:bg-gray-950 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                <span className="text-xl font-bold dark:text-white">CL</span>
                <div className="flex items-center gap-6">
                    <NavLink href="#about">About</NavLink>
                    <NavLink href="#skills">Skills</NavLink>
                    <NavLink href="#contact">Contact</NavLink>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
            {children}
        </a>
    )
}
