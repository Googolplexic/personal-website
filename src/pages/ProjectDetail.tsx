import { useParams, useSearchParams } from 'react-router-dom';
import projects from '../assets/projects';
import Markdown from 'react-markdown';
import { ProjectImageCarousel } from '../components/portfolio/ProjectImageCarousel';
import { ProjectLinks } from '../components/portfolio/ProjectLinks';
import { ProjectTechnologies } from '../components/portfolio/ProjectTechnologies';
import { NotFound } from './NotFound';
import { HighlightedText } from '../components/ui/HighlightedText';
import { Heading, Text } from '../components/ui/base';
import React from 'react';
import { grid, spacing } from '../utils/styles';

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
        <div className={grid('2', '12')}>
            <div>
                <Heading level={1}>
                    <HighlightedText text={project.title} searchTerm={searchTerm} />
                </Heading>
                <Text color="secondary" className={spacing({ mb: '2' })}>
                    {project.startDate === project.endDate ? project.startDate : `${project.startDate} - ${project.endDate || 'Present'}`}
                </Text>
                <ProjectLinks project={project} className={spacing({ mb: '6' })} />
                <ProjectImageCarousel images={project.images || []} title={project.title} />
                <Heading level={2}>Technologies Used</Heading>
                <ProjectTechnologies technologies={project.technologies} searchTerm={searchTerm} />
            </div>
            <div className={`prose dark:prose-invert max-w-none text-left ${spacing({ mt: '12' })} lg:mt-0`}>
                <Markdown components={components}>{project.description}</Markdown>
            </div>
        </div>
    );
}
