/**
 * Style Utilities — Art Gallery Theme
 * Helper functions for working with styles and class names
 */

/**
 * Class Name Utility
 * Conditionally joins class names together, filtering out falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Variant Builder
 * Creates a variant system for components (mini CVA)
 */
type VariantConfig<T extends Record<string, Record<string, string>>> = {
    base: string;
    variants: T;
    defaultVariants?: Partial<{
        [K in keyof T]: keyof T[K];
    }>;
};

type VariantProps<T extends Record<string, Record<string, string>>> = Partial<{
    [K in keyof T]: keyof T[K];
}> & {
    className?: string;
};

export function createVariants<T extends Record<string, Record<string, string>>>(
    config: VariantConfig<T>
) {
    return (props?: VariantProps<T>): string => {
        const { className, ...variantProps } = props || {};

        const classes = [config.base];

        Object.keys(config.variants).forEach((variantKey) => {
            const key = variantKey as keyof T;
            const variantValue =
                (variantProps as Record<string, string | undefined>)[variantKey] ||
                config.defaultVariants?.[key];

            if (variantValue && config.variants[key][variantValue as string]) {
                classes.push(config.variants[key][variantValue as string]);
            }
        });

        if (className) {
            classes.push(className);
        }

        return classes.join(' ');
    };
}

/**
 * Responsive Utility
 */
export function responsive(values: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
}): string {
    const classes: string[] = [];
    if (values.mobile) classes.push(values.mobile);
    if (values.tablet) classes.push(`sm:${values.tablet}`);
    if (values.desktop) classes.push(`md:${values.desktop}`);
    if (values.wide) classes.push(`lg:${values.wide}`);
    return classes.join(' ');
}

/**
 * Theme-Aware Class Builder
 */
export function themeClasses(lightClass: string, darkClass: string): string {
    return `${lightClass} dark:${darkClass}`;
}

/**
 * Spacing Builder
 */
export function spacing(values: {
    p?: string;
    px?: string;
    py?: string;
    pt?: string;
    pr?: string;
    pb?: string;
    pl?: string;
    m?: string;
    mx?: string;
    my?: string;
    mt?: string;
    mr?: string;
    mb?: string;
    ml?: string;
}): string {
    const classes: string[] = [];
    Object.entries(values).forEach(([key, value]) => {
        if (value) classes.push(`${key}-${value}`);
    });
    return classes.join(' ');
}

/**
 * Overlay Utility — frosted glass style for the gallery theme
 */
export function overlay(opacity: 'light' | 'medium' | 'heavy' = 'medium'): string {
    const overlays = {
        light: 'bg-black/20 hover:bg-black/30 backdrop-blur-sm',
        medium: 'bg-black/40 hover:bg-black/50 backdrop-blur-sm',
        heavy: 'bg-black/60 hover:bg-black/70 backdrop-blur-sm',
    };
    return overlays[opacity];
}

/**
 * Container Utility
 */
export function container(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string {
    const containers = {
        sm: 'max-w-3xl mx-auto px-5',
        md: 'max-w-5xl mx-auto px-5',
        lg: 'max-w-6xl mx-auto px-5',
        xl: 'max-w-7xl mx-auto px-5',
        full: 'w-full px-5',
    };
    return containers[size];
}

/**
 * Grid Utility
 */
export function grid(cols: '1' | '2' | '3' = '2', gap: string = '8'): string {
    if (cols === '1') return `grid grid-cols-1 gap-${gap}`;
    if (cols === '3') return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-${gap}`;
    return `grid grid-cols-1 lg:grid-cols-2 gap-${gap}`;
}

/**
 * Fixed Position Utility
 */
export function fixedPosition(position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right'): string {
    const positions = {
        'bottom-right': 'fixed bottom-12 right-12',
        'bottom-left': 'fixed bottom-12 left-12',
        'top-right': 'fixed top-12 right-12',
        'top-left': 'fixed top-12 left-12',
    };
    return positions[position];
}

/**
 * Gallery Form Input
 */
export function formInput(fullWidth: boolean = true): string {
    const base = 'gallery-input';
    return fullWidth ? `w-full ${base}` : base;
}

/**
 * Gallery Form Select
 */
export function formSelect(): string {
    return 'gallery-select flex-1 min-w-0';
}

