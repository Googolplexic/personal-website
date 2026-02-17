import { HighlightedText } from '../ui/HighlightedText';
import { Pill, Flex } from '../ui/base';

interface ProjectTechnologiesProps {
    technologies: string[];
    searchTerm?: string;
}

export function ProjectTechnologies({ technologies, searchTerm = '' }: ProjectTechnologiesProps) {
    return (
        <div className="my-3">
            <Flex wrap justify="center" gap="2" className="text-[0.7rem] sm:text-xs md:text-sm">
                {technologies.map((tech, index) => (
                    <Pill key={index}>
                        <HighlightedText text={tech} searchTerm={searchTerm} />
                    </Pill>
                ))}
            </Flex>
        </div>
    );
}
