import { ReactNode } from 'react';
import { cn, createVariants } from '../../../utils/styles';
import { patterns } from '../../../theme/design-tokens';

const pillVariants = createVariants({
    base: patterns.pill.base,
    variants: {
        variant: {
            default: patterns.pill.colors,
            custom: '',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export interface PillProps {
    children: ReactNode;
    variant?: 'default' | 'custom';
    color?: string; // Custom color classes for CategoryLabel compatibility
    className?: string;
}

/**
 * Pill - Small badge/tag component
 * Used for displaying tags, technologies, categories, etc.
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
                pillVariants({ variant: color ? 'custom' : variant }),
                color, // If color is provided, use it (for backwards compatibility)
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
