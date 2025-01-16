interface ProjectLinksProps {
    project: {
        githubUrl: string;
        liveUrl?: string;
    };
    className?: string;
}

export function ProjectLinks({ project, className }: ProjectLinksProps) {
    const handleLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className={`flex gap-8 justify-center ${className}`} onClick={handleLinkClick}>

            {project.githubUrl &&
                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 dark:text-blue-300 font-bold"
                >
                    GitHub
                </a>
            }
            {project.liveUrl && (
                <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 dark:text-blue-300 font-bold"
                >
                    View Site
                </a>
            )}
        </div>
    );
}
