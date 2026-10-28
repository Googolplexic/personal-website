import { describe, expect, it } from 'vitest';
import { matchScore } from './searchIndex';

describe('matchScore', () => {
    it('matches everything when the query is empty', () => {
        expect(matchScore('  ', 'Ryujin 3.5')).toBe(1);
    });

    it('ranks a title prefix above a word prefix above a substring above a keyword-only match', () => {
        expect(matchScore('ryu', 'Ryujin 3.5')).toBe(4);
        expect(matchScore('tact', 'Bladed Tactician')).toBe(3);
        expect(matchScore('acti', 'Bladed Tactician')).toBe(2);
        expect(matchScore('react', 'Personal Website', 'React TypeScript')).toBe(1);
    });

    it('needs every word to appear, in any order', () => {
        expect(matchScore('typescript personal', 'Personal Website', 'React TypeScript')).toBeGreaterThan(0);
        expect(matchScore('python personal', 'Personal Website', 'React TypeScript')).toBe(0);
    });

    it('ignores case and accents', () => {
        expect(matchScore('RESUME', 'Résumé')).toBe(4);
    });
});
