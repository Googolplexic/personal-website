import { data } from 'react-router';
import type { Route } from './+types/origami-piece';
import { OrigamiDetail } from '../pages/OrigamiDetail';
import { allOrigami, findExhibit, origamiDetail } from '../content.server';
import { BASE_URL, absoluteUrl, notFoundMeta, seoMeta } from '../utils/seo';

export function loader({ params }: Route.LoaderArgs) {
    const found = findExhibit(allOrigami, params.slug, 'O');
    if (!found) throw data(null, { status: 404 });
    const { item: origami, exhibit, next, nextExhibit } = found;
    return {
        origami: origamiDetail(origami),
        exhibit,
        next: {
            slug: next.slug,
            title: next.title,
            date: next.date,
            image: next.modelImages[0],
            exhibit: nextExhibit,
        },
    };
}

// Unknown slugs boot from the 404 fallback, where React Router skips server data
// on first load; fetching it here turns the host's 404 into a not-found error.
export const clientLoader = ({ serverLoader }: Route.ClientLoaderArgs) => serverLoader();

export const meta: Route.MetaFunction = ({ loaderData }) => {
    if (!loaderData) return notFoundMeta();
    const { origami } = loaderData;
    const pathname = `/origami/${origami.slug}`;
    const image = origami.modelImages[0];
    return seoMeta({
        title: `${origami.title} | Coleman Lai`,
        description: origami.description
            || `${origami.title} — an origami creation${origami.designer ? ` by ${origami.designer}` : ' by Coleman Lai'}.`,
        keywords: ['origami', 'paper art', 'Coleman Lai', origami.title, ...(origami.keywords || []), ...(origami.tags || [])],
        pathname,
        type: 'article',
        image,
        imageAlt: `Photo of ${origami.title} origami`,
        breadcrumbs: [
            { name: 'Home', url: BASE_URL },
            { name: 'Origami', url: `${BASE_URL}/origami` },
            { name: origami.title, url: `${BASE_URL}${pathname}` },
        ],
        structuredData: [{
            '@context': 'https://schema.org',
            '@type': 'VisualArtwork',
            name: origami.title,
            description: origami.description || `${origami.title} — origami`,
            url: `${BASE_URL}${pathname}`,
            artMedium: 'Paper',
            artform: 'Origami',
            creator: { '@type': 'Person', name: origami.designer || 'Coleman Lai', url: BASE_URL },
            dateCreated: origami.date,
            ...(image && { image: absoluteUrl(image) }),
        }],
    });
};

export default function OrigamiPieceRoute({ loaderData }: Route.ComponentProps) {
    return <OrigamiDetail {...loaderData} />;
}
