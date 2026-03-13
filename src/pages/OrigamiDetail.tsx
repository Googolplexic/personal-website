import { useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import allOrigami from '../assets/origami';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { Lightbox } from '../components/ui/Lightbox';
import { NotFound } from './NotFound';
import { ShareButton } from '../components/ui/ShareButton';
import { CategoryLabel } from '../components/ui/CategoryLabel';
import { HighlightedText } from '../components/ui/HighlightedText';

const BASE_URL = 'https://www.colemanlai.com';

export function OrigamiDetail() {
    const { origamiSlug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const searchTerm = searchParams.get('search') || '';
    const [cpLightboxOpen, setCpLightboxOpen] = useState(false);
    const origami = allOrigami.find(o => o.slug === origamiSlug);

    if (!origami) return <NotFound />;

    const currentIndex = allOrigami.indexOf(origami);
    // Next = higher exhibit number (newer) = previous in array order
    const nextIndex = (currentIndex - 1 + allOrigami.length) % allOrigami.length;
    const nextOrigami = allOrigami[nextIndex];
    const exhibitNumber = 'O·' + String(allOrigami.length - currentIndex).padStart(2, '0');
    const nextExhibitNumber = 'O·' + String(allOrigami.length - nextIndex).padStart(2, '0');

    // Back destination: use state.from if it's a known gallery, else canonical /origami
    const from = (state as { from?: string } | null)?.from;
    const backTarget = (from === '/origami' || from === '/portfolio') ? from : '/origami';
    const backLabel = from === '/' ? 'To Gallery' : 'Back to Gallery';
    const backDestination = location.search ? `${backTarget}${location.search}` : backTarget;

    const shareUrl = `${BASE_URL}/origami/${origami.slug}`;
    const categoryLabel = origami.category === 'my-designs' ? 'My Designs' : 'Other Designs';
    const categoryColor = origami.category === 'my-designs' ? 'gallery-cat-green' : 'gallery-cat-blue';

    const cpFull = origami.creasePatternFull || origami.creasePattern;

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
                {/* Back navigation */}
                <button
                    onClick={() => navigate(backDestination)}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-body mb-10 p-0 transition-colors duration-300"
                    style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {backLabel}
                </button>

                {/* Title */}
                <div className="mb-10">
                    <span className="exhibit-label mb-4 inline-flex">Exhibit {exhibitNumber}</span>
                    <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4 mt-3"
                        style={{ color: 'var(--color-text-primary)' }}>
                        <HighlightedText text={origami.title} searchTerm={searchTerm} />
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
                                <HighlightedText text={origami.designer} searchTerm={searchTerm} />
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
                        <HighlightedText text={origami.description} searchTerm={searchTerm} />
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
                        <p className="gallery-overline mb-5">Next Exhibit</p>
                        <button
                            onClick={() => { navigate(`/origami/${nextOrigami.slug}`, { state: { from: backTarget } }); window.scrollTo(0, 0); }}
                            className="group flex items-center gap-5 w-full text-left p-0 bg-transparent border-none cursor-pointer"
                        >
                            {/* Thumbnail */}
                            {nextOrigami.modelImages.length > 0 && (
                                <div className="w-16 h-16 flex-shrink-0 overflow-hidden"
                                    style={{ border: '1px solid var(--color-border)' }}>
                                    <img
                                        src={nextOrigami.modelImages[0]}
                                        alt={nextOrigami.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="exhibit-label text-xs mb-1 block">{nextExhibitNumber}</span>
                                <span className="block font-heading italic text-lg leading-tight mb-0.5 transition-colors duration-300"
                                    style={{ color: 'var(--color-text-primary)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}>
                                    {nextOrigami.title}
                                </span>
                                <span className="text-xs font-body tracking-[0.1em]"
                                    style={{ color: 'var(--color-text-tertiary)' }}>
                                    {nextOrigami.date}
                                </span>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"
                                className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
