import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { loadCommandMenu, onOpenCommandMenu } from './openCommandMenu';

const CommandMenu = lazy(() => loadCommandMenu().then((module) => ({ default: module.CommandMenu })));

/** Listens for Ctrl/⌘+K and openCommandMenu(); the menu's code loads on first open. */
export function CommandMenuHost() {
    const [open, setOpen] = useState(false);
    // Stays mounted through the close animation, then drops
    const [mounted, setMounted] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    const onExited = useCallback(() => setMounted(false), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setMounted(true);
                setOpen((wasOpen) => !wasOpen);
            }
        };
        window.addEventListener('keydown', onKey);
        const stopListening = onOpenCommandMenu(() => {
            setMounted(true);
            setOpen(true);
        });
        return () => {
            window.removeEventListener('keydown', onKey);
            stopListening();
        };
    }, []);

    if (!mounted) return null;
    return (
        <Suspense fallback={null}>
            <CommandMenu open={open} onClose={close} onExited={onExited} />
        </Suspense>
    );
}
