interface ProjectLinksProps {
    project: {
        githubUrl: string;
        liveUrl?: string;
    };
}

export function ProjectLinks({ project }: ProjectLinksProps) {
    return (
        <div className="flex gap-8 justify-center mb-6">
            <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-700 dark:text-blue-300 font-bold"
            >
                GitHub
            </a>
            {project.liveUrl && (
                <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-700 dark:text-blue-300 font-bold"
                >
                    View Site
                </a>
            )}
        </div>
    );
}
