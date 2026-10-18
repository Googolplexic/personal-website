import { About } from '../components/sections/About';
import { LinkSection, type LinkSectionItem } from '../components/sections/LinkSection';
import { ExhibitCard } from '../components/ui/ExhibitCard';
import { ExhibitGrid } from '../components/ui/ExhibitGrid';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Link } from 'react-router';
import { ItemProps } from '../types';
import { useScrollRevealClass } from '../utils/useScrollReveal';
import { useCallback, useEffect, useRef } from 'react';
import { HeroParticles } from '../components/ui/HeroParticles';
import { useSpotlightPreference } from '../useSpotlightPreference';

const CONNECT_LINKS: LinkSectionItem[] = [
    { name: 'Personal Email', value: 'coleman@colemanlai.com', href: 'mailto:coleman@colemanlai.com' },
    { name: 'University Email', value: 'ccl46@sfu.ca', href: 'mailto:ccl46@sfu.ca' },
    { name: 'LinkedIn', value: 'coleman-lai', href: 'https://www.linkedin.com/in/coleman-lai' },
];

const WORK_LINKS: LinkSectionItem[] = [
    { name: 'Resume', value: 'Open resume (PDF)', href: '/resume.pdf', feature: true },
    { name: 'GitHub', value: 'Googolplexic', href: 'https://github.com/Googolplexic' },
];

function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const { ref, className: revealClass } = useScrollRevealClass({ threshold: 0.08 });
    return (
        <section ref={ref} className={`${revealClass} ${className}`}>
            {children}
        </section>
    );
}

interface HomeProps {
    /** In the order chosen in the route's FEATURED_SLUGS; the first is the lead piece */
    featured: ItemProps[];
}

const NAME_COLOR = '#e8e4de';

/** Moves the hero spotlight to the pointer and lights the name from that direction. */
function lightHero(section: HTMLElement, name: HTMLElement | null, clientX: number, clientY: number) {
    const spotlight = section.querySelector<HTMLElement>('.hero-spotlight');
    if (!spotlight) return;
    spotlight.classList.add('visible');
    const rect = section.getBoundingClientRect();
    spotlight.style.setProperty('--hero-x', `${((clientX - rect.left) / rect.width) * 100}%`);
    spotlight.style.setProperty('--hero-y', `${((clientY - rect.top) / rect.height) * 100}%`);

    if (!name) return;
    const nameRect = name.getBoundingClientRect();
    // Cursor position relative to name (0–100) so the highlight tracks the mouse in 2D
    const relX = ((clientX - nameRect.left) / nameRect.width) * 100;
    const relY = ((clientY - nameRect.top) / nameRect.height) * 100;
    // Distance from name center for overall intensity falloff
    const dx = (clientX - (nameRect.left + nameRect.width / 2)) / (nameRect.width * 1.5);
    const dy = (clientY - (nameRect.top + nameRect.height / 2)) / 300;
    const raw = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
    const intensity = raw * raw * (3 - 2 * raw); // smoothstep

    // Tighter radial = more directional spotlight; size shrinks when cursor is closer
    const radius = 22 + 20 * (1 - intensity);

    // Smooth edge: blend base→white only in low intensity so no snap; full punch when near
    const t = intensity <= 0 ? 0 : intensity < 0.06 ? intensity / 0.06 : 1;
    const bright = `rgb(${Math.round(232 + 23 * t)}, ${Math.round(228 + 27 * t)}, ${Math.round(222 + 33 * t)})`;
    name.style.backgroundImage = `radial-gradient(ellipse ${radius}% ${radius * 0.7}% at ${relX}% ${relY}%, ${bright}, ${NAME_COLOR})`;
    name.style.webkitBackgroundClip = 'text';
    name.style.backgroundClip = 'text';
    name.style.color = 'transparent';
    name.style.webkitTextFillColor = 'transparent';
    name.style.filter = `drop-shadow(0 0 ${40 * intensity}px rgba(255, 248, 230, ${0.85 * intensity})) drop-shadow(0 0 ${14 * intensity}px rgba(255, 255, 248, ${0.5 * intensity}))`;
    name.style.transition = 'none';
}

/** Fades the name back to plain text as the pointer leaves the hero. */
function dimHero(section: HTMLElement, name: HTMLElement | null) {
    section.querySelector('.hero-spotlight')?.classList.remove('visible');
    if (!name) return;
    name.style.transition = 'filter 0.5s ease-out';
    name.style.backgroundImage = `linear-gradient(90deg, ${NAME_COLOR} 0%, ${NAME_COLOR} 100%)`;
    name.style.filter = 'drop-shadow(0 0 0px rgba(255, 248, 230, 0)) drop-shadow(0 0 0px rgba(255, 255, 248, 0))';
}

/** Drops the lighting at once, for when the hero is off screen or the spotlight is switched off. */
function clearHero(section: HTMLElement, name: HTMLElement | null) {
    section.querySelector('.hero-spotlight')?.classList.remove('visible');
    if (!name) return;
    name.style.backgroundImage = 'none';
    name.style.color = NAME_COLOR;
    name.style.webkitTextFillColor = 'unset';
    name.style.filter = 'drop-shadow(0 0 0px rgba(255, 248, 230, 0))';
}

export function Home({ featured }: HomeProps) {
    const nameRef = useRef<HTMLHeadingElement>(null);
    const heroRef = useRef<HTMLElement>(null);
    const pointerRef = useRef({ x: 0, y: 0 });
    const frameRef = useRef(0);
    const { enabled: spotlightEnabled } = useSpotlightPreference();
    const [lead, ...rest] = featured;

    const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (document.documentElement.classList.contains('spotlight-disabled')) return;
        pointerRef.current = { x: e.clientX, y: e.clientY };
        if (frameRef.current) return;
        const section = e.currentTarget;
        // At most one lighting update per frame, however fast mousemove fires
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0;
            lightHero(section, nameRef.current, pointerRef.current.x, pointerRef.current.y);
        });
    }, []);

    const handleHeroMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        dimHero(e.currentTarget, nameRef.current);
    }, []);

    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    useEffect(() => {
        if (!spotlightEnabled && heroRef.current) clearHero(heroRef.current, nameRef.current);
    }, [spotlightEnabled]);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) clearHero(el, nameRef.current);
            },
            { threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* ===== HERO ===== */}
            <section
                ref={heroRef}
                className="hero-black-fade min-h-svh flex flex-col justify-end relative pt-32 pb-28 md:pb-36"
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
            >
                {/* Spotlight cone from above */}
                <div className="hero-spotlight" />

                {/* Floating dust motes */}
                {spotlightEnabled && <HeroParticles />}

                <div className="page-grid relative z-10">
                    <div className="col-span-full">
                        <p className="gallery-overline mb-6 animate-fade-in opacity-0">Portfolio 2026</p>
                        <h1 ref={nameRef} className="gallery-heading text-display m-0 text-ink">
                            Coleman Lai
                        </h1>
                    </div>

                    <div className="col-span-full sm:col-span-9 lg:col-span-6 mt-10 md:mt-14 border-l border-solid border-gold/50 pl-5 animate-fade-in opacity-0"
                        style={{ animationDelay: '0.15s' }}>
                        <p className="m-0 text-lead font-heading italic text-ink-muted">
                            My gallery of code and paper.
                        </p>
                        <p className="mt-3 mb-0 text-xs tracking-[0.2em] uppercase font-body text-ink-faint">
                            Computing Science &nbsp;<Link to="/admin" className="cursor-default text-inherit">·</Link>&nbsp; Origami Artist
                        </p>
                    </div>
                </div>

                {/* Scroll indicator */}
                <button
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-10 left-1/2 scroll-indicator cursor-pointer bg-transparent border-none p-2 text-gold"
                    aria-label="Scroll to content"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </button>
            </section>

            {/* ===== ABOUT ===== */}
            <ScrollSection className="py-24 md:py-32">
                <div id="about" className="scroll-mt-32">
                    <About />
                </div>
            </ScrollSection>

            {/* ===== CONNECT & WORK ===== */}
            <ScrollSection className="py-16 md:py-20 flex flex-col gap-16 md:gap-20">
                <LinkSection id="contact" title="Connect" links={CONNECT_LINKS} />
                <LinkSection id="work" title="Work" links={WORK_LINKS} />
            </ScrollSection>

            {/* ===== FEATURED WORKS ===== */}
            <ScrollSection className="py-24 md:py-32">
                <div className="page-grid">
                    <SectionHeader overline="The Gallery" title="Featured Works">
                        <p className="m-0 font-heading italic text-base">
                            A curated selection of my proudest works. Updated from time to time.
                        </p>
                    </SectionHeader>
                    {lead && (
                        <div className="col-span-full lg:col-span-9">
                            <ExhibitCard item={lead} layout="lead" />
                        </div>
                    )}
                    {rest.length > 0 && (
                        <div className="col-span-full lg:col-start-4 lg:col-span-9 mt-16 lg:mt-24">
                            <ExhibitGrid items={rest} priority={false} skipCount={0} maxColumns={2} />
                        </div>
                    )}
                </div>
            </ScrollSection>
        </>
    );
}
