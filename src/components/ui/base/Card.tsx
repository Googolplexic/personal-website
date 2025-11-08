import { ReactNode } from 'react';
import { cn, createVariants } from '../../../utils/styles';
import { patterns } from '../../../theme/design-tokens';

const cardVariants = createVariants({
    base: patterns.card.base,
    variants: {
        variant: {
            default: '',
            interactive: patterns.card.interactive,
        },
        padding: {
            sm: patterns.card.padding.sm,
            md: patterns.card.padding.md,
            lg: patterns.card.padding.lg,
        },
    },
    defaultVariants: {
        variant: 'default',
        padding: 'md',
    },
});

export interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'interactive';
    padding?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * Card - Container component with border and optional interactivity
 * Used for content sections that need visual separation
 */
export function Card({
    children,
    variant,
    padding,
    className,
    onClick,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                cardVariants({ variant, padding }),
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}
