import { data } from 'react-router';
import type { Route } from './+types/project';
import { ProjectDetail } from '../pages/ProjectDetail';
import { allProjects, findExhibit, projectDetail } from '../content.server';
import { BASE_URL, absoluteUrl, notFoundMeta, seoMeta } from '../utils/seo';

export function loader({ params }: Route.LoaderArgs) {
    const found = findExhibit(allProjects, params.slug, 'P');
    if (!found) throw data(null, { status: 404 });
    const { item: project, exhibit, next, nextExhibit } = found;
    return {
        project: projectDetail(project),
        exhibit,
        next: {
            slug: next.slug,
            title: next.title,
            date: next.startDate,
            image: next.images?.[0],
            exhibit: nextExhibit,
        },
    };
}

// Unknown slugs boot from the 404 fallback, where React Router skips server data
// on first load; fetching it here turns the host's 404 into a not-found error.
export const clientLoader = ({ serverLoader }: Route.ClientLoaderArgs) => serverLoader();

export const meta: Route.MetaFunction = ({ loaderData }) => {
    if (!loaderData) return notFoundMeta();
    const { project } = loaderData;
    const pathname = `/portfolio/${project.slug}`;
    const image = project.images?.[0];
    const description = project.SEOdescription || project.summary;
    return seoMeta({
        title: `${project.title} | Coleman Lai`,
        description,
        keywords: project.keywords || [],
        pathname,
        type: 'article',
        image,
        imageAlt: `Screenshot of ${project.title}`,
        article: {
            publishedTime: project.startDate,
            modifiedTime: project.endDate,
            section: 'Software Development',
            tags: project.technologies,
        },
        breadcrumbs: [
            { name: 'Home', url: BASE_URL },
            { name: 'Portfolio', url: `${BASE_URL}/portfolio` },
            { name: project.title, url: `${BASE_URL}${pathname}` },
        ],
        structuredData: [{
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: project.title,
            description,
            url: `${BASE_URL}${pathname}`,
            author: { '@type': 'Person', name: 'Coleman Lai', url: BASE_URL },
            dateCreated: project.startDate,
            ...(project.endDate && { dateModified: project.endDate }),
            programmingLanguage: project.technologies,
            ...(project.githubUrl && { codeRepository: project.githubUrl }),
            ...(image && { image: absoluteUrl(image) }),
            keywords: project.keywords?.join(', ') || project.technologies.join(', '),
        }],
    });
};

export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
    return <ProjectDetail {...loaderData} />;
}
