/**
 * Design Tokens — Art Gallery / Spotlight Theme
 * Central source of truth for all design values.
 * Uses CSS custom properties for dynamic theme switching.
 */

/* ================================================================
   COLORS
   ================================================================ */
export const colors = {
    background: {
        primary: {
            light: 'bg-gallery-bg',
            dark: 'bg-gallery-bg-dark',
        },
        secondary: {
            light: 'bg-gallery-secondary',
            dark: 'bg-gallery-secondary-dark',
        },
        surface: {
            light: 'bg-gallery-surface',
            dark: 'bg-gallery-surface-dark',
        },
    },
    text: {
        primary: {
            light: 'text-gallery-text',
            dark: 'text-gallery-text-dark',
        },
        secondary: {
            light: 'text-gallery-muted',
            dark: 'text-gallery-muted-dark',
        },
        tertiary: {
            light: 'text-gallery-dim',
            dark: 'text-gallery-dim-dark',
        },
        inverse: {
            light: 'text-white',
            dark: 'text-gallery-text',
        },
    },
    border: {
        default: {
            light: 'border-black/8',
            dark: 'border-white/6',
        },
        hover: {
            light: 'border-black/15',
            dark: 'border-white/12',
        },
    },
    interactive: {
        primary: {
            light: 'text-gallery-text',
            dark: 'text-gallery-text-dark',
        },
        hover: {
            light: 'hover:text-gallery-accent',
            dark: 'hover:text-gallery-accent-dark',
        },
    },
    accent: {
        highlight: {
            light: 'bg-amber-100',
            dark: 'bg-amber-900/50',
        },
    },
    button: {
        primary: {
            light: 'bg-gallery-text hover:bg-gallery-accent',
            dark: 'bg-gallery-text-dark hover:bg-white',
        },
        secondary: {
            light: 'bg-transparent hover:bg-black/5',
            dark: 'bg-transparent hover:bg-white/5',
        },
    },
    pill: {
        background: {
            light: 'bg-black/5',
            dark: 'bg-white/8',
        },
        text: {
            light: 'text-gallery-text',
            dark: 'text-gallery-text-dark',
        },
    },
    indicator: {
        active: {
            light: 'bg-gallery-text',
            dark: 'bg-gallery-text-dark',
        },
        inactive: {
            light: 'bg-black/15 hover:bg-black/25',
            dark: 'bg-white/15 hover:bg-white/25',
        },
    },
} as const;

/* ================================================================
   SPACING
   ================================================================ */
export const spacing = {
    none: '0',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '6rem',
    '6xl': '9rem',
} as const;

/* ================================================================
   TYPOGRAPHY
   ================================================================ */
export const typography = {
    family: {
        heading: "font-heading",  // 'Playfair Display', Georgia, serif
        body: "font-body",        // 'Inter', system-ui, sans-serif
    },
    size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
    },
    weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    },
    tracking: {
        tighter: 'tracking-tighter',
        tight: 'tracking-tight',
        normal: 'tracking-normal',
        wide: 'tracking-wide',
        wider: 'tracking-wider',
        widest: 'tracking-widest',
    },
    responsive: {
        base: 'md:text-base text-sm',
        heading: {
            h1: 'text-4xl md:text-5xl lg:text-6xl',
            h2: 'text-2xl md:text-3xl',
            h3: 'text-xl md:text-2xl',
        },
    },
} as const;

/* ================================================================
   BORDER RADIUS
   ================================================================ */
export const radius = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    default: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
} as const;

/* ================================================================
   SHADOWS — gallery spotlight-inspired
   ================================================================ */
export const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    spotlight: {
        light: '',
        dark: '',
    },
    spotlightStrong: {
        light: '',
        dark: '',
    },
} as const;

/* ================================================================
   TRANSITIONS — slower, more cinematic
   ================================================================ */
export const transitions = {
    default: 'transition-all',
    colors: 'transition-colors',
    transform: 'transition-transform',
    opacity: 'transition-opacity',
    duration: {
        fast: 'duration-200',
        normal: 'duration-300',
        slow: 'duration-500',
        cinematic: 'duration-700',
    },
    ease: {
        default: 'ease-out',
        smooth: 'ease-in-out',
    },
} as const;

/* ================================================================
   Z-INDEX
   ================================================================ */
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

/* ================================================================
   LAYOUT
   ================================================================ */
export const layout = {
    container: {
        maxWidth: {
            sm: 'max-w-3xl',
            md: 'max-w-5xl',
            lg: 'max-w-7xl',
        },
        padding: {
            mobile: 'px-5',
            tablet: 'sm:px-8',
            desktop: 'md:px-16',
        },
    },
    section: {
        padding: {
            vertical: 'py-24',
        },
    },
} as const;

/* ================================================================
   BREAKPOINTS (reference)
   ================================================================ */
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

/* ================================================================
   PATTERNS — reusable component class combos
   ================================================================ */
export const patterns = {
    card: {
        base: '',
        interactive: 'spotlight-item cursor-pointer',
        padding: {
            sm: 'p-4',
            md: 'p-6',
            lg: 'lg:p-10 p-6',
        },
    },
    heading: {
        section: 'gallery-heading text-2xl md:text-3xl mb-6',
        page: 'gallery-heading text-4xl md:text-5xl lg:text-6xl mb-4',
    },
    pill: {
        base: 'text-xs font-body tracking-wide',
        colors: 'text-[var(--color-text-tertiary)]',
    },
    link: {
        primary: 'font-medium underline-offset-4 hover:underline transition-colors',
        nav: 'nav-link-gallery',
    },
    button: {
        base: 'transition-all duration-300 no-underline font-body',
        primary: 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:opacity-90 active:opacity-80 px-5 py-2.5 text-xs tracking-[0.15em] uppercase',
        secondary: 'border border-[var(--color-text-tertiary)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] px-5 py-2.5 text-xs tracking-[0.15em] uppercase',
        icon: 'p-2 border-none focus:outline-none hover:opacity-70 active:opacity-60',
    },
    spotlight: {
        group: 'spotlight-group',
        item: 'spotlight-item',
    },
} as const;

/* ================================================================
   UTILITY: theme-aware class builder
   ================================================================ */
export function getThemeClasses(
    lightClass: string,
    darkClass: string
): string {
    return `${lightClass} dark:${darkClass}`;
}

