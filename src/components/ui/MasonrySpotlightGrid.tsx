import { ReactNode, Children, useSyncExternalStore } from 'react';
import { useSpotlight } from '../../utils/useSpotlight';
import { useScrollProximity } from '../../utils/useScrollProximity';
import { useStaggeredEntrance } from '../../utils/useStaggeredEntrance';

interface MasonrySpotlightGridProps {
    children: ReactNode;
    className?: string;
    /** Number of items to show immediately (no stagger) for LCP */
    skipCount?: number;
}

/* ── responsive column count (SSR-safe) ── */
const BREAKPOINTS = [
    { minWidth: 1024, cols: 3 },
    { minWidth: 640, cols: 2 },
] as const;

function getColumnCount() {
    if (typeof window === 'undefined') return 1;
    for (const bp of BREAKPOINTS) {
        if (window.innerWidth >= bp.minWidth) return bp.cols;
    }
    return 1;
}

function subscribeToResize(cb: () => void) {
    window.addEventListener('resize', cb);
    return () => window.removeEventListener('resize', cb);
}

function useColumnCount() {
    return useSyncExternalStore(subscribeToResize, getColumnCount, () => 1);
}

/**
 * Masonry layout with mouse-following spotlight.
 * Distributes children round-robin across columns so visual order
 * reads left-to-right, row-by-row instead of column-by-column.
 * On mobile/touch devices, uses scroll-proximity dimming instead.
 */
export function MasonrySpotlightGrid({ children, className = '', skipCount = 0 }: MasonrySpotlightGridProps) {
    const { ref, onMouseMove, onMouseEnter, onMouseLeave } = useSpotlight();
    useScrollProximity(ref);
    useStaggeredEntrance(ref, 80, skipCount);

    const colCount = useColumnCount();
    const items = Children.toArray(children);

    // Distribute items round-robin so row order is preserved
    const columns: ReactNode[][] = Array.from({ length: colCount }, () => []);
    const indices: number[][] = Array.from({ length: colCount }, () => []);
    items.forEach((child, i) => {
        columns[i % colCount].push(child);
        indices[i % colCount].push(i);
    });

    return (
        <div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`spotlight-group ${className}`}
        >
            <div className="masonry-grid">
                {columns.map((col, colIdx) => (
                    <div key={colIdx} className="masonry-col">
                        {col.map((child, rowIdx) => (
                            <div key={indices[colIdx][rowIdx]} data-stagger-index={indices[colIdx][rowIdx]}>
                                {child}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
