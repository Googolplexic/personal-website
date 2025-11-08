import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

export interface FlexProps {
    children: ReactNode;
    direction?: 'row' | 'col';
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    wrap?: boolean;
    gap?: '1' | '2' | '3' | '4' | '6' | '8' | '12';
    className?: string;
}

/**
 * Flex - Flexbox layout component
 * Provides a convenient way to create flex layouts
 */
export function Flex({
    children,
    direction = 'row',
    align,
    justify,
    wrap = false,
    gap,
    className,
    ...props
}: FlexProps) {
    return (
        <div
            className={cn(
                'flex',
                direction === 'col' && 'flex-col',
                align && `items-${align}`,
                justify && `justify-${justify}`,
                wrap && 'flex-wrap',
                gap && `gap-${gap}`,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface StackProps {
    children: ReactNode;
    spacing?: '1' | '2' | '3' | '4' | '6' | '8' | '12';
    className?: string;
}

/**
 * Stack - Vertical stack layout component
 * Convenient shorthand for vertical flex layouts
 */
export function Stack({
    children,
    spacing = '4',
    className,
    ...props
}: StackProps) {
    return (
        <Flex
            direction="col"
            gap={spacing}
            className={className}
            {...props}
        >
            {children}
        </Flex>
    );
}
