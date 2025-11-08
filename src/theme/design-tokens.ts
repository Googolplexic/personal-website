/**
 * Design Tokens
 * Central source of truth for all design values used throughout the application.
 * All components should reference these tokens rather than hardcoding values.
 */

/**
 * Color Palette
 * Organized by semantic meaning with light/dark variants
 */
export const colors = {
    // Background colors
    background: {
        primary: {
            light: 'bg-gray-300',
            dark: 'bg-gray-950',
        },
        secondary: {
            light: 'bg-gray-200',
            dark: 'bg-gray-800',
        },
        tertiary: {
            light: 'bg-gray-100',
            dark: 'bg-gray-900',
        },
    },

    // Text colors
    text: {
        primary: {
            light: 'text-gray-900',
            dark: 'text-white',
        },
        secondary: {
            light: 'text-gray-600',
            dark: 'text-gray-400',
        },
        tertiary: {
            light: 'text-gray-800',
            dark: 'text-gray-300',
        },
        inverse: {
            light: 'text-white',
            dark: 'text-gray-900',
        },
    },

    // Border colors
    border: {
        default: {
            light: 'border-gray-400',
            dark: 'border-gray-700',
        },
        focus: {
            light: 'border-gray-600',
            dark: 'border-gray-500',
        },
    },

    // Interactive colors
    interactive: {
        primary: {
            light: 'text-blue-700',
            dark: 'text-blue-300',
        },
        hover: {
            light: 'hover:text-gray-900',
            dark: 'hover:text-white',
        },
    },

    // Accent colors
    accent: {
        highlight: {
            light: 'bg-purple-300',
            dark: 'bg-purple-800',
        },
    },

    // UI element colors
    button: {
        primary: {
            light: 'bg-gray-600 hover:bg-gray-700',
            dark: 'bg-gray-600 hover:bg-gray-700',
        },
        secondary: {
            light: 'bg-black/50 hover:bg-black/70',
            dark: 'bg-black/50 hover:bg-gray-800',
        },
    },

    pill: {
        background: {
            light: 'bg-gray-200',
            dark: 'bg-gray-700',
        },
        text: {
            light: 'text-gray-800',
            dark: 'text-gray-200',
        },
    },

    indicator: {
        active: {
            light: 'bg-gray-600',
            dark: 'bg-gray-300',
        },
        inactive: {
            light: 'bg-gray-300 hover:bg-gray-400',
            dark: 'bg-gray-600 hover:bg-gray-500',
        },
    },
} as const;

/**
 * Spacing Scale
 * Consistent spacing values for padding, margin, gaps
 */
export const spacing = {
    none: '0',
    xs: '0.25rem',    // 1 - 4px
    sm: '0.5rem',     // 2 - 8px
    md: '0.75rem',    // 3 - 12px
    lg: '1rem',       // 4 - 16px
    xl: '1.5rem',     // 6 - 24px
    '2xl': '2rem',    // 8 - 32px
    '3xl': '3rem',    // 12 - 48px
    '4xl': '4rem',    // 16 - 64px
    '5xl': '6rem',    // 24 - 96px
    '6xl': '9rem',    // 36 - 144px
} as const;

/**
 * Typography Scale
 * Font sizes, weights, and line heights
 */
export const typography = {
    size: {
        xs: 'text-xs',        // 0.75rem - 12px
        sm: 'text-sm',        // 0.875rem - 14px
        base: 'text-base',    // 1rem - 16px
        lg: 'text-lg',        // 1.125rem - 18px
        xl: 'text-xl',        // 1.25rem - 20px
        '2xl': 'text-2xl',    // 1.5rem - 24px
        '3xl': 'text-3xl',    // 1.875rem - 30px
        '4xl': 'text-4xl',    // 2.25rem - 36px
    },
    weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    },
    responsive: {
        base: 'md:text-base text-sm',
        heading: {
            h1: 'text-4xl',
            h2: 'text-2xl',
            h3: 'text-xl',
        },
    },
} as const;

/**
 * Border Radius
 * Consistent rounding values
 */
export const radius = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    default: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
} as const;

/**
 * Shadows
 * Box shadow definitions
 */
export const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    // Custom hover shadows for cards
    cardHover: {
        light: '[box-shadow:0_0_15px_2px_rgba(0,0,0,0.2)]',
        dark: '[box-shadow:0_0_15px_2px_rgba(255,255,255,0.2)]',
    },
} as const;

/**
 * Transitions
 * Animation and transition definitions
 */
export const transitions = {
    default: 'transition-all',
    colors: 'transition-colors',
    transform: 'transition-transform',
    opacity: 'transition-opacity',
    duration: {
        fast: 'duration-150',
        normal: 'duration-200',
        slow: 'duration-300',
    },
} as const;

/**
 * Z-Index Layers
 * Stacking order for positioned elements
 */
export const zIndex = {
    base: 'z-0',
    dropdown: 'z-10',
    sticky: 'z-20',
    fixed: 'z-30',
    modalBackdrop: 'z-40',
    modal: 'z-50',
    popover: 'z-60',
    tooltip: 'z-70',
} as const;

/**
 * Layout
 * Common layout patterns and constraints
 */
export const layout = {
    container: {
        maxWidth: {
            sm: 'max-w-3xl',
            md: 'max-w-5xl',
            lg: 'max-w-7xl',
        },
        padding: {
            mobile: 'px-4',
            tablet: 'sm:px-12',
            desktop: 'md:px-16',
        },
    },
    section: {
        padding: {
            vertical: 'py-36',
        },
    },
} as const;

/**
 * Breakpoints (for reference)
 * These match Tailwind's default breakpoints
 */
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

/**
 * Common Component Patterns
 * Reusable class combinations for common patterns
 */
export const patterns = {
    card: {
        base: 'border-2 rounded-lg dark:border-gray-700 border-gray-400',
        interactive: 'cursor-pointer hover:[box-shadow:0_0_15px_2px_rgba(0,0,0,0.2)] dark:hover:[box-shadow:0_0_15px_2px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02]',
        padding: {
            sm: 'p-4',
            md: 'p-6',
            lg: 'lg:p-12 p-6',
        },
    },
    heading: {
        section: 'text-2xl font-semibold mb-6 dark:text-white',
        page: 'text-4xl font-bold mb-4 dark:text-white',
    },
    pill: {
        base: 'px-3 py-1 rounded-full text-sm',
        colors: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    },
    link: {
        primary: 'text-blue-700 dark:text-blue-300 font-bold',
        nav: 'text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors',
    },
    button: {
        base: 'transition-colors no-underline rounded-lg',
        primary: 'bg-gray-600 hover:bg-gray-700 text-white px-6 py-3',
        icon: 'p-2 border-none focus:outline-none',
    },
} as const;

/**
 * Utility: Get theme-aware class
 * Helper to get light/dark class combinations
 */
export function getThemeClasses(
    lightClass: string,
    darkClass: string
): string {
    return `${lightClass} dark:${darkClass}`;
}
