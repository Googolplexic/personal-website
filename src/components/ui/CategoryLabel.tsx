import { Pill } from './base';
import { cn } from '../../utils/styles';

interface CategoryLabelProps {
    label: string;
    color: string;
    className?: string;
}

export function CategoryLabel({ label, color, className = "" }: CategoryLabelProps) {
    return (
        <div className={cn('flex justify-center', className)}>
            <Pill variant="custom" color={`${color} shadow-sm`} className="py-1.5 text-xs font-semibold">
                {label}
            </Pill>
        </div>
    );
}
