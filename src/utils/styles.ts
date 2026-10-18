/**
 * Class Name Utility
 * Conditionally joins class names together, filtering out falsy values.
 * No Tailwind merging: pass variants as props instead of overriding classes.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
