import type { Route } from './+types/portfolio';
import { Portfolio } from '../pages/Portfolio';
import { allProjects, projectCard } from '../content.server';
import { keepDataOnQueryChange } from '../utils/routeData';
import { BASE_URL, seoMeta } from '../utils/seo';

const DESCRIPTION = 'Browse my software development projects, including web applications, AI implementations, and technical solutions.';

export function loader() {
    const lead = allProjects
        .filter((project) => project.images?.[0])
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
    return {
        projects: allProjects.map(projectCard),
        shareImage: lead?.images?.[0],
    };
}

export const shouldRevalidate = keepDataOnQueryChange;

export const meta: Route.MetaFunction = ({ loaderData }) => seoMeta({
    title: 'Software Portfolio | Coleman Lai',
    description: DESCRIPTION,
    keywords: ['software portfolio', 'full-stack development', 'web applications', 'React', 'TypeScript', 'Node.js'],
    pathname: '/portfolio',
    image: loaderData?.shareImage,
    imageAlt: 'Screenshot from the newest portfolio project',
    breadcrumbs: [
        { name: 'Home', url: BASE_URL },
        { name: 'Portfolio', url: `${BASE_URL}/portfolio` },
    ],
    structuredData: loaderData ? [{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Software Portfolio | Coleman Lai',
        description: 'Browse software development projects by Coleman Lai, including web applications, AI implementations, and technical solutions.',
        url: `${BASE_URL}/portfolio`,
        isPartOf: { '@type': 'WebSite', name: 'Coleman Lai', url: BASE_URL },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: loaderData.projects.length,
            itemListElement: loaderData.projects.map((project, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: project.title,
                url: `${BASE_URL}/portfolio/${project.slug}`,
            })),
        },
    }] : [],
});

export default function PortfolioRoute({ loaderData }: Route.ComponentProps) {
    return <Portfolio projects={loaderData.projects} />;
}
