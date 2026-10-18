import { ReactNode } from 'react';
import { cn } from '../../utils/styles';

interface SectionHeaderProps {
    title: ReactNode;
    /** Small gold line above the title */
    overline?: string;
    titleAs?: 'h1' | 'h2';
    id?: string;
    /** Optional line under the title */
    children?: ReactNode;
    className?: string;
}

/**
 * SectionHeader - the narrow label column of a `page-grid` section.
 * Spans the full width on small screens and sticks beside the content on large ones.
 */
export function SectionHeader({ title, overline, titleAs: Title = 'h2', id, children, className }: SectionHeaderProps) {
    return (
        <header className={cn('col-span-full lg:col-span-3 lg:sticky lg:top-28 self-start mb-8 lg:mb-0', className)}>
            {overline && <p className="gallery-overline mb-3">{overline}</p>}
            <Title id={id} className={cn('gallery-heading m-0 text-ink', Title === 'h1' ? 'text-title' : 'text-heading')}>
                {title}
            </Title>
            {children && <div className="mt-3 text-sm font-body text-ink-muted">{children}</div>}
        </header>
    );
}
