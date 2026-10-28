import { lazy, Suspense, useEffect, useState } from 'react';
import { loadCommandMenu, onOpenCommandMenu } from './openCommandMenu';

const CommandMenu = lazy(() => loadCommandMenu().then((module) => ({ default: module.CommandMenu })));

/** Listens for Ctrl/⌘+K and openCommandMenu(); the menu's code loads on first open. */
export function CommandMenuHost() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((wasOpen) => !wasOpen);
            }
        };
        window.addEventListener('keydown', onKey);
        const stopListening = onOpenCommandMenu(() => setOpen(true));
        return () => {
            window.removeEventListener('keydown', onKey);
            stopListening();
        };
    }, []);

    if (!open) return null;
    return (
        <Suspense fallback={null}>
            <CommandMenu onClose={() => setOpen(false)} />
        </Suspense>
    );
}
