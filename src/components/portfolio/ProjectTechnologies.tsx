import { HighlightedText } from '../ui/HighlightedText';
import { Pill, Flex } from '../ui/base';
import { spacing } from '../../utils/styles';

interface ProjectTechnologiesProps {
    technologies: string[];
    searchTerm?: string;
}

export function ProjectTechnologies({ technologies, searchTerm = '' }: ProjectTechnologiesProps) {
    return (
        <div className={spacing({ my: '4' })}>
            <Flex wrap justify="center" gap="2" className="text-[0.7rem] sm:text-xs md:text-sm">
                {technologies.map((tech, index) => (
                    <Pill key={index} className={`sm:${spacing({ px: '2' })} ${spacing({ px: '1' })} sm:${spacing({ py: '1' })} py-0`}>
                        <HighlightedText text={tech} searchTerm={searchTerm} />
                    </Pill>
                ))}
            </Flex>
        </div>
    );
}
