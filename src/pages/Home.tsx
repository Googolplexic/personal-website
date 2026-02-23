import { About } from '../components/sections/About';
import { LinkSection, type LinkSectionItem } from '../components/sections/LinkSection';
import { SEO } from '../components/layout/SEO';
import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Link } from '../components/ui/base';
import { useScrollRevealClass } from '../utils/useScrollReveal';
import { useCallback, useEffect, useRef } from 'react';
import { HeroParticles } from '../components/ui/HeroParticles';
import { FiDownload, FiMail } from 'react-icons/fi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const iconClass = 'w-5 h-5';

const CONNECT_LINKS: LinkSectionItem[] = [
    { name: 'Personal Email', value: 'coleman@colemanlai.com', href: 'mailto:coleman@colemanlai.com', icon: <FiMail className={iconClass} /> },
    { name: 'University Email', value: 'ccl46@sfu.ca', href: 'mailto:ccl46@sfu.ca', icon: <FiMail className={iconClass} /> },
    { name: 'LinkedIn', value: 'coleman-lai', href: 'https://www.linkedin.com/in/coleman-lai', icon: <FaLinkedin className={iconClass} /> },
];

const WORK_LINKS: LinkSectionItem[] = [
    { name: 'Resume', value: 'View PDF', href: '/resume.pdf', icon: <FiDownload className={iconClass} /> },
    { name: 'GitHub', value: 'Googolplexic', href: 'https://github.com/Googolplexic', icon: <FaGithub className={iconClass} /> },
];

function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const { ref, className: revealClass } = useScrollRevealClass({ threshold: 0.08 });
    return (
        <section ref={ref} className={`${revealClass} ${className}`}>
            {children}
        </section>
    );
}

export function Home() {
    const featuredSlugs = ['hermes', 'personal-website', 'be-square', 'origami-fractions'];
    const nameRef = useRef<HTMLHeadingElement>(null);
    const heroRef = useRef<HTMLElement>(null);

    // Reset hero text illumination and hide hero spotlight when hero scrolls out of view
    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    const name = nameRef.current;
                    if (name) {
                        name.style.backgroundImage = 'none';
                        name.style.color = '#e8e4de';
                        name.style.webkitTextFillColor = 'unset';
                        name.style.filter = 'drop-shadow(0 0 0px rgba(255, 248, 230, 0))';
                    }
                    const spotlight = el.querySelector('.hero-spotlight');
                    if (spotlight) spotlight.classList.remove('visible');
                }
            },
            { threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const section = e.currentTarget;
        const spotlight = section.querySelector('.hero-spotlight') as HTMLElement;
        if (!spotlight) return;
        // Show the spotlight on first mouse movement
        if (!spotlight.classList.contains('visible')) spotlight.classList.add('visible');
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        spotlight.style.setProperty('--hero-x', `${x}%`);
        spotlight.style.setProperty('--hero-y', `${y}%`);

        // Text illumination — radial spotlight follows cursor in 2D for a directional beam
        const name = nameRef.current;
        if (name) {
            const nameRect = name.getBoundingClientRect();
            // Cursor position relative to name (0–100) so the highlight tracks the mouse in 2D
            const relX = ((e.clientX - nameRect.left) / nameRect.width) * 100;
            const relY = ((e.clientY - nameRect.top) / nameRect.height) * 100;
            // Distance from name center for overall intensity falloff
            const cx = nameRect.left + nameRect.width / 2;
            const cy = nameRect.top + nameRect.height / 2;
            const dx = (e.clientX - cx) / (nameRect.width * 1.5);
            const dy = (e.clientY - cy) / 300;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const raw = Math.max(0, 1 - dist);
            const intensity = raw * raw * (3 - 2 * raw); // smoothstep

            // Tighter radial = more directional spotlight; size shrinks when cursor is closer
            const radius = 22 + 20 * (1 - intensity);

            // Smooth edge: blend base→white only in low intensity so no snap; full punch when near
            const t = intensity <= 0 ? 0 : intensity < 0.06 ? intensity / 0.06 : 1;
            const r = Math.round(232 + 23 * t);
            const g = Math.round(228 + 27 * t);
            const b = Math.round(222 + 33 * t);
            const bright = `rgb(${r}, ${g}, ${b})`;
            const base = '#e8e4de';
            name.style.backgroundImage = `radial-gradient(ellipse ${radius}% ${radius * 0.7}% at ${relX}% ${relY}%, ${bright}, ${base})`;
            name.style.webkitBackgroundClip = 'text';
            name.style.backgroundClip = 'text';
            name.style.color = 'transparent';
            name.style.webkitTextFillColor = 'transparent';
            name.style.filter = `drop-shadow(0 0 ${40 * intensity}px rgba(255, 248, 230, ${0.85 * intensity})) drop-shadow(0 0 ${14 * intensity}px rgba(255, 255, 248, ${0.5 * intensity}))`;
            name.style.transition = 'none';
        }
    }, []);

    return (
        <>
            <SEO
                title="Coleman Lai | Software Developer & Origami Artist | Vancouver"
                description="Explore innovative software projects and intricate origami designs by Coleman Lai, a Computing Science student at SFU. View my portfolio now!"
                keywords="Coleman Lai, software developer, computing science, origami artist, SFU, Vancouver, full-stack developer, origami, paper art, portfolio"
            />

            {/* ===== HERO ===== */}
            <section
                ref={heroRef}
                className="hero-black-fade min-h-screen flex flex-col items-center justify-center relative px-6"
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={() => {
                    const spotlight = heroRef.current?.querySelector('.hero-spotlight');
                    if (spotlight) spotlight.classList.remove('visible');
                    const name = nameRef.current;
                    if (name) {
                        name.style.transition = 'filter 0.5s ease-out';
                        name.style.backgroundImage = 'linear-gradient(90deg, #e8e4de 0%, #e8e4de 100%)';
                        name.style.filter = 'drop-shadow(0 0 0px rgba(255, 248, 230, 0)) drop-shadow(0 0 0px rgba(255, 255, 248, 0))';
                    }
                }}
            >
                {/* Spotlight cone from above */}
                <div className="hero-spotlight" />

                {/* Floating dust motes */}
                <HeroParticles />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <p className="gallery-overline mb-6 animate-fade-in opacity-0">Portfolio 2026</p>

                    <h1 ref={nameRef} className="gallery-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8"
                        style={{ color: 'var(--color-text-primary)' }}>
                        Coleman Lai
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl font-heading italic tracking-wide mb-6 animate-fade-in opacity-0"
                        style={{ color: 'var(--color-text-secondary)', animationDelay: '0.1s' }}>
                        My gallery of code and paper.
                    </p>

                    <div className="gallery-divider mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }} />

                    <p className="text-xs tracking-[0.2em] uppercase font-body animate-fade-in opacity-0"
                        style={{ color: 'var(--color-text-tertiary)', animationDelay: '0.3s' }}>
                        Computing Science &nbsp;<Link to="/admin" className="!no-underline cursor-default" style={{ color: 'inherit', opacity: 1 }}>·</Link>&nbsp; Origami Artist

                    </p>
                </div>

                {/* Scroll indicator */}
                <button
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-10 left-1/2 scroll-indicator cursor-pointer bg-transparent border-none p-2"
                    style={{ color: 'var(--color-accent)' }}
                    aria-label="Scroll to content"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </button>
            </section>

            {/* ===== ABOUT ===== */}
            <ScrollSection className="py-24 md:py-36">
                <div id="about" className="max-w-2xl mx-auto px-6 text-center scroll-mt-32">
                    <About />
                </div>
            </ScrollSection>

            {/* Divider */}
            <div className="gallery-divider" />

            {/* ===== CONNECT & WORK ===== */}
            <ScrollSection className="py-20 md:py-32">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-16 gap-x-24 justify-items-center lg:justify-items-stretch items-start text-center lg:text-left">
                        <div className="w-full max-w-[280px] lg:justify-self-end">
                            <LinkSection id="contact" title="Connect" links={CONNECT_LINKS} align="right" />
                        </div>
                        <div className="w-full max-w-[280px] lg:justify-self-start">
                            <LinkSection id="work" title="Work" links={WORK_LINKS} />
                        </div>
                    </div>
                </div>
            </ScrollSection>

            {/* Divider */}
            <div className="gallery-divider" />

            {/* ===== FEATURED WORKS ===== */}
            <ScrollSection className="py-20 md:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <p className="gallery-overline mb-4">The Gallery</p>
                        <h2 className="gallery-heading text-3xl md:text-4xl mb-2"
                            style={{ color: 'var(--color-text-primary)' }}>
                            Featured Projects
                        </h2>
                        <p className="text-sm font-heading italic"
                            style={{ color: 'var(--color-text-secondary)' }}>
                            A curated selection of my proudest works.
                        </p>
                    </div>
                    <ProjectGrid
                        featuredSlugs={featuredSlugs}
                        hideControls
                    />
                </div>
            </ScrollSection>
        </>
    );
}

