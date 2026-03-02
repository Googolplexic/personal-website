import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/styles';

interface MultiSelectProps {
    options: string[];
    /** Optional human-readable labels keyed by option value */
    optionLabels?: Record<string, string>;
    selected: string[];
    onChange: (value: string[]) => void;
    filterMode?: 'and' | 'or';
    onFilterModeChange?: (mode: 'and' | 'or') => void;
    placeholder: string;
    /** When true: single-select mode — no AND/OR header, selecting closes the panel */
    singleSelect?: boolean;
    'aria-label'?: string;
}

export function MultiSelect({
    options,
    optionLabels,
    selected,
    onChange,
    filterMode = 'or',
    onFilterModeChange,
    placeholder,
    singleSelect = false,
    'aria-label': ariaLabel,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use a capturing-phase click listener so outside clicks are swallowed
    // before they reach grid-item links — no backdrop overlay needed, which
    // means the spotlight effect is never interrupted.
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                e.stopPropagation();
                e.preventDefault();
                setOpen(false);
            }
        };
        document.addEventListener('click', handler, { capture: true });
        return () => document.removeEventListener('click', handler, { capture: true });
    }, [open]);

    const getLabel = (value: string) => optionLabels?.[value] ?? value;

    const toggle = (option: string) => {
        if (singleSelect) {
            onChange([option]);
            setOpen(false);
            return;
        }
        onChange(
            selected.includes(option)
                ? selected.filter(s => s !== option)
                : [...selected, option]
        );
    };

    const triggerLabel = (() => {
        if (singleSelect) {
            return selected.length > 0 ? getLabel(selected[0]) : placeholder;
        }
        if (selected.length === 0) return placeholder;
        if (selected.length === 1) return getLabel(selected[0]);
        if (selected.length === 2) return `${getLabel(selected[0])}, ${getLabel(selected[1])}`;
        return `${getLabel(selected[0])}, ${getLabel(selected[1])} +${selected.length - 2}`;
    })();

    const hasActiveFilter = !singleSelect && selected.length > 0;

    const modeBtn = (mode: 'and' | 'or') => cn(
        'px-2 py-0.5 text-xs font-body tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer bg-transparent border-t-0 border-x-0',
        filterMode === mode
            ? 'border-b border-b-[var(--color-accent)] opacity-100'
            : 'border-b border-b-transparent opacity-60 hover:opacity-85 hover:border-b-[var(--color-accent-text)]'
    );

    return (
        <div ref={containerRef} className="relative flex-1 min-w-0">
            {/* Trigger — matches gallery-select appearance */}
            <button
                type="button"
                aria-label={ariaLabel ?? placeholder}
                onClick={() => setOpen(v => !v)}
                className="gallery-select w-full text-left flex items-center justify-between gap-2 cursor-pointer"
                style={{ color: hasActiveFilter ? 'var(--color-accent-text)' : undefined }}
            >
                <span className="truncate">{triggerLabel}</span>
                <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute z-50 top-full left-0 mt-1 py-2"
                    style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        minWidth: '180px',
                        width: 'max-content',
                        maxWidth: '280px',
                    }}
                >
                    {/* AND / OR toggle row — only shown for multi-select */}
                    {!singleSelect && onFilterModeChange && (
                        <div className="flex items-center justify-between px-3 pb-2 mb-1"
                            style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <span className="text-xs font-body tracking-[0.1em] uppercase"
                                style={{ color: 'var(--color-text-tertiary)' }}>
                                Match
                            </span>
                            <div className="flex gap-0.5">
                                <button type="button" className={modeBtn('or')}
                                    style={{ color: filterMode === 'or' ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
                                    onClick={() => onFilterModeChange('or')}>
                                    Any
                                </button>
                                <span className="text-xs font-body self-center px-0.5"
                                    style={{ color: 'var(--color-text-tertiary)' }}>·</span>
                                <button type="button" className={modeBtn('and')}
                                    style={{ color: filterMode === 'and' ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
                                    onClick={() => onFilterModeChange('and')}>
                                    All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scrollable option list — stop wheel propagation so dropdown scrolls instead of page */}
                    <div
                        className="px-1"
                        style={{ maxHeight: '13rem', overflowY: 'auto', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                        onWheel={e => e.stopPropagation()}
                    >
                        {options.map(option => {
                            const active = selected.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggle(option)}
                                    className={cn(
                                        'w-full text-left px-2 py-1.5 text-xs font-body tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer bg-transparent border-t-0 border-x-0',
                                        active
                                            ? 'border-b border-b-[var(--color-accent)] opacity-100'
                                            : 'border-b border-b-transparent opacity-70 hover:opacity-90 hover:border-b-[var(--color-accent-text)]'
                                    )}
                                    style={{ color: active ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
                                >
                                    {getLabel(option)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear footer — only shown for multi-select with active filters */}
                    {hasActiveFilter && (
                        <div className="flex justify-end px-3 pt-2 mt-1"
                            style={{ borderTop: '1px solid var(--color-border)' }}>
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-xs font-body tracking-[0.1em] uppercase transition-colors cursor-pointer bg-transparent border-none p-0"
                                style={{ color: 'var(--color-text-tertiary)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-text)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
