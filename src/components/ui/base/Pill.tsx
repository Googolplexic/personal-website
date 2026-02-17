import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

export interface PillProps {
    children: ReactNode;
    variant?: 'default' | 'custom';
    color?: string;
    className?: string;
}

/**
 * Pill — minimal text tag with subtle separator.
 */
export function Pill({
    children,
    variant = 'default',
    color,
    className,
    ...props
}: PillProps) {
    return (
        <span
            className={cn(
                'text-xs font-body tracking-[0.12em] uppercase',
                color,
                className
            )}
            style={!color ? {
                color: 'var(--color-text-secondary)',
            } : undefined}
            {...props}
        >
            {children}
        </span>
    );
}
