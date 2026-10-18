import { ReactNode } from 'react';
import { cn } from '../../utils/styles';

interface PlacardProps {
    /** Exhibit code from the content loader, e.g. "P·07" */
    exhibit?: string;
    title: ReactNode;
    /** Technologies for a project, designer for an origami model */
    medium?: ReactNode;
    date?: string;
    titleAs?: 'h1' | 'h2' | 'h3' | 'p';
    size?: 'card' | 'page';
    className?: string;
}

/**
 * Placard - museum wall label beside a work.
 * Inside a `group` (a card link), the rule and title turn gold on hover.
 */
export function Placard({ exhibit, title, medium, date, titleAs: Title = 'h3', size = 'card', className }: PlacardProps) {
    return (
        <div className={cn('border-l border-line-strong pl-4 transition-colors duration-300 group-hover:border-gold', className)}>
            {exhibit && <p className="text-label uppercase font-body text-gold mb-2">{exhibit}</p>}
            <Title className={cn(
                'gallery-heading m-0 text-ink transition-colors duration-300 group-hover:text-gold',
                size === 'page' ? 'text-title' : 'text-xl',
            )}>
                {title}
            </Title>
            {medium && <p className="mt-2 mb-0 text-sm font-body text-ink-muted">{medium}</p>}
            {date && <p className="mt-1 mb-0 text-xs uppercase tracking-[0.2em] font-body text-ink-faint">{date}</p>}
        </div>
    );
}
