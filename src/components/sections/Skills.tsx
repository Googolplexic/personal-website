import { Heading, Pill, Flex } from '../ui/base';
import { spacing } from '../../utils/styles';

export function Skills() {
    const skills = ['Web Development', 'Computational Origami Design', 'Origami Folding', 'Teaching Youth'];

    return (
        <section id="skills" className={spacing({ mb: '12' })}>
            <Heading level={2}>Skills</Heading>
            <Flex wrap align="center" justify="center" gap="2">
                {skills.map((skill) => (
                    <Pill key={skill}>
                        {skill}
                    </Pill>
                ))}
            </Flex>
        </section>
    );
}
