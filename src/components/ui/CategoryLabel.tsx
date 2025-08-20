interface CategoryLabelProps {
    label: string;
    color: string;
    className?: string;
}

export function CategoryLabel({ label, color, className = "" }: CategoryLabelProps) {
    return (
        <div className={`flex justify-center ${className}`}>
            <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full ${color} shadow-sm`}>
                {label}
            </span>
        </div>
    );
}
