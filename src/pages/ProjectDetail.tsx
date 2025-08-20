import { useParams, useSearchParams } from 'react-router-dom';
import projects from '../assets/projects';
import Markdown from 'react-markdown';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { ProjectLinks } from '../components/portfolio/ProjectLinks';
import { ProjectTechnologies } from '../components/portfolio/ProjectTechnologies';
import { NotFound } from './NotFound';
import { HighlightedText } from '../components/ui/HighlightedText';
import React from 'react';

export function ProjectDetail() {
    const { projectSlug } = useParams();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const project = projects.find(p => p.slug === projectSlug);

    if (!project) {
        return <NotFound />;
    }

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
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-0">
            <div>
                <h1><HighlightedText text={project.title} searchTerm={searchTerm} /></h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {project.startDate === project.endDate ? project.startDate : `${project.startDate} - ${project.endDate || 'Present'}`}
                </p>
                <ProjectLinks project={project} className='mb-6' />
                <ProjectImageCarousel images={project.images || []} title={project.title} />
                <h2>Technologies Used</h2>
                <ProjectTechnologies technologies={project.technologies} searchTerm={searchTerm} />
            </div>
            <div className="prose dark:prose-invert max-w-none text-left mt-12 lg:mt-0">
                <Markdown components={components}>{project.description}</Markdown>
            </div>
        </div>
    );
}
