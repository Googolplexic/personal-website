interface ProjectLinksProps {
    project: {
        githubUrl: string;
        liveUrl?: string;
    };
}

export function ProjectLinks({ project }: ProjectLinksProps) {
    const handleLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="flex gap-8 justify-center mb-6" onClick={handleLinkClick}>
            <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 dark:text-blue-300 font-bold"
            >
                GitHub
            </a>
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
