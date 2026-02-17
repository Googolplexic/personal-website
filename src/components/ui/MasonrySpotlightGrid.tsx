import { ReactNode } from 'react';
import { useSpotlight } from '../../utils/useSpotlight';
import { useScrollProximity } from '../../utils/useScrollProximity';

interface MasonrySpotlightGridProps {
    children: ReactNode;
    className?: string;
}

/**
 * Masonry layout with mouse-following spotlight.
 * Uses CSS columns for the mosaic effect and tracks
 * the cursor to position a radial-gradient follow-spot.
 * On mobile/touch devices, uses scroll-proximity dimming instead.
 */
export function MasonrySpotlightGrid({ children, className = '' }: MasonrySpotlightGridProps) {
    const { ref, onMouseMove, onMouseEnter, onMouseLeave } = useSpotlight();
    useScrollProximity(ref);

    return (
        <div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`spotlight-group ${className}`}
        >
            <div className="masonry-grid">
                {children}
            </div>
        </div>
    );
}
