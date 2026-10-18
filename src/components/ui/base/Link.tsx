import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { cn } from '../../../utils/styles';

export interface LinkProps {
    children: ReactNode;
    to?: string;
    href?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    target?: string;
    rel?: string;
}

/**
 * Link - Gold text link for prose
 * Handles both internal (React Router) and external links
 */
export function Link({
    children,
    to,
    href,
    className,
    style,
    onClick,
    target,
    rel,
    ...props
}: LinkProps) {
    const classes = cn('link-underline text-gold', className);

    if (to) {
        return (
            <RouterLink
                to={to}
                className={classes}
                style={style}
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
            style={style}
            onClick={onClick}
            target={target}
            rel={rel}
            {...props}
        >
            {children}
        </a>
    );
}
