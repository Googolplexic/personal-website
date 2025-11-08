import { ReactNode } from 'react';
import { cn, createVariants } from '../../../utils/styles';
import { patterns, typography } from '../../../theme/design-tokens';

const headingVariants = createVariants({
    base: '',
    variants: {
        level: {
            1: patterns.heading.page,
            2: patterns.heading.section,
            3: `${typography.size.xl} ${typography.weight.bold} mb-4 dark:text-white`,
            4: `${typography.size.lg} ${typography.weight.semibold} mb-3 dark:text-white`,
            5: `${typography.size.base} ${typography.weight.semibold} mb-2 dark:text-white`,
            6: `${typography.size.sm} ${typography.weight.semibold} mb-2 dark:text-white`,
        },
    },
    defaultVariants: {
        level: 2,
    },
});

export interface HeadingProps {
    children: ReactNode;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
}

/**
 * Heading - Semantic heading component
 * Renders h1-h6 with consistent styling based on level
 */
export function Heading({
    children,
    level = 2,
    className,
    ...props
}: HeadingProps) {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;

    return (
        <Component
            className={cn(
                headingVariants({ level }),
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
