/**
 * Style Utilities
 * Helper functions for working with styles and class names
 */

/**
 * Class Name Utility
 * Conditionally joins class names together, filtering out falsy values
 * 
 * @example
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * // => 'base-class conditional-class another-class' (if condition is true)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Variant Builder
 * Creates a variant system for components
 * 
 * @example
 * const buttonVariants = createVariants({
 *   base: 'px-4 py-2 rounded',
 *   variants: {
 *     color: {
 *       primary: 'bg-blue-500 text-white',
 *       secondary: 'bg-gray-500 text-white',
 *     },
 *     size: {
 *       sm: 'text-sm',
 *       lg: 'text-lg',
 *     },
 *   },
 *   defaultVariants: {
 *     color: 'primary',
 *     size: 'sm',
 *   },
 * });
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

        // Start with base classes
        const classes = [config.base];

        // Add variant classes
        Object.keys(config.variants).forEach((variantKey) => {
            const key = variantKey as keyof T;
            const variantValue =
                (variantProps as Record<string, string | undefined>)[variantKey] ||
                config.defaultVariants?.[key];

            if (variantValue && config.variants[key][variantValue as string]) {
                classes.push(config.variants[key][variantValue as string]);
            }
        });

        // Add custom className if provided
        if (className) {
            classes.push(className);
        }

        return classes.join(' ');
    };
}

/**
 * Responsive Utility
 * Generates responsive class names
 * 
 * @example
 * responsive({ mobile: 'text-sm', tablet: 'sm:text-base', desktop: 'md:text-lg' })
 * // => 'text-sm sm:text-base md:text-lg'
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
 * Combines light and dark mode classes
 * 
 * @example
 * themeClasses('bg-white', 'bg-gray-900')
 * // => 'bg-white dark:bg-gray-900'
 */
export function themeClasses(lightClass: string, darkClass: string): string {
    return `${lightClass} dark:${darkClass}`;
}

/**
 * Padding/Margin Builder
 * Generates spacing classes
 * 
 * @example
 * spacing({ p: '4', mx: 'auto' })
 * // => 'p-4 mx-auto'
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
        if (value) {
            classes.push(`${key}-${value}`);
        }
    });

    return classes.join(' ');
}

/**
 * Overlay Utility
 * Creates semi-transparent overlays for modals, carousels, etc.
 * 
 * @example
 * overlay('medium')
 * // => 'bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800'
 */
export function overlay(opacity: 'light' | 'medium' | 'heavy' = 'medium'): string {
    const overlays = {
        light: 'bg-black/30 hover:bg-black/40 dark:hover:bg-gray-700',
        medium: 'bg-black/50 hover:bg-black/70 dark:hover:bg-gray-800',
        heavy: 'bg-black/70 hover:bg-black/80 dark:hover:bg-gray-900',
    };
    return overlays[opacity];
}

/**
 * Container Utility
 * Creates centered containers with max-width
 * 
 * @example
 * container('md')
 * // => 'max-w-5xl mx-auto px-4'
 */
export function container(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string {
    const containers = {
        sm: 'max-w-3xl mx-auto px-4',
        md: 'max-w-5xl mx-auto px-4',
        lg: 'max-w-6xl mx-auto px-4',
        xl: 'max-w-7xl mx-auto px-4',
        full: 'w-full px-4',
    };
    return containers[size];
}

/**
 * Grid Utility
 * Creates responsive grid layouts
 * 
 * @example
 * grid('2', '8')
 * // => 'grid grid-cols-1 lg:grid-cols-2 gap-8'
 */
export function grid(cols: '1' | '2' | '3' = '2', gap: string = '8'): string {
    if (cols === '1') return `grid grid-cols-1 gap-${gap}`;
    if (cols === '3') return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-${gap}`;
    return `grid grid-cols-1 lg:grid-cols-2 gap-${gap}`;
}

/**
 * Fixed Position Utility
 * Creates fixed positioning for elements like theme toggles
 * 
 * @example
 * fixedPosition('bottom-right')
 * // => 'fixed bottom-12 right-12'
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
 * Form Input Utility
 * Creates consistent form input styling
 * 
 * @example
 * formInput()
 * // => 'w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white'
 */
export function formInput(fullWidth: boolean = true): string {
    const base = 'px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white';
    return fullWidth ? `w-full ${base}` : base;
}

/**
 * Form Select Utility
 * Creates consistent form select styling (same as input for consistency)
 * 
 * @example
 * formSelect()
 * // => 'px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white flex-1 min-w-0'
 */
export function formSelect(): string {
    return 'px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white flex-1 min-w-0';
}
