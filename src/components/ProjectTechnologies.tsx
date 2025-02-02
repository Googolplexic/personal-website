import { HighlightedText } from './HighlightedText';

interface ProjectTechnologiesProps {
    technologies: string[];
    searchTerm?: string;
}

export function ProjectTechnologies({ technologies, searchTerm = '' }: ProjectTechnologiesProps) {
    return (
        <div className="my-4">
            <div className="flex flex-wrap gap-2 justify-center text-[0.7rem] sm:text-xs md:text-sm">
                {technologies.map((tech, index) => (
                    <span key={index} className="bg-gray-200 dark:bg-gray-700 sm:px-2 px-1 sm:py-1 py-0 rounded">
                        <HighlightedText text={tech} searchTerm={searchTerm} />
                    </span>
                ))}
            </div>
        </div>
    );
}
