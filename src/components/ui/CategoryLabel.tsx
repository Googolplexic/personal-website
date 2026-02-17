import { cn } from '../../utils/styles';

interface CategoryLabelProps {
    label: string;
    color?: string;
    className?: string;
}

export function CategoryLabel({ label, className = "" }: CategoryLabelProps) {
    return (
        <div className={cn('flex justify-center', className)}>
            <span className="text-xs font-body tracking-[0.15em] uppercase"
                  style={{ color: 'var(--color-text-tertiary)' }}>
                {label}
            </span>
        </div>
    );
}
