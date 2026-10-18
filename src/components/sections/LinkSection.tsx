import { Placard } from '../ui/Placard';
import { SectionHeader } from '../ui/SectionHeader';

export interface LinkSectionItem {
    name: string;
    value: string;
    href: string;
}

interface LinkSectionProps {
    id: string;
    title: string;
    links: LinkSectionItem[];
}

/** A side-labelled row of contact links, each set as a placard. */
export function LinkSection({ id, title, links }: LinkSectionProps) {
    return (
        <div id={id} className="page-grid scroll-mt-32">
            <SectionHeader title={title} />
            <ul className="col-span-full lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-(--grid-gutter) gap-y-8 list-none m-0 p-0">
                {links.map((link) => {
                    // Mail links hand off to the mail app; everything else opens beside the site
                    const newTab = !link.href.startsWith('mailto:');
                    return (
                        <li key={link.name} className="min-w-0">
                            <a
                                href={link.href}
                                target={newTab ? '_blank' : undefined}
                                rel={newTab ? 'noopener noreferrer' : undefined}
                                className="group block py-1 text-inherit no-underline"
                            >
                                <Placard titleAs="p" exhibit={link.name} title={<span className="break-words">{link.value}</span>} />
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
