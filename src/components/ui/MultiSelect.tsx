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
    className?: string;
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
    className,
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
        'px-2 py-0.5 text-xs font-body tracking-[0.12em] uppercase transition-colors duration-200 cursor-pointer bg-transparent',
        filterMode === mode ? 'text-gold' : 'text-ink-muted hover:text-gold'
    );

    return (
        <div ref={containerRef} className={cn('relative min-w-0', className)}>
            <button
                type="button"
                aria-label={ariaLabel ? `${triggerLabel}, ${ariaLabel}` : triggerLabel}
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'w-full min-h-11 px-3.5 flex items-center justify-between gap-2 text-left cursor-pointer bg-transparent',
                    'border border-solid font-body text-xs uppercase tracking-[0.15em] transition-colors duration-300',
                    hasActiveFilter || open ? 'border-gold text-gold' : 'border-line-strong text-ink-muted hover:border-gold hover:text-gold',
                )}
            >
                <span className="truncate">{triggerLabel}</span>
                <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 top-full left-0 -mt-px py-2 min-w-full w-max max-w-[280px] bg-surface-raised border border-solid border-gold">
                    {/* AND / OR toggle row — only shown for multi-select */}
                    {!singleSelect && onFilterModeChange && (
                        <div className="flex items-center justify-between gap-4 px-3 pb-2 mb-1 border-b border-solid border-line">
                            <span className="text-xs font-body tracking-widest uppercase text-ink-faint">
                                Match
                            </span>
                            <div className="flex gap-0.5">
                                <button type="button" className={modeBtn('or')} aria-pressed={filterMode === 'or'}
                                    onClick={() => onFilterModeChange('or')}>
                                    Any
                                </button>
                                <span className="text-xs font-body self-center px-0.5 text-ink-faint">·</span>
                                <button type="button" className={modeBtn('and')} aria-pressed={filterMode === 'and'}
                                    onClick={() => onFilterModeChange('and')}>
                                    All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scrollable option list — stop wheel propagation so dropdown scrolls instead of page */}
                    <div
                        className="px-1 max-h-52 overflow-y-auto overscroll-contain touch-pan-y"
                        onWheel={e => e.stopPropagation()}
                    >
                        {options.map(option => {
                            const active = selected.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => toggle(option)}
                                    className={cn(
                                        'flex w-full items-center gap-2 text-left px-2 py-1.5 text-xs font-body tracking-widest uppercase transition-colors duration-200 cursor-pointer bg-transparent',
                                        active ? 'text-gold' : 'text-ink-muted hover:text-gold'
                                    )}
                                >
                                    <span aria-hidden="true" className={cn('h-px w-2.5 shrink-0 transition-colors', active ? 'bg-gold' : 'bg-transparent')} />
                                    {getLabel(option)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear footer — only shown for multi-select with active filters */}
                    {hasActiveFilter && (
                        <div className="flex justify-end px-3 pt-2 mt-1 border-t border-solid border-line">
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-xs font-body tracking-widest uppercase transition-colors cursor-pointer bg-transparent border-none p-0 text-ink-faint hover:text-gold"
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
