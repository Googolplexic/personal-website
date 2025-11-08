import { HighlightedText } from '../ui/HighlightedText';
import { Pill, Flex } from '../ui/base';

interface ProjectTechnologiesProps {
    technologies: string[];
    searchTerm?: string;
}

export function ProjectTechnologies({ technologies, searchTerm = '' }: ProjectTechnologiesProps) {
    return (
        <div className="my-4">
            <Flex wrap justify="center" gap="2" className="text-[0.7rem] sm:text-xs md:text-sm">
                {technologies.map((tech, index) => (
                    <Pill key={index} className="sm:px-2 px-1 sm:py-1 py-0">
                        <HighlightedText text={tech} searchTerm={searchTerm} />
                    </Pill>
                ))}
            </Flex>
        </div>
    );
}
