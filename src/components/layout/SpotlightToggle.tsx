import { useSpotlightPreference } from '../../useSpotlightPreference';
import { FrameButton } from '../ui/FrameButton';

/** Turns the gallery lighting on and off; the label states the current setting. */
export function SpotlightToggle() {
    const { enabled, toggleEnabled } = useSpotlightPreference();

    return (
        <FrameButton size="compact" onClick={toggleEnabled}>
            Spotlight · {enabled ? 'On' : 'Off'}
        </FrameButton>
    );
}
