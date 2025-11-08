import { FiDownload } from 'react-icons/fi';
import { Heading } from '../ui/base';
import { spacing } from '../../utils/styles';
import { patterns, transitions, radius } from '../../theme/design-tokens';

export function ResumeSection() {
    return (
        <section id="resume" className={spacing({ mb: '12' })}>
            <Heading level={2}>Resume</Heading>
            <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${patterns.button.primary} ${radius.lg} ${transitions.colors} no-underline dark:text-white`}
            >
                <FiDownload className="w-5 h-5" />
                <span>View Resume</span>
            </a>
        </section>
    );
}
