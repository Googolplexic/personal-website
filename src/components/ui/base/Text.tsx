import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

const sizeMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
};

const weightMap: Record<string, string> = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
};

const colorVarMap: Record<string, string> = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    inverse: 'var(--color-bg-primary)',
};

export interface TextProps {
    children: ReactNode;
    as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
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
    size = 'base',
    weight = 'normal',
    color = 'primary',
    className,
    ...props
}: TextProps) {
    return (
        <Component
            className={cn(
                sizeMap[size],
                weightMap[weight],
                className
            )}
            style={{ color: colorVarMap[color] }}
            {...props}
        >
            {children}
        </Component>
    );
}
