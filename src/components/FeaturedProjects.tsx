import { Project } from './Project';
import projects from '../assets/projects';

interface FeaturedProjectsProps {
    featuredSlugs: string[];
}

export function FeaturedProjects({ featuredSlugs }: FeaturedProjectsProps) {
    const featuredProjects = projects.filter(project => 
        featuredSlugs.includes(project.slug)
    );

    return (
        <section id="featured-projects" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredProjects.map((project) => (
                    <Project key={project.slug} {...project} />
                ))}
            </div>
        </section>
    );
}
