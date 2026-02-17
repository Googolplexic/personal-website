import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

const variantStyles: Record<string, string> = {
    default: '',
    interactive: 'spotlight-item cursor-pointer',
};

const paddingStyles: Record<string, string> = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'lg:p-10 p-6',
};

export interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'interactive';
    padding?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * Card - Container component with shadow-based elevation
 */
export function Card({
    children,
    variant = 'default',
    padding = 'md',
    className,
    onClick,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                variantStyles[variant],
                paddingStyles[padding],
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}
