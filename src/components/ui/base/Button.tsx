import { ReactNode } from 'react';
import { cn, createVariants } from '../../../utils/styles';
import { patterns } from '../../../theme/design-tokens';

const buttonVariants = createVariants({
    base: patterns.button.base,
    variants: {
        variant: {
            primary: patterns.button.primary,
            secondary: patterns.button.secondary,
            icon: patterns.button.icon,
        },
    },
    defaultVariants: {
        variant: 'primary',
    },
});

export interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'icon';
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    'aria-label'?: string;
}

/**
 * Button - Interactive button component
 * Handles all button interactions with consistent styling
 */
export function Button({
    children,
    variant,
    className,
    onClick,
    type = 'button',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                buttonVariants({ variant }),
                className
            )}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
