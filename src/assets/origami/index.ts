import { testDesign } from './test';
import { OrigamiProps } from '../../types';
import myDesigns from './my-designs';
import otherDesigns from './other-designs';

// Combine both my designs and other designs
const allOrigami: OrigamiProps[] = [
    ...myDesigns,
    ...otherDesigns
];

// Sort by date (most recent first)
const getMostRecentDate = (origami: OrigamiProps) => new Date(origami.date || origami.startDate || Date.now());
allOrigami.sort((a, b) => {
    const dateA = getMostRecentDate(a);
    const dateB = getMostRecentDate(b);
    return dateB.getTime() - dateA.getTime();
});

export default allOrigami;
export { myDesigns, otherDesigns };

export const origami: OrigamiDesign[] = [
  testDesign
];