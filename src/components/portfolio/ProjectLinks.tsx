import { Link, Flex } from '../ui/base';

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
        <Flex
            gap="8"
            justify="center"
            className={className}
            {...(className && { onClick: handleLinkClick })}
        >
            {project.githubUrl && (
                <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                >
                    GitHub
                </Link>
            )}
            {project.liveUrl && (
                <Link
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                >
                    View Site
                </Link>
            )}
        </Flex>
    );
}
