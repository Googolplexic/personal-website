import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { useSpotlightPreference } from '../../useSpotlightPreference';
import { cn } from '../../utils/styles';
import { Kbd } from '../ui/Kbd';
import { SearchIcon } from '../ui/SearchIcon';
import { loadSearchIndex, matchScore, type SearchEntry } from './searchIndex';

/** Pieces shown per section, so one broad word doesn't bury the pages and actions */
const PIECES_PER_SECTION = 6;

/** Matches the close keyframes in motion.css */
const CLOSE_MS = 200;

type Group = 'Pages' | 'Portfolio' | 'Origami' | 'Actions' | 'Links';
const GROUP_ORDER: Group[] = ['Pages', 'Portfolio', 'Origami', 'Actions', 'Links'];

type CommandAction =
    | { type: 'go'; path: string }
    | { type: 'link'; href: string }
    | { type: 'copy' }
    | { type: 'spotlight' };

interface Command {
    id: string;
    group: Group;
    label: string;
    detail?: string;
    keywords?: string;
    external?: boolean;
    action: CommandAction;
}

const LINKS = [
    { label: 'Resume', href: '/resume.pdf', keywords: 'cv pdf' },
    { label: 'GitHub', href: 'https://github.com/Googolplexic', keywords: 'code source' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/coleman-lai', keywords: 'contact work' },
    { label: 'Instagram', href: 'https://www.instagram.com/12googolplex', keywords: 'origami photos' },
];

/**
 * Ctrl/⌘+K menu: jump to any page or piece, open a link, or run a site action.
 * A combobox over a listbox, so focus stays in the input and arrows move the highlight.
 */
export function CommandMenu({ open, onClose, onExited }: { open: boolean; onClose: () => void; onExited: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { enabled: spotlightOn, toggleEnabled: toggleSpotlight } = useSpotlightPreference();
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [entries, setEntries] = useState<SearchEntry[] | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const closingRef = useRef(false);
    const finishedRef = useRef(false);
    const afterCloseRef = useRef<(() => void) | null>(null);
    // False only when this instance mounts after the menu was already asked to close
    const [entered] = useState(open);
    const id = useId();

    const requestClose = useCallback((after?: () => void) => {
        if (closingRef.current) return;
        closingRef.current = true;
        afterCloseRef.current = after ?? null;
        onClose();
    }, [onClose]);

    // Play the close, then drop the dialog. A menu that mounts already closed never paints.
    useEffect(() => {
        if (open) return;
        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            const after = afterCloseRef.current;
            afterCloseRef.current = null;
            onExited();
            after?.();
        };
        if (!entered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finish();
            return;
        }
        const panel = panelRef.current;
        const onEnd = (event: AnimationEvent) => {
            if (event.target === panel && event.animationName === 'command-menu-out') finish();
        };
        panel?.addEventListener('animationend', onEnd);
        // If the animation never starts, don't leave the dialog stuck open
        const timer = window.setTimeout(finish, CLOSE_MS + 100);
        return () => {
            panel?.removeEventListener('animationend', onEnd);
            window.clearTimeout(timer);
        };
    }, [open, entered, onExited]);

    useEffect(() => {
        let current = true;
        loadSearchIndex()
            .then((list) => { if (current) setEntries(list); })
            .catch(() => { if (current) setLoadFailed(true); });
        return () => { current = false; };
    }, []);

    // Focus goes to the input, and back to whatever had it when the menu closes
    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        inputRef.current?.focus();
        return () => opener?.focus();
    }, []);

    // Lock page scroll, restoring whatever was there (a lightbox may already hold the lock)
    useEffect(() => {
        const root = document.documentElement;
        const previousOverflow = document.body.style.overflow;
        const wasLocked = root.classList.contains('scroll-locked');
        document.body.style.overflow = 'hidden';
        root.classList.add('scroll-locked');
        return () => {
            document.body.style.overflow = previousOverflow;
            if (!wasLocked) root.classList.remove('scroll-locked');
        };
    }, []);

    const commands = useMemo<Command[]>(() => [
        { id: 'home', group: 'Pages', label: 'Home', keywords: 'about start', action: { type: 'go', path: '/' } },
        { id: 'portfolio', group: 'Pages', label: 'Portfolio', keywords: 'projects software code', action: { type: 'go', path: '/portfolio' } },
        { id: 'origami', group: 'Pages', label: 'Origami', keywords: 'gallery paper folding models', action: { type: 'go', path: '/origami' } },
        ...(entries ?? []).map((entry): Command => ({
            id: entry.path,
            group: entry.section,
            label: entry.title,
            detail: entry.detail,
            keywords: entry.keywords,
            action: { type: 'go', path: entry.path },
        })),
        {
            id: 'copy-link',
            group: 'Actions',
            label: copied ? 'Link copied' : 'Copy link to this page',
            keywords: 'share url clipboard',
            action: { type: 'copy' },
        },
        {
            id: 'spotlight',
            group: 'Actions',
            label: `Turn spotlight ${spotlightOn ? 'off' : 'on'}`,
            keywords: 'lighting effects motion cursor dust',
            action: { type: 'spotlight' },
        },
        ...LINKS.map((link): Command => ({
            id: link.href,
            group: 'Links',
            label: link.label,
            keywords: link.keywords,
            external: true,
            action: { type: 'link', href: link.href },
        })),
    ], [entries, copied, spotlightOn]);

    const run = (command: Command) => {
        switch (command.action.type) {
            case 'go': {
                const { path } = command.action;
                requestClose(() => {
                    if (location.pathname === path) window.scrollTo({ top: 0, behavior: 'smooth' });
                    else void navigate(path);
                });
                break;
            }
            case 'link': {
                const { href } = command.action;
                requestClose(() => { window.open(href, '_blank', 'noopener,noreferrer'); });
                break;
            }
            case 'copy':
                void navigator.clipboard?.writeText(window.location.href).then(() => {
                    setCopied(true);
                    setTimeout(() => requestClose(), 600);
                });
                break;
            case 'spotlight':
                toggleSpotlight();
                requestClose();
                break;
        }
    };

    // Grouped and ranked: pieces only appear once something is typed
    const groups = useMemo(() => {
        const searching = query.trim() !== '';
        const byGroup = new Map<Group, { command: Command; score: number }[]>();
        for (const command of commands) {
            const isPiece = command.group === 'Portfolio' || command.group === 'Origami';
            if (isPiece && !searching) continue;
            const score = matchScore(query, command.label, `${command.detail ?? ''} ${command.keywords ?? ''}`);
            if (!score) continue;
            const list = byGroup.get(command.group) ?? [];
            list.push({ command, score });
            byGroup.set(command.group, list);
        }
        return GROUP_ORDER
            .flatMap((group) => {
                const list = byGroup.get(group);
                if (!list) return [];
                list.sort((a, b) => b.score - a.score);
                const isPiece = group === 'Portfolio' || group === 'Origami';
                return [{ group, best: list[0].score, commands: (isPiece ? list.slice(0, PIECES_PER_SECTION) : list).map((item) => item.command) }];
            })
            // Best matches first; ties keep the usual order
            .sort((a, b) => (searching ? b.best - a.best : 0));
    }, [commands, query]);

    const flat = useMemo(() => groups.flatMap((group) => group.commands), [groups]);
    const active = flat[Math.min(activeIndex, flat.length - 1)];

    useEffect(() => {
        if (!active) return;
        document.getElementById(optionId(id, active.id))?.scrollIntoView({ block: 'nearest' });
    }, [active, id]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        // The lightbox listens on window for the same keys
        e.stopPropagation();
        if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            requestClose();
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((i) => (flat.length ? (Math.min(i, flat.length - 1) + 1) % flat.length : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((i) => (flat.length ? (Math.min(i, flat.length - 1) - 1 + flat.length) % flat.length : 0));
                break;
            case 'Home':
                if (e.ctrlKey || !query) { e.preventDefault(); setActiveIndex(0); }
                break;
            case 'End':
                if (e.ctrlKey || !query) { e.preventDefault(); setActiveIndex(flat.length - 1); }
                break;
            case 'Enter':
                e.preventDefault();
                if (active) run(active);
                break;
            case 'Escape':
                e.preventDefault();
                requestClose();
                break;
            case 'Tab':
                // Nothing else in the dialog takes focus
                e.preventDefault();
                break;
        }
    };

    const searching = query.trim() !== '';
    const piecesPending = searching && !entries && !loadFailed;
    const closing = !open;

    if (closing && !entered) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            className={cn(
                'fixed inset-0 z-10000 flex items-start justify-center px-(--page-margin) pt-[max(12vh,calc(env(safe-area-inset-top)+1rem))]',
                closing && 'pointer-events-none',
            )}
            onKeyDown={onKeyDown}
        >
            <div className={cn('command-menu-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm', closing && 'is-closing')} onClick={() => requestClose()} />

            <div
                ref={panelRef}
                className={cn('command-menu-panel relative w-full max-w-xl flex flex-col max-h-[min(34rem,calc(100dvh-14vh-env(safe-area-inset-bottom)))] border border-solid border-line-strong bg-canvas-raised shadow-[0_24px_80px_rgb(0_0_0/0.6)]', closing && 'is-closing')}
            >
                <div className="flex items-center gap-3 px-4 border-b border-solid border-line">
                    <SearchIcon className="shrink-0 text-gold" />
                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls={`${id}-list`}
                        aria-activedescendant={active ? optionId(id, active.id) : undefined}
                        aria-autocomplete="list"
                        aria-label="Search pages, projects and origami"
                        placeholder="Search pages, projects and origami…"
                        autoComplete="off"
                        spellCheck={false}
                        enterKeyHint="go"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                        className="flex-1 min-w-0 min-h-14 bg-transparent border-none text-ink font-body text-base outline-none placeholder:text-ink-faint"
                    />
                    <button
                        type="button"
                        onClick={() => requestClose()}
                        className="shrink-0 min-h-11 px-0 flex items-center text-ink-faint hover:text-gold"
                        aria-label="Close search"
                        tabIndex={-1}
                    >
                        <Kbd>Esc</Kbd>
                    </button>
                </div>

                <div id={`${id}-list`} role="listbox" aria-label="Results" className="flex-1 overflow-y-auto overscroll-contain py-2">
                    {groups.map(({ group, commands: list }) => (
                        <div key={group} role="group" aria-labelledby={`${id}-${group}`}>
                            <div id={`${id}-${group}`} className="gallery-overline px-4 pt-3 pb-1.5">{group}</div>
                            {list.map((command) => {
                                const isActive = command === active;
                                return (
                                    <div
                                        key={command.id}
                                        id={optionId(id, command.id)}
                                        role="option"
                                        aria-selected={isActive}
                                        onMouseMove={() => { if (!isActive) setActiveIndex(flat.indexOf(command)); }}
                                        onClick={() => run(command)}
                                        className={cn(
                                            'flex items-center gap-4 min-h-11 px-4 py-1.5 border-l-2 border-solid cursor-pointer transition-colors duration-150',
                                            isActive ? 'border-gold bg-surface-raised text-gold' : 'border-transparent text-ink',
                                        )}
                                    >
                                        <span className="flex-1 min-w-0 flex flex-col">
                                            <span className="truncate font-heading text-lg leading-snug">{command.label}</span>
                                            {command.detail && <span className="truncate text-xs tracking-[0.08em] tabular-nums font-body text-ink-faint">{command.detail}</span>}
                                        </span>
                                        {command.external && <ExternalIcon className="shrink-0 text-ink-faint" />}
                                        {isActive && <Kbd className="hidden pointer-fine:inline-flex shrink-0">↵</Kbd>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {piecesPending && <Status>Searching the collection…</Status>}
                    {searching && loadFailed && <Status>Couldn't load the projects and origami. Pages and links still work.</Status>}
                    {flat.length === 0 && !piecesPending && <Status>No matches for “{query.trim()}”.</Status>}
                    {!searching && entries && (
                        <Status>Type to search {entries.length} projects and origami pieces.</Status>
                    )}
                </div>

                <div aria-hidden="true" className="hidden pointer-fine:flex items-center gap-5 px-4 py-2.5 border-t border-solid border-line text-[0.65rem] tracking-[0.2em] uppercase font-body text-ink-faint">
                    <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> Move</span>
                    <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> Open</span>
                    <span className="flex items-center gap-1.5"><Kbd>Esc</Kbd> Close</span>
                </div>
            </div>
        </div>,
        document.body,
    );
}

const optionId = (base: string, commandId: string) => `${base}-option-${commandId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

function Status({ children }: { children: ReactNode }) {
    return <p className="m-0 px-4 py-3 text-sm font-body text-ink-faint">{children}</p>;
}

function ExternalIcon({ className }: { className?: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className={className}>
            <path d="M7 17L17 7M9 7h8v8" />
        </svg>
    );
}
