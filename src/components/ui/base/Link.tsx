import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '../../../utils/styles';

const variantStyles: Record<string, string> = {
    primary: 'font-medium underline-offset-4 hover:underline transition-colors',
    nav: 'nav-link-gallery',
    default: 'transition-colors hover:opacity-80',
};

export interface LinkProps {
    children: ReactNode;
    to?: string;
    href?: string;
    variant?: 'primary' | 'nav' | 'default';
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    target?: string;
    rel?: string;
}

/**
 * Link - Navigation and anchor link component
 * Handles both internal (React Router) and external links
 */
export function Link({
    children,
    to,
    href,
    variant,
    className,
    style,
    onClick,
    target,
    rel,
    ...props
}: LinkProps) {
    const classes = cn(variantStyles[variant || 'default'], className);
    const linkStyle = { color: 'var(--color-accent-text)', ...style };

    if (to) {
        return (
            <RouterLink
                to={to}
                className={classes}
                style={linkStyle}
                onClick={onClick}
                {...props}
            >
                {children}
            </RouterLink>
        );
    }

    return (
        <a
            href={href}
            className={classes}
            style={linkStyle}
            onClick={onClick}
            target={target}
            rel={rel}
            {...props}
        >
            {children}
        </a>
    );
}
