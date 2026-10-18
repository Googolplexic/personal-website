import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { cn } from '../../utils/styles';

interface FrameButtonProps {
    children: ReactNode;
    /** Internal route; renders a router link */
    to?: string;
    /** External URL; renders an anchor that opens in a new tab */
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    type?: 'button' | 'submit';
    /** Selected state for toggles and filters; announced through aria-pressed */
    active?: boolean;
    disabled?: boolean;
    /** compact: tighter padding for rows of filters; the touch target stays 44px tall */
    size?: 'regular' | 'compact';
    'aria-label'?: string;
    className?: string;
}

/**
 * FrameButton - square control with a hairline frame, the site's one button style.
 */
export function FrameButton({ children, to, href, onClick, type = 'button', active, disabled, size = 'regular', className, ...aria }: FrameButtonProps) {
    const classes = cn(
        // border-solid: base.css hides button borders unless a style is set
        'inline-flex items-center justify-center gap-2 min-h-11 py-0 border border-solid whitespace-nowrap',
        size === 'compact' ? 'px-3.5' : 'px-5',
        'font-body text-xs uppercase tracking-[0.15em] no-underline transition-colors duration-300',
        'disabled:opacity-40 disabled:pointer-events-none',
        active ? 'border-gold text-gold' : 'border-line-strong text-ink-muted hover:border-gold hover:text-gold',
        className,
    );

    if (to) {
        return <RouterLink to={to} onClick={onClick} className={classes} {...aria}>{children}</RouterLink>;
    }
    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={classes} {...aria}>{children}</a>;
    }
    return (
        <button type={type} onClick={onClick} disabled={disabled} aria-pressed={active} className={classes} {...aria}>
            {children}
        </button>
    );
}
