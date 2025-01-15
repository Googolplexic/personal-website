import { useParams, Navigate } from 'react-router-dom';
import projects from '../assets/projects';
import Markdown from 'react-markdown';
import { ProjectImageCarousel } from '../components/ProjectImageCarousel';
import { ProjectLinks } from '../components/ProjectLinks';
import { ProjectTechnologies } from '../components/ProjectTechnologies';

export function ProjectDetail() {
    const { projectSlug } = useParams();
    const project = projects.find(p => {
        const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return slug === projectSlug;
    });

    if (!project) {
        return <Navigate to="/portfolio" replace />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
                <h1 >{project.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {project.startDate} - {project.endDate || 'Present'}
                </p>
                <ProjectLinks project={project} />
                <ProjectImageCarousel images={project.images || []} title={project.title} />
                <h2>Technologies Used</h2>
                <ProjectTechnologies technologies={project.technologies} />
            </div>
            <div className="prose dark:prose-invert max-w-none text-left mt-12 lg:mt-0">
                <Markdown>{project.description}</Markdown>
            </div>
        </div>
    );
}
