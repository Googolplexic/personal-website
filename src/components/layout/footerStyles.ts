/**
 * Shared hover interaction for every element in the Footer.
 * Single source of truth so nav links, social icons, copyright, build meta,
 * and the spotlight toggle all dim identically on hover.
 *
 * Uses Tailwind's `transition` utility (not `transition-colors` /
 * `transition-opacity`) so both color and opacity animate smoothly
 * together.
 */
export const FOOTER_HOVER = 'transition duration-200 hover:opacity-50';

/**
 * Meta-row links (copyright, BuildMeta, SpotlightToggle):
 * inherit the surrounding secondary-text color, dim on hover via
 * FOOTER_HOVER, and tint up to primary text color on hover.
 */
export const FOOTER_META_LINK = `text-inherit ${FOOTER_HOVER} hover:text-[var(--color-text-primary)]`;
