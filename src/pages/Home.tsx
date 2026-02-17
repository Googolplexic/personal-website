import { About } from '../components/sections/About';
import { Contact } from '../components/sections/Contact';
import { SEO } from '../components/layout/SEO';
import { ResumeSection } from '../components/sections/ResumeSection';
import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Link } from '../components/ui/base';
import { useScrollRevealClass } from '../utils/useScrollReveal';
import { useCallback, useEffect, useRef } from 'react';

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
                        name.style.filter = 'none';
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
        if (!window.matchMedia('(hover: hover)').matches) return;
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

        // Text illumination — direction-sensitive glow with eased falloff
        const name = nameRef.current;
        if (name) {
            const nameRect = name.getBoundingClientRect();
            // Horizontal position relative to name for the gradient sweep
            const relX = ((e.clientX - nameRect.left) / nameRect.width) * 100;
            // Distance from name center (both axes)
            const cx = nameRect.left + nameRect.width / 2;
            const cy = nameRect.top + nameRect.height / 2;
            const dx = (e.clientX - cx) / (nameRect.width * 1.5);
            const dy = (e.clientY - cy) / 300;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Cubic ease-out for smooth falloff
            const raw = Math.max(0, 1 - dist);
            const intensity = raw * raw * (3 - 2 * raw); // smoothstep

            // Gradient spread narrows as mouse gets closer (tighter beam when near)
            const spread = 15 + 20 * (1 - intensity);

            if (intensity > 0.01) {
                const bright = `rgba(255, 255, 255, ${Math.min(1, 0.7 + intensity * 0.3)})`;
                const base = '#e8e4de';
                name.style.backgroundImage = `linear-gradient(90deg, ${base} ${relX - spread}%, ${bright} ${relX}%, ${base} ${relX + spread}%)`;
                name.style.webkitBackgroundClip = 'text';
                name.style.backgroundClip = 'text';
                name.style.color = 'transparent';
                name.style.webkitTextFillColor = 'transparent';
                name.style.filter = `drop-shadow(0 0 ${40 * intensity}px rgba(255, 248, 230, ${0.85 * intensity})) drop-shadow(0 0 ${14 * intensity}px rgba(255, 255, 248, ${0.5 * intensity}))`;
                name.style.transition = 'filter 0.3s ease-out';
            } else {
                name.style.backgroundImage = 'none';
                name.style.color = '#e8e4de';
                name.style.webkitTextFillColor = 'unset';
                name.style.filter = 'none';
                name.style.transition = 'filter 0.5s ease-out';
            }
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
                className="min-h-screen flex flex-col items-center justify-center relative px-6"
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={() => {
                    const spotlight = heroRef.current?.querySelector('.hero-spotlight');
                    if (spotlight) spotlight.classList.remove('visible');
                    const name = nameRef.current;
                    if (name) {
                        name.style.backgroundImage = 'none';
                        name.style.color = '#e8e4de';
                        name.style.webkitTextFillColor = 'unset';
                        name.style.filter = 'none';
                    }
                }}
            >
                {/* Spotlight cone from above */}
                <div className="hero-spotlight" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <p className="gallery-overline mb-6 animate-fade-in opacity-0">Portfolio 2026</p>

                    <h1 ref={nameRef} className="gallery-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 animate-fade-in opacity-0"
                        style={{ color: 'var(--color-text-primary)', animationDelay: '0.15s' }}>
                        Coleman Lai
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl font-heading italic tracking-wide mb-6 animate-fade-in opacity-0"
                       style={{ color: 'var(--color-text-secondary)', animationDelay: '0.35s' }}>
                        A gallery of code and paper.
                    </p>

                    <div className="gallery-divider mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }} />

                    <p className="text-xs tracking-[0.2em] uppercase font-body animate-fade-in opacity-0"
                       style={{ color: 'var(--color-text-tertiary)', animationDelay: '0.6s' }}>
                        Computing Science &nbsp;·&nbsp; Origami Artist
                        <Link to="/admin" className="!no-underline cursor-default" style={{ color: 'inherit', opacity: 1 }}>{'\u200B'}</Link>
                    </p>
                </div>

                {/* Scroll indicator */}
                <button
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-10 left-1/2 scroll-indicator cursor-pointer bg-transparent border-none p-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
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

            {/* ===== CONTACT & RESUME ===== */}
            <ScrollSection className="py-20 md:py-32">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-center lg:text-left">
                        <Contact />
                        <ResumeSection />
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

