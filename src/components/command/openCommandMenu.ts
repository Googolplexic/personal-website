import { loadSearchIndex } from './searchIndex';

const OPEN_EVENT = 'command-menu:open';

/** Opens the command menu from anywhere (it's mounted once, by SiteShell). */
export function openCommandMenu() {
    window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCommandMenu(listener: () => void) {
    window.addEventListener(OPEN_EVENT, listener);
    return () => window.removeEventListener(OPEN_EVENT, listener);
}

export const loadCommandMenu = () => import('./CommandMenu');

/** Fetches the menu's code and the piece list ahead of a likely open (hover or focus on the trigger). */
export function preloadCommandMenu() {
    void loadCommandMenu();
    loadSearchIndex().catch(() => {});
}

/** "⌘ K" on Apple devices, "Ctrl K" elsewhere. Call after hydration; the prerendered HTML has no navigator. */
export function shortcutLabel() {
    return /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K';
}
