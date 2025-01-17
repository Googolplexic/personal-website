import { useParams } from 'react-router-dom';
import projects from '../assets/projects';
import Markdown from 'react-markdown';
import { ProjectImageCarousel } from '../components/ProjectImageCarousel';
import { ProjectLinks } from '../components/ProjectLinks';
import { ProjectTechnologies } from '../components/ProjectTechnologies';
import { NotFound } from './NotFound';


export function ProjectDetail() {
    const { projectSlug } = useParams();
    const project = projects.find(p => p.slug === projectSlug);

    if (!project) {
        return <NotFound />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-0">
            <div>
                <h1 >{project.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {project.startDate === project.endDate ? project.startDate : `${project.startDate} - ${project.endDate || 'Present'}`}
                </p>
                <ProjectLinks project={project} className='mb-6'/>
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
