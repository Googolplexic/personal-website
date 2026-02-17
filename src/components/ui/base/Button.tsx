import { ReactNode } from 'react';
import { cn } from '../../../utils/styles';

const baseStyle = 'transition-all duration-300 no-underline font-body cursor-pointer';

const variantStyles: Record<string, string> = {
    primary: 'bg-transparent border-b border-b-[var(--color-accent)] border-t-0 border-x-0 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] px-1 pb-1 pt-0 text-xs tracking-[0.15em] uppercase',
    secondary: 'bg-transparent border-b border-b-[var(--color-border)] border-t-0 border-x-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-b-[var(--color-text-primary)] px-1 pb-1 pt-0 text-xs tracking-[0.15em] uppercase',
    icon: 'p-2 border-none focus:outline-none hover:opacity-70 active:opacity-60',
};

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
 */
export function Button({
    children,
    variant = 'primary',
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
                baseStyle,
                variantStyles[variant],
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
