import { Link as RouterLink } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const NAV_LINKS = [
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Origami', to: '/origami' },
    { label: 'Resume', href: '/resume.pdf' },
];

const SOCIAL_LINKS = [
    { label: 'GitHub', href: 'https://github.com/Googolplexic', icon: <FaGithub size={15} /> },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/coleman-lai', icon: <FaLinkedin size={15} /> },
    { label: 'Instagram', href: 'https://www.instagram.com/12googolplex', icon: <FaInstagram size={15} /> },
];

const linkClass = 'text-xs tracking-[0.15em] uppercase font-body transition-opacity duration-200 hover:opacity-80';

export function Footer() {
    return (
        <footer>
            <div className="gallery-divider" />
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <p className="gallery-overline mb-1">Coleman Lai</p>
                <p className="text-xs font-heading italic mb-10"
                    style={{ color: 'var(--color-text-tertiary)' }}>
                    Software Developer &amp; Origami Artist · Vancouver, BC
                </p>

                <nav aria-label="Footer navigation"
                    className="flex justify-center flex-wrap gap-x-8 gap-y-3 mb-8">
                    {NAV_LINKS.map(link =>
                        link.to ? (
                            <RouterLink
                                key={link.label}
                                to={link.to}
                                onClick={() => window.scrollTo(0, 0)}
                                className={linkClass}
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {link.label}
                            </RouterLink>
                        ) : (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClass}
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {link.label}
                            </a>
                        )
                    )}
                </nav>

                <div className="flex justify-center gap-5 mb-10">
                    {SOCIAL_LINKS.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                            className="transition-opacity duration-200 hover:opacity-80 opacity-50"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>

                <p className="text-xs tracking-[0.2em] uppercase font-body"
                    style={{ color: 'var(--color-text-tertiary)' }}>
                    © {new Date().getFullYear()} Coleman Lai
                </p>
            </div>
        </footer>
    );
}
