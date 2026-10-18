import { useEffect, useId, useRef, useState } from 'react';
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

function optionElements(list: HTMLElement | null) {
    return Array.from(list?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    // Set when the keyboard opens the panel, so focus can follow once the options render
    const pendingFocus = useRef<'first' | 'last' | null>(null);
    const listId = useId();

    useEffect(() => {
        if (!open || !pendingFocus.current) return;
        const items = optionElements(listRef.current);
        const target = pendingFocus.current === 'last'
            ? items[items.length - 1]
            : items.find(item => item.getAttribute('aria-selected') === 'true') ?? items[0];
        pendingFocus.current = null;
        target?.focus();
    }, [open]);

    // Tabbing out of the control closes it
    useEffect(() => {
        if (!open) return;
        const onFocusIn = (e: FocusEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('focusin', onFocusIn);
        return () => document.removeEventListener('focusin', onFocusIn);
    }, [open]);

    const closeAndReturn = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        pendingFocus.current = e.key === 'ArrowUp' ? 'last' : 'first';
        if (open) {
            const items = optionElements(listRef.current);
            (e.key === 'ArrowUp' ? items[items.length - 1] : items[0])?.focus();
            pendingFocus.current = null;
        } else {
            setOpen(true);
        }
    };

    const onListKeyDown = (e: React.KeyboardEvent) => {
        const items = optionElements(listRef.current);
        const index = items.indexOf(document.activeElement as HTMLElement);
        let next: HTMLElement | undefined;
        switch (e.key) {
            case 'ArrowDown': next = items[Math.min(index + 1, items.length - 1)]; break;
            case 'ArrowUp': next = index <= 0 ? triggerRef.current ?? undefined : items[index - 1]; break;
            case 'Home': next = items[0]; break;
            case 'End': next = items[items.length - 1]; break;
            default: return;
        }
        e.preventDefault();
        next?.focus();
    };

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
            closeAndReturn();
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
        <div
            ref={containerRef}
            className={cn('relative min-w-0', className)}
            onKeyDown={(e) => {
                if (e.key === 'Escape' && open) {
                    e.stopPropagation();
                    closeAndReturn();
                }
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                aria-label={ariaLabel ? `${triggerLabel}, ${ariaLabel}` : triggerLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                onClick={() => setOpen(v => !v)}
                onKeyDown={onTriggerKeyDown}
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
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        aria-label={ariaLabel ?? placeholder}
                        aria-multiselectable={!singleSelect}
                        className="px-1 max-h-52 overflow-y-auto overscroll-contain touch-pan-y"
                        onWheel={e => e.stopPropagation()}
                        onKeyDown={onListKeyDown}
                    >
                        {options.map((option, i) => {
                            const active = selected.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    // Arrow keys move between options; Tab moves past the list
                                    tabIndex={i === 0 ? 0 : -1}
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
