import { Link as RouterLink } from 'react-router';
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
    { label: 'GitHub', href: 'https://github.com/Googolplexic' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/coleman-lai' },
    { label: 'Instagram', href: 'https://www.instagram.com/12googolplex' },
];

const linkClass = 'inline-flex items-center min-h-9 text-xs tracking-[0.15em] uppercase font-body text-ink-muted link-underline';

export function Footer() {
    return (
        <footer className="border-t border-solid border-line">
            <div className="page-grid pt-12 pb-8 gap-y-10">
                <RouterLink
                    to="/"
                    onClick={() => window.scrollTo(0, 0)}
                    aria-label="Coleman Lai, home"
                    className="col-span-full md:col-span-4 self-start font-signature text-2xl tracking-wide no-underline select-none text-ink transition-colors duration-300 hover:text-gold"
                >
                    CL
                </RouterLink>

                <nav aria-label="Footer navigation" className="col-span-6 md:col-span-3">
                    <ul className="m-0 p-0 list-none flex flex-col">
                        {NAV_LINKS.map(link => (
                            <li key={link.label}>
                                {link.to ? (
                                    <RouterLink to={link.to} onClick={() => window.scrollTo(0, 0)} className={linkClass}>
                                        {link.label}
                                    </RouterLink>
                                ) : (
                                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                        {link.label}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <ul className="col-span-6 md:col-span-3 m-0 p-0 list-none flex flex-col">
                    {SOCIAL_LINKS.map(link => (
                        <li key={link.label}>
                            <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="col-span-full md:col-span-2 md:justify-self-end self-start">
                    <SpotlightToggle />
                </div>

                <div className="col-span-full border-t border-solid border-line pt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs font-body uppercase tracking-[0.15em] text-ink-faint">
                    <a
                        href="https://github.com/Googolplexic/personal-website/blob/main/LICENSE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${FOOTER_META_LINK} inline-flex items-center min-h-8`}
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
            className={`${FOOTER_META_LINK} inline-flex items-center min-h-8`}
        >
            v{version} · {date} · {hash}
        </a>
    );
}
