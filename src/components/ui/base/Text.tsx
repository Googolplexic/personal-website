import { ReactNode } from 'react';
import { cn, createVariants } from '../../../utils/styles';
import { typography } from '../../../theme/design-tokens';

const textVariants = createVariants({
    base: '',
    variants: {
        size: {
            xs: typography.size.xs,
            sm: typography.size.sm,
            base: typography.size.base,
            lg: typography.size.lg,
            xl: typography.size.xl,
            '2xl': typography.size['2xl'],
            '3xl': typography.size['3xl'],
            '4xl': typography.size['4xl'],
        },
        weight: {
            normal: typography.weight.normal,
            medium: typography.weight.medium,
            semibold: typography.weight.semibold,
            bold: typography.weight.bold,
        },
        color: {
            primary: 'text-gray-900 dark:text-white',
            secondary: 'text-gray-600 dark:text-gray-400',
            tertiary: 'text-gray-800 dark:text-gray-300',
            inverse: 'text-white dark:text-gray-900',
        },
    },
    defaultVariants: {
        size: 'base',
        weight: 'normal',
        color: 'primary',
    },
});

export interface TextProps {
    children: ReactNode;
    as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
    className?: string;
}

/**
 * Text - Typography primitive component
 * Handles all text rendering with consistent styling
 */
export function Text({
    children,
    as: Component = 'p',
    size,
    weight,
    color,
    className,
    ...props
}: TextProps) {
    return (
        <Component
            className={cn(
                textVariants({ size, weight, color }),
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
