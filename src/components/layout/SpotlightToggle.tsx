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
            aria-label={enabled ? 'Disable spotlight effects' : 'Enable spotlight effects'}
            className={FOOTER_META_LINK}
            style={{
                background: 'none',
                border: 'none',
                padding: 0,
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
