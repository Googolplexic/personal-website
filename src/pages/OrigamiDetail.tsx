import { lazy, Suspense, useState } from 'react';
import { DetailLayout, DetailList } from '../components/detail/DetailLayout';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { HighlightedText } from '../components/ui/HighlightedText';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { Lightbox } from '../components/ui/Lightbox';
import { ShareButton } from '../components/ui/ShareButton';
import { NextExhibit, OrigamiProps } from '../types';
import { CATEGORY_LABELS } from '../utils/galleryFilters';
import { BASE_URL } from '../utils/seo';
import { useClientSearchParams } from '../utils/useHydrated';

// The crease pattern button is max-w-sm
const CREASE_PATTERN_SIZES = '384px';

// Most pieces have no writeup, so the markdown renderer loads only for the ones that do
const MarkdownBody = lazy(() => import('../components/ui/MarkdownBody').then(module => ({ default: module.MarkdownBody })));

interface OrigamiDetailProps {
    origami: OrigamiProps;
    exhibit: string;
    next: NextExhibit;
}

export function OrigamiDetail({ origami, exhibit, next }: OrigamiDetailProps) {
    const [searchParams] = useClientSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const [cpLightboxOpen, setCpLightboxOpen] = useState(false);
    const cpSet = origami.creasePattern ? origami.imageSets?.[origami.creasePattern] : undefined;
    const cpFull = cpSet?.large || origami.creasePatternFull || origami.creasePattern;

    return (
        <DetailLayout
            section="/origami"
            exhibit={exhibit}
            title={<HighlightedText text={origami.title} searchTerm={searchTerm} />}
            lead={origami.description && <HighlightedText text={origami.description} searchTerm={searchTerm} />}
            next={next}
            details={
                <>
                    <DetailList items={[
                        { label: 'Date', value: <span className="font-heading italic text-base text-ink">{origami.date}</span> },
                        ...(origami.designer ? [{ label: 'Designer', value: <HighlightedText text={origami.designer} searchTerm={searchTerm} /> }] : []),
                        { label: 'Collection', value: CATEGORY_LABELS[origami.category] },
                    ]} />
                    <ShareButton className="self-start" url={`${BASE_URL}/origami/${origami.slug}`} title={origami.title} description={origami.description} />
                </>
            }
        >
            <ProjectImageCarousel images={origami.modelImages} imagesFull={origami.modelImagesFull} imageSets={origami.imageSets} title={origami.title} slug={origami.slug} />

            {origami.writeup && (
                <Suspense fallback={null}>
                    <MarkdownBody source={origami.writeup} searchTerm={searchTerm} />
                </Suspense>
            )}

            {origami.creasePattern && (
                <section>
                    <h2 className="gallery-overline mt-0 mb-6">Crease Pattern</h2>
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => setCpLightboxOpen(true)}
                        className="relative block w-full max-w-sm p-0 bg-transparent cursor-zoom-in"
                    >
                        <ImagePlaceholder set={cpSet} fit="contain" />
                        <img
                            src={origami.creasePattern}
                            srcSet={cpSet?.srcSet}
                            sizes={cpSet && CREASE_PATTERN_SIZES}
                            alt={`${origami.title} crease pattern`}
                            data-fade
                            className="relative block w-full h-auto object-contain"
                            loading="lazy"
                            title="Click to enlarge"
                            width={cpSet?.width}
                            height={cpSet?.height}
                        />
                    </button>
                    {cpLightboxOpen && cpFull && (
                        <Lightbox
                            images={[{
                                src: cpFull,
                                width: cpSet?.width,
                                height: cpSet?.height,
                                preview: { src: origami.creasePattern, srcSet: cpSet?.srcSet, sizes: cpSet && CREASE_PATTERN_SIZES },
                            }]}
                            initialIndex={0}
                            alt="Crease Pattern"
                            onClose={() => setCpLightboxOpen(false)}
                        />
                    )}
                </section>
            )}
        </DetailLayout>
    );
}
