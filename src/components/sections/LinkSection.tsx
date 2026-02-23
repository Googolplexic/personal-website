import { ReactNode } from 'react';

export interface LinkSectionItem {
    name: string;
    value: string;
    href: string;
    icon: ReactNode;
}

interface LinkSectionProps {
    id: string;
    title: string;
    links: LinkSectionItem[];
    /** Mirror layout on desktop: right-align title and links, icon on the right */
    align?: 'left' | 'right';
}

export function LinkSection({ id, title, links, align = 'left' }: LinkSectionProps) {
    const isRight = align === 'right';
    return (
        <div id={id} className={isRight ? 'lg:text-right' : ''}>
            <p className="gallery-overline mb-6">{title}</p>
            <div className="space-y-4">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`contact-link no-underline flex items-center gap-4 py-3 transition-colors duration-300 ${isRight ? 'lg:flex-row-reverse' : ''}`}
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <span className="contact-icon transition-colors duration-300">
                            {link.icon}
                        </span>
                        <div className={isRight ? 'text-left lg:text-right' : 'text-left'}>
                            <p className="contact-name text-sm font-body transition-colors duration-300">
                                {link.name}
                            </p>
                            <p className="text-xs font-body"
                                style={{ color: 'var(--color-text-tertiary)' }}>
                                {link.value}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
