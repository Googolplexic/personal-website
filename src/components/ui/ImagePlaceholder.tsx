import type { CSSProperties } from 'react';
import type { ImageSet } from '../../types';
import { blurredPlaceholderUrl } from '../../utils/imagePlaceholder';
import { cn } from '../../utils/styles';

interface ImagePlaceholderProps {
    set?: ImageSet;
    /** Match the image's object-fit */
    fit?: 'cover' | 'contain';
    className?: string;
    style?: CSSProperties;
}

/**
 * The blurred copy of an image, shown until the real one loads (motion.css fades it out).
 * Goes directly before the <img>, which must be positioned so it paints on top.
 */
export function ImagePlaceholder({ set, fit = 'cover', className, style }: ImagePlaceholderProps) {
    if (!set?.placeholder) return null;
    return (
        <span
            aria-hidden="true"
            data-placeholder
            className={cn('absolute inset-0 pointer-events-none bg-center bg-no-repeat', className)}
            style={{ backgroundImage: `url("${blurredPlaceholderUrl(set)}")`, backgroundSize: fit, ...style }}
        />
    );
}
