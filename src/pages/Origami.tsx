import { SEO } from '../components/layout/SEO';
import { GroupedItemGrid } from '../components/ui/GroupedItemGrid';
import { myDesigns, otherDesigns } from '../assets/origami';
import foldPreviewData from '../assets/projects/fold-preview';
import boxPleatingData from '../assets/projects/box-pleating';
import origamiFractionsData from '../assets/projects/origami-fractions';
import { ItemProps, ProjectProps } from '../types';

const BASE_URL = "https://www.colemanlai.com";

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


    const structuredData = {
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
    };

    return (
        <>
            <SEO
                title="Origami Gallery | Coleman Lai"
                description="Discover intricate origami creations by Coleman Lai. View complex paper art designs, original patterns, and folding software."
                keywords={[
                    "origami",
                    "paper art",
                    "Coleman Lai",
                    "IFS Copperleaf",
                    "Gen AI software developer",
                    "complex origami",
                    "paper folding",
                    "origami artist",
                    "Vancouver origami",
                    "origami gallery",
                    "paper sculpture",
                    "geometric origami",
                    "origami designs"
                ]}
                pathname="/origami"
                breadcrumbs={[
                    { name: "Home", url: BASE_URL },
                    { name: "Origami", url: `${BASE_URL}/origami` }
                ]}
                structuredData={structuredData}
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
        </>
    );
}
