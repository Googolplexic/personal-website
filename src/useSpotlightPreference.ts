import { useContext } from 'react';
import { SpotlightContext } from './context/SpotlightContext';

export function useSpotlightPreference() {
    const context = useContext(SpotlightContext);
    if (context === undefined) {
        throw new Error('useSpotlightPreference must be used within a SpotlightProvider');
    }
    return context;
}
