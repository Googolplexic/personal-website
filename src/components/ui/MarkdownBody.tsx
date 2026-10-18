import { Children, useMemo, type ElementType, type ReactNode } from 'react';
import Markdown, { type Components, type ExtraProps } from 'react-markdown';
import { HighlightedText } from './HighlightedText';

interface MarkdownBodyProps {
    source: string;
    /** Search term from the listing page, highlighted in the text */
    searchTerm?: string;
}

const HIGHLIGHTED_TAGS = ['p', 'h1', 'h2', 'h3', 'li'] as const;

function highlightedComponents(searchTerm: string): Components {
    const highlight = (children: ReactNode) => Children.map(children, child =>
        typeof child === 'string'
            ? <HighlightedText text={child} searchTerm={searchTerm} allowHtml={true} />
            : child
    );

    return Object.fromEntries(HIGHLIGHTED_TAGS.map(tag => {
        const Tag = tag as ElementType;
        const Highlighted = ({ children, ...props }: { children?: ReactNode } & ExtraProps) => {
            delete props.node;
            return <Tag {...props}>{highlight(children)}</Tag>;
        };
        return [tag, Highlighted];
    }));
}

/** Long-form markdown (project descriptions, origami writeups) with search highlighting. */
export function MarkdownBody({ source, searchTerm = '' }: MarkdownBodyProps) {
    const components = useMemo(() => highlightedComponents(searchTerm), [searchTerm]);

    return (
        <div className="markdown-content max-w-prose text-ink">
            <Markdown components={components}>{source}</Markdown>
        </div>
    );
}
