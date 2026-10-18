import type { Route } from './+types/home';
import { Home } from '../pages/Home';
import { ExternalRedirect } from '../components/layout/ExternalRedirect';
import { allOrigami, allProjects, origamiCard, projectCard } from '../content.server';
import { BASE_URL, seoMeta } from '../utils/seo';
import { useClientSearchParams } from '../utils/useHydrated';

const FEATURED_SLUGS = ['pi-2026', 'personal-website', 'ryujin-3-5', 'torgal', 'tonberry', 'origami-fractions'];
const DESCRIPTION = 'Software projects and origami by Coleman Lai, a Computing Science student at Simon Fraser University in Vancouver.';

export function loader() {
    const cards = [...allProjects.map(projectCard), ...allOrigami.map(origamiCard)];
    return {
        featured: FEATURED_SLUGS.flatMap((slug) => cards.filter((item) => item.slug === slug)),
        shareImage: allOrigami.find((piece) => piece.slug === 'ryujin-3-5')?.modelImages[0],
        builtOn: new Date().toISOString().slice(0, 10),
    };
}

export const meta: Route.MetaFunction = ({ loaderData }) => seoMeta({
    title: 'Coleman Lai | Developer & Origami Artist | Vancouver',
    description: DESCRIPTION,
    keywords: [
        'Coleman Lai',
        'software developer',
        'computing science',
        'origami artist',
        'SFU',
        'Simon Fraser University',
        'Vancouver',
        'full-stack developer',
        'origami',
        'paper art',
        'portfolio',
        'web developer',
        'data science',
    ],
    pathname: '/',
    image: loaderData?.shareImage,
    imageAlt: 'Ryujin 3.5',
    breadcrumbs: [{ name: 'Home', url: BASE_URL }],
    structuredData: [
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Coleman Lai',
            alternateName: 'Coleman Lai Portfolio',
            url: BASE_URL,
            description: DESCRIPTION,
            author: { '@type': 'Person', name: 'Coleman Lai' },
            potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE_URL}/portfolio?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Coleman Lai',
            url: BASE_URL,
            jobTitle: 'Computing Science Student',
            alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Simon Fraser University',
                sameAs: 'https://www.sfu.ca',
            },
            knowsAbout: ['Software Development', 'Full-Stack Development', 'Origami', 'Paper Art', 'React', 'TypeScript'],
            sameAs: [
                'https://www.linkedin.com/in/coleman-lai',
                'https://github.com/Googolplexic',
                'https://www.instagram.com/12googolplex',
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            mainEntity: { '@type': 'Person', name: 'Coleman Lai' },
            dateCreated: '2024-01-01',
            ...(loaderData && { dateModified: loaderData.builtOn }),
        },
    ],
});

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
    const [searchParams] = useClientSearchParams();
    const redirectTo = searchParams.get('to');
    if (redirectTo) return <ExternalRedirect to={redirectTo} />;
    return <Home featured={loaderData.featured} featuredSlugs={FEATURED_SLUGS} />;
}
