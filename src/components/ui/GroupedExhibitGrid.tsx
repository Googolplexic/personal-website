import { useState } from 'react';
import type { ItemProps } from '../../types';
import { CATEGORY_LABELS, CATEGORY_ORDER, itemCategory, type ItemCategory } from '../../utils/galleryFilters';
import { cn } from '../../utils/styles';
import { ExhibitGrid } from './ExhibitGrid';

interface GroupedExhibitGridProps {
    items: ItemProps[];
    searchTerm?: string;
}

/** One row per collection: a sticky side label that collapses the collection, and its grid. */
export function GroupedExhibitGrid({ items, searchTerm }: GroupedExhibitGridProps) {
    const [collapsed, setCollapsed] = useState<Set<ItemCategory>>(new Set());
    const groups = CATEGORY_ORDER
        .map(category => ({ category, items: items.filter(item => itemCategory(item) === category) }))
        .filter(group => group.items.length > 0);

    if (groups.length === 0) return <ExhibitGrid items={[]} />;

    const toggle = (category: ItemCategory) => setCollapsed(prev => {
        const next = new Set(prev);
        if (next.has(category)) next.delete(category);
        else next.add(category);
        return next;
    });

    return (
        <div className="flex flex-col gap-12 lg:gap-20">
            {groups.map((group, groupIndex) => {
                const isCollapsed = collapsed.has(group.category);
                const panelId = `collection-${group.category}`;
                return (
                    <section key={group.category} className="page-grid">
                        <h2 className="col-span-full lg:col-span-3 lg:sticky lg:top-28 self-start m-0 mb-6 lg:mb-0 border-t border-solid border-line pt-4 lg:border-0 lg:pt-0">
                            <button
                                type="button"
                                aria-expanded={!isCollapsed}
                                aria-controls={panelId}
                                onClick={() => toggle(group.category)}
                                className="group/label flex w-full items-baseline gap-3 min-h-11 p-0 bg-transparent text-left cursor-pointer"
                            >
                                <span className="gallery-heading text-heading text-ink transition-colors duration-300 group-hover/label:text-gold">
                                    {CATEGORY_LABELS[group.category]}
                                </span>
                                <span className="font-body text-xs tracking-[0.15em] text-ink-faint">{group.items.length}</span>
                                <svg
                                    width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                    className={cn('ml-auto lg:ml-0 self-center text-ink-faint transition-transform duration-300 group-hover/label:text-gold', isCollapsed && '-rotate-90')}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                        </h2>
                        <div
                            id={panelId}
                            className={cn(
                                'col-span-full lg:col-span-9 grid transition-[grid-template-rows] duration-500 ease-in-out',
                                isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
                            )}
                        >
                            <div className="overflow-hidden" inert={isCollapsed}>
                                <ExhibitGrid
                                    items={group.items}
                                    searchTerm={searchTerm}
                                    priority={groupIndex === 0}
                                    skipCount={groupIndex === 0 ? 1 : 0}
                                    maxColumns={2}
                                />
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
