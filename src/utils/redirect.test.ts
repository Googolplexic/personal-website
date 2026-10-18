import { describe, expect, it } from 'vitest';
import { RICK_ROLL, redirectTarget } from './redirect';

describe('redirectTarget', () => {
    it.each([
        'https://github.com/Googolplexic',
        'https://www.linkedin.com/in/colemanlai',
        'https://www.colemanlai.com/portfolio',
        'https://youtu.be/abc',
        'http://instagram.com/x',
    ])('lets %s through', (to) => {
        expect(redirectTarget(to)).toBe(new URL(to).href);
    });

    it.each([
        ['another site', 'https://evil.example'],
        ['a look-alike domain', 'https://notgithub.com'],
        ['an allowed name used as a subdomain', 'https://github.com.evil.example'],
        ['a javascript: link', 'javascript:alert(1)'],
        ['a data: link', 'data:text/html,hi'],
        ['a relative path', '/portfolio'],
        ['nothing', ''],
    ])('sends %s to the Rick Roll', (_, to) => {
        expect(redirectTarget(to)).toBe(RICK_ROLL);
    });

    it('ignores host case', () => {
        expect(redirectTarget('https://GitHub.com/x')).toBe('https://github.com/x');
    });
});
