interface ProjectTechnologiesProps {
    technologies: string[];
}

export function ProjectTechnologies({ technologies }: ProjectTechnologiesProps) {
    return (
        <div className="my-4">
            <div className="flex flex-wrap gap-2 justify-center">
                {technologies.map((tech, index) => (
                    <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {tech}
                    </span>
                ))}
            </div>
        </div>
    );
}
