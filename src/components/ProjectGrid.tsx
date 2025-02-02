import { Project } from "./Project";
import projects from "../assets/projects";

interface ProjectGridProps {
    projectList?: typeof projects;
    title?: string;
    className?: string;
    featuredSlugs?: string[];
}

export function ProjectGrid({ 
    projectList,
    featuredSlugs,
    title, 
    className = "" 
}: ProjectGridProps) {
    const displayProjects = featuredSlugs 
        ? projects.filter(project => featuredSlugs.includes(project.slug))
        : (projectList || projects);

    return (
        <section className={`mb-12 ${className}`}>
            {title && <h2 className="text-2xl font-semibold mb-6 dark:text-white">{title}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProjects.map((project) => (
                    <Project
                        key={project.slug}
                        {...project}
                    />
                ))}
            </div>
        </section>
    );
}
