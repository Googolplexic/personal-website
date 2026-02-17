import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

const headingStyles: Record<number, string> = {
    1: 'gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4',
    2: 'gallery-heading text-2xl md:text-3xl mb-6',
    3: 'gallery-heading text-xl md:text-2xl mb-4',
    4: 'gallery-heading text-lg mb-3',
    5: 'gallery-heading text-base mb-2',
    6: 'gallery-heading text-sm mb-2',
};

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
                headingStyles[level] || headingStyles[2],
                className
            )}
            style={{ color: 'var(--color-text-primary)' }}
            {...props}
        >
            {children}
        </Component>
    );
}
