import { useNavigate } from 'react-router';
import Markdown from 'react-markdown';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { HighlightedText } from '../components/ui/HighlightedText';
import { ShareButton } from '../components/ui/ShareButton';
import { NextExhibit, ProjectProps } from '../types';
import { BASE_URL } from '../utils/seo';
import { useClientLocation, useClientSearchParams } from '../utils/useHydrated';
import React from 'react';

interface ProjectDetailProps {
    project: ProjectProps;
    exhibit: string;
    next: NextExhibit;
}

export function ProjectDetail({ project, exhibit: exhibitNumber, next: nextProject }: ProjectDetailProps) {
    const [searchParams] = useClientSearchParams();
    const navigate = useNavigate();
    const location = useClientLocation();
    const { state } = location;
    const searchTerm = searchParams.get('search') || '';

    // Back destination: use state.from if it's a known gallery, else canonical /portfolio
    const from = (state as { from?: string } | null)?.from;
    const backTarget = (from === '/portfolio' || from === '/origami') ? from : '/portfolio';
    const backLabel = from === '/' ? 'To Gallery' : 'Back to Gallery';
    const shareUrl = `${BASE_URL}/portfolio/${project.slug}`;
    const backDestination = location.search ? `${backTarget}${location.search}` : backTarget;
    const timelineLabel = project.startDate === project.endDate
        ? project.startDate
        : `${project.startDate} – ${project.endDate || 'Present'}`;

    const components = {
        p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
            <p {...props}>
                {React.Children.map(children, child =>
                    typeof child === 'string'
                        ? <HighlightedText text={child} searchTerm={searchTerm} allowHtml={true} />
                        : child
                )}
            </p>
        ),
        h1: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
            <h1 {...props}>
                {React.Children.map(children, child =>
                    typeof child === 'string'
                        ? <HighlightedText text={child} searchTerm={searchTerm} allowHtml={true} />
                        : child
                )}
            </h1>
        ),
        h2: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
            <h2 {...props}>
                {React.Children.map(children, child =>
                    typeof child === 'string'
                        ? <HighlightedText text={child} searchTerm={searchTerm} allowHtml={true} />
                        : child
                )}
            </h2>
        ),
        h3: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
            <h3 {...props}>
                {React.Children.map(children, child =>
                    typeof child === 'string'
                        ? <HighlightedText text={child} searchTerm={searchTerm} allowHtml={true} />
                        : child
                )}
            </h3>
        ),
        li: ({ children, ...props }: React.HTMLProps<HTMLLIElement>) => (
            <li {...props}>
                {React.Children.map(children, child =>
                    typeof child === 'string'
                        ? <HighlightedText text={child} searchTerm={searchTerm} allowHtml={true} />
                        : child
                )}
            </li>
        ),
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
                {/* Back navigation — in page flow, below navbar */}
                <button
                    onClick={() => navigate(backDestination)}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-body mb-10 p-0 transition-colors duration-300 text-ink-faint hover:text-gold"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {backLabel}
                </button>

                {/* Exhibit label + title */}
                <div className="mb-12">
                    <span className="exhibit-label mb-4 inline-flex">Exhibit {exhibitNumber}</span>
                    <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4 mt-3 text-ink">
                        <HighlightedText text={project.title} searchTerm={searchTerm} />
                    </h1>
                    <p className="text-sm font-body italic max-w-xl text-ink-muted">
                        <HighlightedText text={project.summary} searchTerm={searchTerm} />
                    </p>
                </div>

                {/* Hero image */}
                <div className="mb-16 overflow-hidden">
                    <ProjectImageCarousel images={project.images || []} imagesFull={project.imagesFull} title={project.title} />
                </div>

                {/* Two-column: description + sidebar metadata */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    <div className="lg:col-span-8">
                        <div className="markdown-content text-ink">
                            <Markdown components={components}>{project.description}</Markdown>
                        </div>
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28 space-y-8">
                            <div>
                                <p className="gallery-overline mb-2">Timeline</p>
                                <p className="text-sm font-heading italic text-ink">
                                    {timelineLabel}
                                </p>
                            </div>

                            <div>
                                <p className="gallery-overline mb-3">Technologies</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-body text-ink-faint">
                                    {project.technologies.map((tech, i) => (
                                        <span key={i}>
                                            <HighlightedText text={tech} searchTerm={searchTerm} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {project.githubUrl && (
                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                        className="block text-xs tracking-[0.15em] uppercase font-body text-ink-faint link-underline">
                                        GitHub
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="inline ml-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                        className="block text-xs tracking-[0.15em] uppercase font-body text-ink-faint link-underline">
                                        Live Site
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="inline ml-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </a>
                                )}
                                <ShareButton url={shareUrl} title={project.title} description={project.summary} />
                            </div>

                            <div className="gallery-divider mx-0!" />
                        </div>
                    </aside>
                </div>

                {/* Next project */}
                {nextProject && (
                    <div className="mt-24 pt-10" style={{ borderTop: '1px solid var(--color-line)' }}>
                        <p className="gallery-overline mb-5">Next Exhibit</p>
                        <button
                            onClick={() => { navigate(`/portfolio/${nextProject.slug}`, { state: { from: backTarget } }); window.scrollTo(0, 0); }}
                            className="group flex items-center gap-5 w-full text-left p-0 bg-transparent border-none cursor-pointer"
                        >
                            {/* Thumbnail */}
                            {nextProject.image && (
                                <div className="w-16 h-16 shrink-0 overflow-hidden"
                                    style={{ border: '1px solid var(--color-line)' }}>
                                    <img
                                        src={nextProject.image}
                                        alt={nextProject.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="exhibit-label text-xs mb-1 block">{nextProject.exhibit}</span>
                                <span className="block font-heading italic text-lg leading-tight mb-0.5 transition-colors duration-300 text-ink group-hover:text-gold">
                                    {nextProject.title}
                                </span>
                                <span className="text-xs font-body tracking-widest text-ink-faint">
                                    {nextProject.date}
                                </span>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round"
                                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
