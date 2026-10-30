import { ReactNode, Children, useSyncExternalStore } from 'react';
import { useSpotlight } from '../../utils/useSpotlight';
import { useScrollProximity } from '../../utils/useScrollProximity';
import { useStaggeredEntrance } from '../../utils/useStaggeredEntrance';

interface MasonrySpotlightGridProps {
    children: ReactNode;
    className?: string;
    /** Number of items to show immediately (no stagger) for LCP */
    skipCount?: number;
    /** Caps the column count, for grids that share the row with a side label */
    maxColumns?: 2 | 3;
    /** False when a parent already lights this grid, so two spotlights don't fight */
    spotlight?: boolean;
}

/* ── responsive column count; breakpoints match .masonry-static ── */
const BREAKPOINTS = [
    { minWidth: 1024, cols: 3 },
    { minWidth: 640, cols: 2 },
] as const;

function getColumnCount(): number {
    for (const bp of BREAKPOINTS) {
        if (window.innerWidth >= bp.minWidth) return bp.cols;
    }
    return 1;
}

function subscribeToResize(cb: () => void) {
    window.addEventListener('resize', cb);
    return () => window.removeEventListener('resize', cb);
}

/** Null while prerendering and hydrating, since the viewport width is unknown there. */
function useColumnCount(): number | null {
    return useSyncExternalStore(subscribeToResize, getColumnCount, () => null);
}

/**
 * Masonry layout with mouse-following spotlight.
 * Distributes children round-robin across columns so visual order
 * reads left-to-right, row-by-row instead of column-by-column.
 * On mobile/touch devices, uses scroll-proximity dimming instead.
 */
export function MasonrySpotlightGrid({ children, className = '', skipCount = 0, maxColumns = 3, spotlight = true }: MasonrySpotlightGridProps) {
    const { ref, onMouseMove, onMouseEnter, onMouseLeave } = useSpotlight(spotlight);
    const viewportColumns = useColumnCount();
    const colCount = viewportColumns === null ? null : Math.min(viewportColumns, maxColumns);
    useScrollProximity(ref, spotlight);
    useStaggeredEntrance(ref, 80, skipCount, colCount);

    const items = Children.toArray(children);

    // Distribute items round-robin so row order is preserved
    const columnTotal = colCount ?? 1;
    const columns: ReactNode[][] = Array.from({ length: columnTotal }, () => []);
    const indices: number[][] = Array.from({ length: columnTotal }, () => []);
    items.forEach((child, i) => {
        columns[i % columnTotal].push(child);
        indices[i % columnTotal].push(i);
    });

    return (
        <div
            ref={ref}
            onMouseMove={spotlight ? onMouseMove : undefined}
            onMouseEnter={spotlight ? onMouseEnter : undefined}
            onMouseLeave={spotlight ? onMouseLeave : undefined}
            className={spotlight ? `spotlight-group ${className}` : className}
        >
            {colCount === null ? (
                // Same columns as the masonry layout, so the first row doesn't move once it takes over
                <div className={maxColumns === 2 ? 'masonry-static masonry-static-max-2' : 'masonry-static'}>
                    {items.map((child, i) => (
                        <div key={i} data-stagger-index={i}>{child}</div>
                    ))}
                </div>
            ) : (
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
            )}
        </div>
    );
}
