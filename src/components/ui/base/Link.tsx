import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { cn, createVariants } from '../../../utils/styles';
import { patterns } from '../../../theme/design-tokens';

const linkVariants = createVariants({
    base: '',
    variants: {
        variant: {
            primary: patterns.link.primary,
            nav: patterns.link.nav,
            default: '',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export interface LinkProps {
    children: ReactNode;
    to?: string;
    href?: string;
    variant?: 'primary' | 'nav' | 'default';
    className?: string;
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
    onClick,
    target,
    rel,
    ...props
}: LinkProps) {
    const classes = cn(linkVariants({ variant }), className);

    // Internal link using React Router
    if (to) {
        return (
            <RouterLink
                to={to}
                className={classes}
                onClick={onClick}
                {...props}
            >
                {children}
            </RouterLink>
        );
    }

    // External link
    return (
        <a
            href={href}
            className={classes}
            onClick={onClick}
            target={target}
            rel={rel}
            {...props}
        >
            {children}
        </a>
    );
}
