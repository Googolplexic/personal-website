import { Routes, Route, useLocation } from 'react-router-dom';
import { SEO } from '../components/layout/SEO';
import { GroupedItemGrid } from '../components/ui/GroupedItemGrid';
import allOrigami, { myDesigns, otherDesigns } from '../assets/origami';
import foldPreviewData from '../assets/projects/fold-preview';
import boxPleatingData from '../assets/projects/box-pleating';
import origamiFractionsData from '../assets/projects/origami-fractions';
import { ItemProps, ProjectProps } from '../types';
import { OrigamiDetail } from './OrigamiDetail';

const BASE_URL = "https://www.colemanlai.com";

function getOrigamiImage(origami: typeof allOrigami[number]): string | undefined {
    return origami.modelImages?.[0];
}

function OrigamiGallery() {
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

    return (
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

            <GroupedItemGrid
                items={allItems}
                itemType="mixed"
                showGrouping={true}
                allowGroupingToggle={true}
                myDesigns={myDesigns}
                otherDesigns={otherDesigns}
                software={featuredProjects}
            />
        </div>
    );
}

export function Origami() {
    const location = useLocation();
    const origamiSlug = location.pathname.split('/origami/')[1];
    const currentOrigami = origamiSlug ? allOrigami.find(o => o.slug === origamiSlug) : null;

    const origamiImage = currentOrigami ? getOrigamiImage(currentOrigami) : undefined;
    const origamiOgImage = origamiImage
        ? (origamiImage.startsWith('http') ? origamiImage : `${BASE_URL}${origamiImage}`)
        : undefined;

    const galleryStructuredData = !currentOrigami ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Origami | Coleman Lai",
        "description": "A gallery of intricate origami creations by Coleman Lai, featuring complex designs, original patterns, and folding software.",
        "url": `${BASE_URL}/origami`,
        "isPartOf": { "@type": "WebSite", "name": "Coleman Lai", "url": BASE_URL },
        "author": {
            "@type": "Person",
            "name": "Coleman Lai",
            "url": BASE_URL,
            "sameAs": ["https://www.instagram.com/12googolplex"]
        },
        "about": {
            "@type": "Thing",
            "name": "Origami",
            "description": "The art of paper folding"
        },
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": myDesigns.length + otherDesigns.length,
            "itemListElement": myDesigns.map((d, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                    "@type": "VisualArtwork",
                    "name": d.title,
                    "artMedium": "Paper",
                    "artform": "Origami",
                    "creator": { "@type": "Person", "name": d.designer || "Coleman Lai" }
                }
            }))
        }
    } : undefined;

    const origamiItemSchema = currentOrigami ? {
        "@context": "https://schema.org",
        "@type": "VisualArtwork",
        "name": currentOrigami.title,
        "description": currentOrigami.description || `${currentOrigami.title} — origami`,
        "url": `${BASE_URL}/origami/${origamiSlug}`,
        "artMedium": "Paper",
        "artform": "Origami",
        "creator": {
            "@type": "Person",
            "name": currentOrigami.designer || "Coleman Lai",
            "url": BASE_URL
        },
        "dateCreated": currentOrigami.date,
        ...(origamiOgImage && { "image": origamiOgImage }),
    } : undefined;

    return (
        <>
            <SEO
                title={currentOrigami
                    ? `${currentOrigami.title} | Coleman Lai`
                    : "Origami Gallery | Coleman Lai"
                }
                description={currentOrigami
                    ? (currentOrigami.description || `${currentOrigami.title} — an origami creation${currentOrigami.designer ? ` by ${currentOrigami.designer}` : ' by Coleman Lai'}.`)
                    : "Discover intricate origami creations by Coleman Lai. View complex paper art designs, original patterns, and folding software."
                }
                keywords={currentOrigami
                    ? ['origami', 'paper art', 'Coleman Lai', currentOrigami.title, ...(currentOrigami.keywords || []), ...(currentOrigami.tags || [])]
                    : ["origami", "paper art", "Coleman Lai", "IFS Copperleaf", "Gen AI software developer", "complex origami", "paper folding", "origami artist", "Vancouver origami", "origami gallery", "paper sculpture", "geometric origami", "origami designs"]
                }
                pathname={currentOrigami ? `/origami/${origamiSlug}` : "/origami"}
                type={currentOrigami ? "article" : "website"}
                image={origamiOgImage}
                imageAlt={currentOrigami ? `Photo of ${currentOrigami.title} origami` : undefined}
                breadcrumbs={currentOrigami ? [
                    { name: "Home", url: BASE_URL },
                    { name: "Origami", url: `${BASE_URL}/origami` },
                    { name: currentOrigami.title, url: `${BASE_URL}/origami/${origamiSlug}` }
                ] : [
                    { name: "Home", url: BASE_URL },
                    { name: "Origami", url: `${BASE_URL}/origami` }
                ]}
                structuredData={currentOrigami
                    ? (origamiItemSchema ? [origamiItemSchema] : undefined)
                    : (galleryStructuredData ? [galleryStructuredData] : undefined)
                }
            />
            <Routes>
                <Route index element={<OrigamiGallery />} />
                <Route path=":origamiSlug" element={<OrigamiDetail />} />
            </Routes>
        </>
    );
}
