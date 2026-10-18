import { useState } from 'react';
import { FrameButton } from '../ui/FrameButton';
import { MultiSelect } from '../ui/MultiSelect';
import { SORT_LABELS, type CategoryFilter, type GalleryFilters, type SortOption } from '../../utils/galleryFilters';

interface CategoryChoice {
    value: CategoryFilter;
    label: string;
    count: number;
}

interface FilterBarProps {
    filters: GalleryFilters;
    update: (patch: Partial<GalleryFilters>) => void;
    reset: () => void;
    placeholder: string;
    /** Empty hides the technology filter */
    technologies: string[];
    tags: string[];
    sortOptions: SortOption[];
    categories?: CategoryChoice[];
    view?: 'grouped' | 'list';
    onViewChange?: (view: 'grouped' | 'list') => void;
}

const SEARCH_INPUT_CLASS = 'w-full min-h-11 px-3.5 bg-transparent border border-solid border-line-strong rounded-none text-ink font-body text-sm tracking-[0.03em] transition-colors duration-300 placeholder:text-ink-faint placeholder:text-xs placeholder:uppercase placeholder:tracking-[0.15em] hover:border-gold focus:border-gold focus:outline-none';

/**
 * The URL updates a beat after each keystroke, so while the field has focus
 * it shows its own draft; otherwise it follows the URL (Reset, Back).
 */
function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
    const [draft, setDraft] = useState(value);
    const [focused, setFocused] = useState(false);
    return (
        <input
            type="text"
            aria-label="Search"
            placeholder={placeholder}
            value={focused ? draft : value}
            onFocus={() => { setDraft(value); setFocused(true); }}
            onBlur={() => setFocused(false)}
            onChange={(e) => { setDraft(e.target.value); onChange(e.target.value); }}
            className={SEARCH_INPUT_CLASS}
        />
    );
}

export function FilterBar({
    filters,
    update,
    reset,
    placeholder,
    technologies,
    tags,
    sortOptions,
    categories,
    view,
    onViewChange,
}: FilterBarProps) {
    return (
        <div className="flex flex-col gap-3">
            <SearchField value={filters.search} onChange={(search) => update({ search })} placeholder={placeholder} />

            <div className="grid grid-cols-2 gap-3 sm:flex">
                {technologies.length > 0 && (
                    <MultiSelect
                        className="sm:flex-1"
                        aria-label="Filter by technology"
                        options={technologies}
                        selected={filters.techs}
                        onChange={(techs) => update({ techs })}
                        filterMode={filters.techMode}
                        onFilterModeChange={(techMode) => update({ techMode })}
                        placeholder="All Technologies"
                    />
                )}
                {tags.length > 0 && (
                    <MultiSelect
                        className="sm:flex-1"
                        aria-label="Filter by tag"
                        options={tags}
                        selected={filters.tags}
                        onChange={(tags) => update({ tags })}
                        filterMode={filters.tagMode}
                        onFilterModeChange={(tagMode) => update({ tagMode })}
                        placeholder="All Tags"
                    />
                )}
                <MultiSelect
                    className="sm:flex-1"
                    aria-label="Sort items"
                    options={sortOptions}
                    optionLabels={SORT_LABELS}
                    selected={[filters.sort]}
                    onChange={([sort]) => update({ sort: (sort ?? 'date-desc') as SortOption })}
                    placeholder="Sort"
                    singleSelect
                />
                <FrameButton size="compact" onClick={reset}>Reset</FrameButton>
            </div>

            {(categories || (view && onViewChange)) && (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    {categories && (
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
                            {categories.map(category => (
                                <FrameButton
                                    key={category.value}
                                    size="compact"
                                    active={filters.category === category.value}
                                    onClick={() => update({ category: category.value })}
                                >
                                    {category.label}
                                    <span className="text-ink-faint">{category.count}</span>
                                </FrameButton>
                            ))}
                        </div>
                    )}
                    {view && onViewChange && (
                        <div className="flex" role="group" aria-label="Layout">
                            {/* The pair shares one border; the active half sits on top so its gold edge shows */}
                            <FrameButton size="compact" className={view === 'grouped' ? 'relative z-10' : ''} active={view === 'grouped'} onClick={() => onViewChange('grouped')}>
                                Grouped View
                            </FrameButton>
                            <FrameButton size="compact" className={view === 'list' ? 'relative z-10 -ml-px' : '-ml-px'} active={view === 'list'} onClick={() => onViewChange('list')}>
                                List View
                            </FrameButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
