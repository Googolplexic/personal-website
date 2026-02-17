import { About } from '../components/sections/About';
import { Contact } from '../components/sections/Contact';
import { SEO } from '../components/layout/SEO';
import { ResumeSection } from '../components/sections/ResumeSection';
import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Link } from '../components/ui/base';
import { useScrollRevealClass } from '../utils/useScrollReveal';
import { useCallback, useRef } from 'react';

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

    const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const section = e.currentTarget;
        const spotlight = section.querySelector('.hero-spotlight') as HTMLElement;
        if (!spotlight) return;
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        spotlight.style.setProperty('--hero-x', `${x}%`);
        spotlight.style.setProperty('--hero-y', `${y}%`);

        // Text illumination — bright gradient spot follows mouse across name
        const name = nameRef.current;
        if (name) {
            const nameRect = name.getBoundingClientRect();
            // Horizontal position relative to name for the gradient sweep
            const relX = ((e.clientX - nameRect.left) / nameRect.width) * 100;
            // Vertical proximity for intensity
            const cy = nameRect.top + nameRect.height / 2;
            const vertDist = Math.abs(e.clientY - cy);
            const maxVert = 250;
            const intensity = Math.max(0, 1 - vertDist / maxVert);

            if (intensity > 0) {
                // Gradient text illumination — bright warm spot sweeps across letters
                const bright = `rgba(255, 255, 248, ${Math.min(1, 0.6 + intensity * 0.4)})`;
                const base = '#e8e4de';
                name.style.backgroundImage = `linear-gradient(90deg, ${base} ${relX - 20}%, ${bright} ${relX}%, ${base} ${relX + 20}%)`;
                name.style.webkitBackgroundClip = 'text';
                name.style.backgroundClip = 'text';
                name.style.color = 'transparent';
                name.style.webkitTextFillColor = 'transparent';
                // Warm glow behind
                name.style.filter = `drop-shadow(0 0 ${20 * intensity}px rgba(255, 248, 230, ${0.5 * intensity}))`;
            } else {
                name.style.backgroundImage = 'none';
                name.style.color = '#e8e4de';
                name.style.webkitTextFillColor = 'unset';
                name.style.filter = 'none';
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
                className="min-h-screen flex flex-col items-center justify-center relative px-6"
                onMouseMove={handleHeroMouseMove}
            >
                {/* Spotlight cone from above */}
                <div className="hero-spotlight" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <p className="gallery-overline mb-6 animate-fade-in opacity-0">Portfolio 2025</p>

                    <h1 ref={nameRef} className="gallery-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 animate-fade-in opacity-0"
                        style={{ color: 'var(--color-text-primary)', animationDelay: '0.15s' }}>
                        Coleman Lai
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl font-heading italic tracking-wide mb-6 animate-fade-in opacity-0"
                       style={{ color: 'var(--color-text-secondary)', animationDelay: '0.35s' }}>
                        Curating digital experiences through code and paper.
                    </p>

                    <div className="gallery-divider mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }} />

                    <p className="text-xs tracking-[0.2em] uppercase font-body animate-fade-in opacity-0"
                       style={{ color: 'var(--color-text-tertiary)', animationDelay: '0.6s' }}>
                        Computing Science &nbsp;·&nbsp; Origami Artist
                        <Link to="/admin" className="!no-underline cursor-default" style={{ color: 'inherit', opacity: 1 }}>.</Link>
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
                <div id="about" className="max-w-2xl mx-auto px-6 text-center">
                    <About />
                </div>
            </ScrollSection>

            {/* ===== CONTACT & RESUME ===== */}
            <ScrollSection className="py-20 md:py-32">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-center lg:text-left">
                        <Contact />
                        <ResumeSection />
                    </div>
                </div>
            </ScrollSection>

            {/* ===== FEATURED WORKS ===== */}
            <ScrollSection className="py-20 md:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <p className="gallery-overline mb-4">Selected Works</p>
                        <h2 className="gallery-heading text-3xl md:text-4xl"
                            style={{ color: 'var(--color-text-primary)' }}>
                            Featured Projects
                        </h2>
                    </div>
                    <ProjectGrid
                        featuredSlugs={featuredSlugs}
                        hideControls
                    />
                </div>
            </ScrollSection>

            {/* Footer */}
            <footer className="py-12 text-center">
                <p className="text-xs tracking-[0.2em] uppercase font-body" style={{ color: 'var(--color-text-tertiary)' }}>
                    © {new Date().getFullYear()} Coleman Lai
                </p>
            </footer>
        </>
    );
}

