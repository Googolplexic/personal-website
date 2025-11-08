import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

export interface BoxProps {
    children: ReactNode;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * Box - The most primitive layout component
 * A flexible container that can be rendered as any HTML element
 */
export function Box({
    children,
    className,
    as: Component = 'div',
    onClick,
    ...props
}: BoxProps) {
    return (
        <Component
            className={cn(className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </Component>
    );
}
