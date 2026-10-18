import { ReactNode } from 'react';
import { Link } from 'react-router';
import type { NextExhibit } from '../../types';
import { useClientLocation } from '../../utils/useHydrated';
import { Placard } from '../ui/Placard';

/** Pages a visitor can open a piece from; Back returns to whichever one they came from. */
const BACK_TARGETS = ['/', '/portfolio', '/origami'];

interface DetailLayoutProps {
    /** The listing this piece belongs to, used when the visitor arrived some other way */
    section: '/portfolio' | '/origami';
    exhibit: string;
    title: ReactNode;
    /** The one-line summary or description under the title */
    lead?: ReactNode;
    /** Sidebar contents: a DetailList and actions */
    details: ReactNode;
    children: ReactNode;
    next: NextExhibit;
}

/**
 * DetailLayout - the page for one piece: title band, a sticky details column
 * beside the images and writeup, and the next exhibit at the foot.
 */
export function DetailLayout({ section, exhibit, title, lead, details, children, next }: DetailLayoutProps) {
    const location = useClientLocation();
    const from = (location.state as { from?: string } | null)?.from;
    const backTarget = from && BACK_TARGETS.includes(from) ? from : section;
    const backLabel = backTarget === '/' ? 'Back to Home' : 'Back to Gallery';
    const backDestination = backTarget !== '/' && location.search ? `${backTarget}${location.search}` : backTarget;

    return (
        <article className="pt-28 pb-20">
            <div className="page-grid">
                <div className="col-span-full mb-8 lg:mb-12">
                    <Link
                        to={backDestination}
                        className="inline-flex items-center gap-2 min-h-11 text-xs tracking-[0.2em] uppercase font-body no-underline text-ink-faint transition-colors duration-300 hover:text-gold"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {backLabel}
                    </Link>
                </div>

                <header className="col-span-full lg:col-span-10 mb-12 lg:mb-16">
                    <p className="text-label uppercase font-body text-gold mt-0 mb-4">Exhibit {exhibit}</p>
                    <h1 className="gallery-heading text-title m-0 text-ink text-balance">{title}</h1>
                    {lead && <p className="mt-5 mb-0 max-w-2xl text-lead font-heading italic text-ink-muted">{lead}</p>}
                </header>

                <aside className="col-span-full lg:col-span-3 lg:sticky lg:top-28 self-start mb-12 lg:mb-0">
                    <div className="border-l border-solid border-line-strong pl-5 flex flex-col gap-8">
                        {details}
                    </div>
                </aside>

                <div className="col-span-full lg:col-span-9 min-w-0 flex flex-col gap-16">
                    {children}
                </div>
            </div>

            <div className="page-grid mt-24">
                <nav aria-label="Next exhibit" className="col-span-full border-t border-solid border-line pt-10">
                    <p className="gallery-overline mt-0 mb-5">Next Exhibit</p>
                    <Link
                        to={`${section}/${next.slug}`}
                        state={{ from: backTarget }}
                        className="group flex items-center gap-5 text-inherit no-underline"
                    >
                        {next.image && (
                            <div className="w-20 h-20 shrink-0 overflow-hidden border border-solid border-line">
                                <img
                                    src={next.image}
                                    alt=""
                                    data-fade
                                    className="w-full h-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        )}
                        <Placard titleAs="p" exhibit={next.exhibit} title={next.title} date={next.date} className="flex-1 min-w-0" />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"
                            className="shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </nav>
            </div>
        </article>
    );
}

/** Labelled facts in the details column. */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
    return (
        <dl className="m-0 flex flex-col gap-6">
            {items.map(item => (
                <div key={item.label}>
                    <dt className="gallery-overline mb-2">{item.label}</dt>
                    <dd className="m-0 text-sm leading-relaxed font-body text-ink-muted">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}
