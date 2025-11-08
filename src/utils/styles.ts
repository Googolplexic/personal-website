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
