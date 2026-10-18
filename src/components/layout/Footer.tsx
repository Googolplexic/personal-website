import { Link as RouterLink } from 'react-router';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { SpotlightToggle } from './SpotlightToggle';
import { FOOTER_META_LINK } from './footerStyles';

declare const __GIT_HASH__: string;
declare const __GIT_DATE__: string;
declare const __SITE_VERSION__: string;

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

const linkClass = 'text-xs tracking-[0.15em] uppercase font-body text-ink-muted link-underline';

export function Footer() {
    return (
        <footer>
            <div className="gallery-divider" />
            <div className="max-w-4xl mx-auto px-6 py-6 text-center">

                <nav aria-label="Footer navigation"
                    className="flex justify-center flex-wrap gap-x-7 gap-y-2 mb-3">
                    {NAV_LINKS.map(link =>
                        link.to ? (
                            <RouterLink
                                key={link.label}
                                to={link.to}
                                onClick={() => window.scrollTo(0, 0)}
                                className={linkClass}
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
                            >
                                {link.label}
                            </a>
                        )
                    )}
                </nav>

                <div className="mb-4 flex items-center justify-center gap-3">
                    {SOCIAL_LINKS.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                            className="text-ink-muted transition-colors duration-300 hover:text-gold"
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>

                <div className="text-xs font-body uppercase tracking-[0.15em] flex flex-col items-center gap-2 text-ink-muted">
                    <SpotlightToggle />
                    <a
                        href="https://github.com/Googolplexic/personal-website/blob/main/LICENSE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${FOOTER_META_LINK} inline-flex items-center min-h-8 px-3`}
                    >
                        © {new Date().getFullYear()} Coleman Lai
                    </a>
                    <BuildMeta />
                </div>
            </div>
        </footer>
    );
}

function BuildMeta() {
    const hash = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : 'dev';
    const date = typeof __GIT_DATE__ !== 'undefined' ? __GIT_DATE__ : '';
    const version = typeof __SITE_VERSION__ !== 'undefined' ? __SITE_VERSION__ : 'dev';

    return (
        <a
            href={`https://github.com/Googolplexic/personal-website/commit/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${FOOTER_META_LINK} inline-flex items-center min-h-8 px-3`}
        >
            v{version} · {date} · {hash}
        </a>
    );
}
