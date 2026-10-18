import type { Route } from './+types/origami';
import { Origami } from '../pages/Origami';
import { allProjects, myDesigns, origamiCard, otherDesigns, projectCard } from '../content.server';
import { BASE_URL, seoMeta } from '../utils/seo';

const ORIGAMI_SOFTWARE_SLUGS = ['fold-preview', 'box-pleating', 'origami-fractions'];

export function loader() {
    const pieces = [...myDesigns, ...otherDesigns];
    const lead = pieces.find((piece) => piece.slug === 'ryujin-3-5') ?? pieces.find((piece) => piece.modelImages[0]);
    return {
        myDesigns: myDesigns.map(origamiCard),
        otherDesigns: otherDesigns.map(origamiCard),
        software: ORIGAMI_SOFTWARE_SLUGS.flatMap((slug) => allProjects.filter((project) => project.slug === slug)).map(projectCard),
        shareImage: lead?.modelImages[0],
        shareImageAlt: lead ? `Photo of ${lead.title}` : undefined,
    };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
    const pieces = loaderData ? [...loaderData.myDesigns, ...loaderData.otherDesigns] : [];
    return seoMeta({
        title: 'Origami Gallery | Coleman Lai',
        description: 'Discover intricate origami creations by Coleman Lai. View complex paper art designs, original patterns, and folding software.',
        keywords: ['origami', 'paper art', 'Coleman Lai', 'complex origami', 'paper folding', 'origami artist', 'Vancouver origami', 'origami gallery', 'paper sculpture', 'geometric origami', 'origami designs'],
        pathname: '/origami',
        image: loaderData?.shareImage,
        imageAlt: loaderData?.shareImageAlt,
        breadcrumbs: [
            { name: 'Home', url: BASE_URL },
            { name: 'Origami', url: `${BASE_URL}/origami` },
        ],
        structuredData: [{
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Origami | Coleman Lai',
            description: 'A gallery of intricate origami creations by Coleman Lai, featuring complex designs, original patterns, and folding software.',
            url: `${BASE_URL}/origami`,
            isPartOf: { '@type': 'WebSite', name: 'Coleman Lai', url: BASE_URL },
            author: {
                '@type': 'Person',
                name: 'Coleman Lai',
                url: BASE_URL,
                sameAs: ['https://www.instagram.com/12googolplex'],
            },
            about: { '@type': 'Thing', name: 'Origami', description: 'The art of paper folding' },
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: pieces.length,
                itemListElement: pieces.map((piece, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    item: {
                        '@type': 'VisualArtwork',
                        name: piece.title,
                        artMedium: 'Paper',
                        artform: 'Origami',
                        creator: { '@type': 'Person', name: piece.designer || 'Coleman Lai' },
                    },
                })),
            },
        }],
    });
};

export default function OrigamiRoute({ loaderData }: Route.ComponentProps) {
    return <Origami {...loaderData} />;
}
