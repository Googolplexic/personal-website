import type { ReactNode } from 'react';
import { cn } from '../../utils/styles';

/** A key in a shortcut hint. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <kbd className={cn(
            'inline-flex items-center justify-center min-w-6 h-6 px-1.5 border border-solid border-line-strong font-body text-[0.65rem] leading-none tracking-normal normal-case whitespace-nowrap text-ink-muted',
            className,
        )}>
            {children}
        </kbd>
    );
}
