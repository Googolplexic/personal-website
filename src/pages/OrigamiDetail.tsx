import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import allOrigami from '../assets/origami';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { Lightbox } from '../components/ui/Lightbox';
import { NotFound } from './NotFound';
import { ShareButton } from '../components/ui/ShareButton';
import { CategoryLabel } from '../components/ui/CategoryLabel';

const BASE_URL = 'https://www.colemanlai.com';

export function OrigamiDetail() {
    const { origamiSlug } = useParams();
    const navigate = useNavigate();
    const [cpLightboxOpen, setCpLightboxOpen] = useState(false);
    const origami = allOrigami.find(o => o.slug === origamiSlug);

    if (!origami) return <NotFound />;

    const currentIndex = allOrigami.indexOf(origami);
    const nextOrigami = allOrigami[(currentIndex + 1) % allOrigami.length];
    const exhibitNumber = String(allOrigami.length - currentIndex).padStart(2, '0');

    const shareUrl = `${BASE_URL}/origami/${origami.slug}`;
    const categoryLabel = origami.category === 'my-designs' ? 'My Designs' : 'Other Designs';
    const categoryColor = origami.category === 'my-designs' ? 'gallery-cat-green' : 'gallery-cat-blue';

    const cpFull = origami.creasePatternFull || origami.creasePattern;

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
                {/* Back navigation */}
                <button
                    onClick={() => navigate('/origami')}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-body mb-10 p-0 transition-colors duration-300"
                    style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </button>

                {/* Title */}
                <div className="mb-10">
                    <span className="exhibit-label mb-4 inline-flex">Exhibit {exhibitNumber}</span>
                    <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4 mt-3"
                        style={{ color: 'var(--color-text-primary)' }}>
                        {origami.title}
                    </h1>
                </div>

                {/* Model images carousel */}
                <div className="mb-8 overflow-hidden">
                    <ProjectImageCarousel
                        images={origami.modelImages}
                        imagesFull={origami.modelImagesFull}
                        title={origami.title}
                    />
                </div>

                {/* Horizontal metadata row */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 pb-8 mb-8"
                    style={{ borderBottom: '1px solid var(--divider)' }}>
                    <p className="text-xs tracking-[0.2em] uppercase font-body"
                        style={{ color: 'var(--color-text-secondary)' }}>
                        {origami.date}
                    </p>
                    {origami.designer && (
                        <>
                            <span className="text-xs font-body" style={{ color: 'var(--color-text-tertiary)' }}>·</span>
                            <p className="text-xs tracking-wide font-body"
                                style={{ color: 'var(--color-text-secondary)' }}>
                                {origami.designer}
                            </p>
                        </>
                    )}
                    <span className="text-xs font-body" style={{ color: 'var(--color-text-tertiary)' }}>·</span>
                    <CategoryLabel label={categoryLabel} color={categoryColor} />
                    <span className="ml-auto" />
                    <ShareButton url={shareUrl} title={origami.title} description={origami.description} />
                </div>

                {/* Description */}
                {origami.description && (
                    <p className="text-base leading-relaxed font-body mb-12"
                        style={{ color: 'var(--color-text-primary)' }}>
                        {origami.description}
                    </p>
                )}

                {/* Crease pattern */}
                {origami.creasePattern && (
                    <div className="mb-16">
                        <p className="gallery-overline mb-6">Crease Pattern</p>
                        <div className="max-w-sm">
                            <img
                                src={origami.creasePattern}
                                alt={`${origami.title} crease pattern`}
                                className="w-full object-contain cursor-zoom-in"
                                onClick={() => setCpLightboxOpen(true)}
                                loading="lazy"
                                title="Click to enlarge"
                            />
                        </div>
                        {cpLightboxOpen && cpFull && (
                            <Lightbox
                                images={[cpFull]}
                                initialIndex={0}
                                alt="Crease Pattern"
                                onClose={() => setCpLightboxOpen(false)}
                            />
                        )}
                    </div>
                )}

                {/* Next origami */}
                {nextOrigami && (
                    <div className="pt-10" style={{ borderTop: '1px solid var(--divider)' }}>
                        <div className="flex items-center justify-between">
                            <p className="gallery-overline">Next</p>
                            <button
                                onClick={() => { navigate(`/origami/${nextOrigami.slug}`); window.scrollTo(0, 0); }}
                                className="inline-flex items-center gap-2 font-heading italic text-lg group p-0"
                                style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none' }}
                            >
                                {nextOrigami.title}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"
                                    className="transition-transform duration-300 group-hover:translate-x-1">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
