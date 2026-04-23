import { createContext } from 'react';

export type SpotlightContextType = {
    enabled: boolean;
    toggleEnabled: () => void;
    setEnabled: (value: boolean) => void;
};

export const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined);
