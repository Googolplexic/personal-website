import { SEO } from '../components/layout/SEO';
import { myDesigns, otherDesigns } from '../assets/origami';
import foldPreviewData from '../assets/projects/fold-preview';
import boxPleatingData from '../assets/projects/box-pleating';
import origamiFractionsData from '../assets/projects/origami-fractions';
import { ItemProps, ProjectProps } from '../types';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const GroupedItemGrid = lazy(() =>
    import('../components/ui/GroupedItemGrid').then((m) => ({ default: m.GroupedItemGrid }))
);

export function Origami() {
    const featuredProjects: ProjectProps[] = [
        { ...foldPreviewData, slug: 'fold-preview', type: 'project' as const },
        { ...boxPleatingData, slug: 'box-pleating', type: 'project' as const },
        { ...origamiFractionsData, slug: 'origami-fractions', type: 'project' as const },
    ];

    const allItems: ItemProps[] = [
        ...myDesigns,
        ...otherDesigns,
        ...featuredProjects
    ];
    const galleryRef = useRef<HTMLDivElement>(null);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isDesktop) {
            setShowGallery(true);
            return;
        }

        const el = galleryRef.current;
        if (!el) return;

        let timer: number | null = null;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShowGallery(true);
                    observer.disconnect();
                    if (timer !== null) {
                        window.clearTimeout(timer);
                        timer = null;
                    }
                }
            },
            { rootMargin: '500px 0px', threshold: 0 }
        );

        observer.observe(el);
        timer = window.setTimeout(() => {
            setShowGallery(true);
            observer.disconnect();
        }, 2200);

        return () => {
            observer.disconnect();
            if (timer !== null) window.clearTimeout(timer);
        };
    }, []);

    return (
        <>
            <SEO
                title="Origami | Coleman Lai"
                description="Discover intricate origami creations by Coleman Lai. View complex paper art designs and follow my origami journey."
                keywords="origami, paper art, Coleman Lai, complex origami, paper folding, origami artist, Vancouver origami"
                pathname="/origami"
            />
            <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                <div className="text-center mb-14">
                    <p className="gallery-overline mb-4">The Gallery</p>
                    <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4"
                        style={{ color: 'var(--color-text-primary)' }}>
                        Origami
                    </h1>
                    <p className="text-base font-heading italic max-w-lg mx-auto mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                        Where geometric precision meets artistic expression.
                    </p>
                    <p className="text-sm font-body"
                       style={{ color: 'var(--color-text-tertiary)' }}>
                        More on{' '}
                        <a
                            href="https://www.instagram.com/12googolplex"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-accent-text)' }}
                        >
                            @12googolplex
                        </a>
                    </p>
                </div>

                <div ref={galleryRef}>
                    {showGallery ? (
                        <Suspense fallback={<div style={{ minHeight: '42rem' }} />}>
                            <GroupedItemGrid
                                items={allItems}
                                itemType="mixed"
                                showGrouping={true}
                                allowGroupingToggle={true}
                                myDesigns={myDesigns}
                                otherDesigns={otherDesigns}
                                software={featuredProjects}
                            />
                        </Suspense>
                    ) : (
                        <div style={{ minHeight: '42rem' }} />
                    )}
                </div>
            </div>
        </>
    );
}
