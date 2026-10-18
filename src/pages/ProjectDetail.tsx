import { DetailLayout, DetailList } from '../components/detail/DetailLayout';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { FrameButton } from '../components/ui/FrameButton';
import { HighlightedText } from '../components/ui/HighlightedText';
import { MarkdownBody } from '../components/ui/MarkdownBody';
import { ShareButton } from '../components/ui/ShareButton';
import { NextExhibit, ProjectProps } from '../types';
import { BASE_URL } from '../utils/seo';
import { useClientSearchParams } from '../utils/useHydrated';

interface ProjectDetailProps {
    project: ProjectProps;
    exhibit: string;
    next: NextExhibit;
}

const externalArrow = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M7 17L17 7M9 7h8v8" />
    </svg>
);

export function ProjectDetail({ project, exhibit, next }: ProjectDetailProps) {
    const [searchParams] = useClientSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const timelineLabel = project.startDate === project.endDate
        ? project.startDate
        : `${project.startDate} – ${project.endDate || 'Present'}`;

    return (
        <DetailLayout
            section="/portfolio"
            exhibit={exhibit}
            title={<HighlightedText text={project.title} searchTerm={searchTerm} />}
            lead={<HighlightedText text={project.summary} searchTerm={searchTerm} />}
            next={next}
            details={
                <>
                    <DetailList items={[
                        { label: 'Timeline', value: <span className="font-heading italic text-base text-ink">{timelineLabel}</span> },
                        {
                            label: 'Technologies',
                            value: project.technologies.map((tech, i) => (
                                <span key={tech}>
                                    {i > 0 && <span className="text-ink-faint"> · </span>}
                                    <HighlightedText text={tech} searchTerm={searchTerm} />
                                </span>
                            )),
                        },
                    ]} />
                    <div className="flex flex-col items-start gap-3">
                        {(project.githubUrl || project.liveUrl) && (
                            <div className="flex flex-wrap gap-3">
                                {project.githubUrl && <FrameButton size="compact" href={project.githubUrl}>GitHub {externalArrow}</FrameButton>}
                                {project.liveUrl && <FrameButton size="compact" href={project.liveUrl}>Live Site {externalArrow}</FrameButton>}
                            </div>
                        )}
                        <ShareButton url={`${BASE_URL}/portfolio/${project.slug}`} title={project.title} description={project.summary} />
                    </div>
                </>
            }
        >
            <ProjectImageCarousel images={project.images || []} imagesFull={project.imagesFull} title={project.title} />
            <MarkdownBody source={project.description} searchTerm={searchTerm} />
        </DetailLayout>
    );
}
