import { cn } from '../../utils/styles';
import { SectionHeader } from '../ui/SectionHeader';

export interface LinkSectionItem {
    name: string;
    value: string;
    href: string;
    /** Takes two columns and a larger value, for the link most visitors want */
    feature?: boolean;
}

interface LinkSectionProps {
    id: string;
    title: string;
    links: LinkSectionItem[];
}

/** A side-labelled row of framed link tiles. */
export function LinkSection({ id, title, links }: LinkSectionProps) {
    return (
        <div id={id} className="page-grid scroll-mt-32">
            <SectionHeader title={title} />
            {/* Three equal tracks in every section, so tiles line up between Connect and Work */}
            <ul className="col-span-full lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-(--grid-gutter) list-none m-0 p-0">
                {links.map((link) => {
                    // Mail links hand off to the mail app; everything else opens beside the site
                    const newTab = !link.href.startsWith('mailto:');
                    return (
                        <li key={link.name} className={cn('min-w-0', link.feature && 'md:col-span-2')}>
                            <a
                                href={link.href}
                                target={newTab ? '_blank' : undefined}
                                rel={newTab ? 'noopener noreferrer' : undefined}
                                className="group flex h-full min-h-32 flex-col justify-between gap-8 border border-solid border-line p-5 xl:p-6 text-inherit no-underline transition-colors duration-300 hover:border-gold hover:bg-gold/5"
                            >
                                <span className="flex items-start justify-between gap-4">
                                    <span className="text-label uppercase font-body text-gold">{link.name}</span>
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
                                        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                        className={cn(
                                            'shrink-0 text-ink-faint transition-[color,translate] duration-300 group-hover:text-gold',
                                            newTab ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : 'group-hover:translate-x-1',
                                        )}
                                    >
                                        <path d={newTab ? 'M7 17L17 7M9 7h8v8' : 'M5 12h14M12 5l7 7-7 7'} />
                                    </svg>
                                </span>
                                <span className={cn(
                                    'gallery-heading text-ink break-words transition-colors duration-300 group-hover:text-gold',
                                    link.feature ? 'text-heading' : 'text-lg xl:text-xl',
                                )}>
                                    {link.value}
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
