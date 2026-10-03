import { useSpotlightPreference } from '../../useSpotlightPreference';
import { FOOTER_META_LINK } from './footerStyles';

/**
 * Subtle text toggle that matches the Footer's other meta links
 * (copyright line, BuildMeta): inherits the surrounding secondary-text
 * color and eases up to primary on hover.
 *
 * Uses the shared FOOTER_META_LINK class for consistent hover behavior
 * with every other element in the footer.
 */
export function SpotlightToggle() {
    const { enabled, toggleEnabled } = useSpotlightPreference();

    return (
        <button
            type="button"
            onClick={toggleEnabled}
            className={`${FOOTER_META_LINK} inline-flex items-center min-h-8 px-3`}
            style={{
                background: 'none',
                border: 'none',
                font: 'inherit',
                letterSpacing: 'inherit',
                textTransform: 'inherit',
                cursor: 'pointer',
            }}
        >
            Spotlight · {enabled ? 'On' : 'Off'}
        </button>
    );
}
