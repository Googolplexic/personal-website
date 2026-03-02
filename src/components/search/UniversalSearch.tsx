import { Dispatch, SetStateAction } from 'react';
import { ItemProps } from '../../types';
import { Button } from '../ui/base';
import { formInput } from '../../utils/styles';
import { MultiSelect } from '../ui/MultiSelect';

export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'tech-count';

const SORT_LABELS: Record<string, string> = {
    'date-desc': 'Newest First',
    'date-asc': 'Oldest First',
    'title-asc': 'Title A–Z',
    'title-desc': 'Title Z–A',
    'tech-count': 'Most Technologies',
};

interface UniversalSearchProps {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    selectedTechs: string[];
    setSelectedTechs: Dispatch<SetStateAction<string[]>>;
    selectedTags: string[];
    setSelectedTags: Dispatch<SetStateAction<string[]>>;
    techFilterMode: 'and' | 'or';
    setTechFilterMode: Dispatch<SetStateAction<'and' | 'or'>>;
    tagFilterMode: 'and' | 'or';
    setTagFilterMode: Dispatch<SetStateAction<'and' | 'or'>>;
    sortBy: SortOption;
    setSortBy: Dispatch<SetStateAction<SortOption>>;
    allTechnologies: string[];
    allTags: string[];
    items: ItemProps[];
    contentType: 'projects' | 'origami' | 'mixed';
    onReset: () => void;
}

export function UniversalSearch({
    searchTerm,
    setSearchTerm,
    selectedTechs,
    setSelectedTechs,
    selectedTags,
    setSelectedTags,
    techFilterMode,
    setTechFilterMode,
    tagFilterMode,
    setTagFilterMode,
    sortBy,
    setSortBy,
    allTechnologies,
    allTags,
    items,
    contentType,
    onReset,
}: UniversalSearchProps) {

    const getPlaceholderText = () => {
        switch (contentType) {
            case 'projects': return 'Search projects...';
            case 'origami': return 'Search origami...';
            case 'mixed': return 'Search...';
            default: return 'Search...';
        }
    };

    const hasProjects = items.some(item => item.type === 'project');
    const showTechFilter = hasProjects && allTechnologies.length > 0;
    const showTagFilter = allTags.length > 0;

    const sortOptions = [
        'date-desc',
        'date-asc',
        'title-asc',
        'title-desc',
        ...(hasProjects ? ['tech-count'] : []),
    ];

    return (
        <div className="mb-6">
            <div className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={formInput()}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    {showTechFilter && (
                        <MultiSelect
                            aria-label="Filter by technology"
                            options={allTechnologies}
                            selected={selectedTechs}
                            onChange={setSelectedTechs}
                            filterMode={techFilterMode}
                            onFilterModeChange={setTechFilterMode}
                            placeholder="All Technologies"
                        />
                    )}

                    {showTagFilter && (
                        <MultiSelect
                            aria-label="Filter by tag"
                            options={allTags}
                            selected={selectedTags}
                            onChange={setSelectedTags}
                            filterMode={tagFilterMode}
                            onFilterModeChange={setTagFilterMode}
                            placeholder="All Tags"
                        />
                    )}

                    <MultiSelect
                        aria-label="Sort items"
                        options={sortOptions}
                        optionLabels={SORT_LABELS}
                        selected={[sortBy]}
                        onChange={([v]) => setSortBy((v ?? 'date-desc') as SortOption)}
                        placeholder="Sort"
                        singleSelect
                    />

                    <Button
                        variant="secondary"
                        className="px-4 py-2 whitespace-nowrap"
                        onClick={onReset}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
