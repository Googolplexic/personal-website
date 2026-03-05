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

