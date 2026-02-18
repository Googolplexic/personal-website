import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import projects from '../assets/projects';
import Markdown from 'react-markdown';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { NotFound } from './NotFound';
import { HighlightedText } from '../components/ui/HighlightedText';
import React from 'react';

export function ProjectDetail() {
    const { projectSlug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchTerm = searchParams.get('search') || '';
    const project = projects.find(p => p.slug === projectSlug);

    if (!project) {
        return <NotFound />;
    }

    const exhibitNumber = String(projects.length - projects.indexOf(project)).padStart(2, '0');
    const currentIndex = projects.indexOf(project);
    const nextProject = projects[(currentIndex + 1) % projects.length];

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
                    onClick={() => navigate('/portfolio')}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-body mb-10 p-0 transition-colors duration-300"
                    style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Gallery
                </button>

                {/* Exhibit label + title */}
                <div className="mb-12">
                    <span className="exhibit-label mb-4 inline-flex">Exhibit {exhibitNumber}</span>
                    <h1 className="gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4 mt-3"
                        style={{ color: 'var(--color-text-primary)' }}>
                        <HighlightedText text={project.title} searchTerm={searchTerm} />
                    </h1>
                    <p className="text-sm font-body italic max-w-xl"
                       style={{ color: 'var(--color-text-secondary)' }}>
                        {project.summary}
                    </p>
                </div>

                {/* Hero image */}
                <div className="mb-16 overflow-hidden">
                    <ProjectImageCarousel images={project.images || []} title={project.title} />
                </div>

                {/* Two-column: description + sidebar metadata */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    <div className="lg:col-span-8">
                        <div className="prose prose-lg max-w-none" style={{ color: 'var(--color-text-primary)' }}>
                            <Markdown components={components}>{project.description}</Markdown>
                        </div>
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28 space-y-8">
                            <div>
                                <p className="gallery-overline mb-2">Timeline</p>
                                <p className="text-sm font-heading italic"
                                   style={{ color: 'var(--color-text-primary)' }}>
                                    {project.startDate === project.endDate
                                        ? project.startDate
                                        : `${project.startDate} – ${project.endDate || 'Present'}`}
                                </p>
                            </div>

                            <div>
                                <p className="gallery-overline mb-3">Technologies</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-body"
                                     style={{ color: 'var(--color-text-tertiary)' }}>
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
                                       className="block text-xs tracking-[0.15em] uppercase font-body transition-colors"
                                       style={{ color: 'var(--color-text-tertiary)' }}
                                       onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                                       onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}>
                                        GitHub
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="inline ml-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                       className="block text-xs tracking-[0.15em] uppercase font-body transition-colors"
                                       style={{ color: 'var(--color-text-tertiary)' }}
                                       onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                                       onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}>
                                        Live Site
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="inline ml-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </a>
                                )}
                            </div>

                            <div className="gallery-divider !mx-0" />
                        </div>
                    </aside>
                </div>

                {/* Next project */}
                {nextProject && (
                    <div className="mt-24 pt-10" style={{ borderTop: '1px solid var(--divider)' }}>
                        <div className="flex items-center justify-between">
                            <p className="gallery-overline">Next</p>
                            <button
                                onClick={() => { navigate(`/portfolio/${nextProject.slug}`); window.scrollTo(0, 0); }}
                                className="inline-flex items-center gap-2 font-heading italic text-lg group p-0"
                                style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none' }}
                            >
                                {nextProject.title}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"
                                     className="transition-transform duration-300 group-hover:translate-x-1">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
