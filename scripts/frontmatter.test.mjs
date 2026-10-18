import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from './frontmatter.mjs';

describe('parseFrontmatter', () => {
    it('reads values, lists and the body', () => {
        const raw = '---\ntitle: Torgal\nstartDate: 2026-01\ntags:\n- ai\n  - hackathon\n---\n\n## Heading\n';
        expect(parseFrontmatter(raw)).toEqual({
            attributes: { title: 'Torgal', startDate: '2026-01', tags: ['ai', 'hackathon'] },
            body: '## Heading\n',
        });
    });

    it('handles Windows line endings', () => {
        const raw = '---\r\ntitle: Crane\r\nkeywords:\r\n- paper\r\n---\r\nBody\r\n';
        expect(parseFrontmatter(raw)).toEqual({ attributes: { title: 'Crane', keywords: ['paper'] }, body: 'Body\r\n' });
    });

    it('unquotes the JSON strings the admin editor writes and YAML single quotes', () => {
        const raw = `---\ntitle: "Say \\"hi\\": a test"\ndesigner: 'Robert J. Lang'\nnote: 'it''s'\ntags:\n- "a, b"\n---\n`;
        expect(parseFrontmatter(raw).attributes).toEqual({
            title: 'Say "hi": a test', designer: 'Robert J. Lang', note: "it's", tags: ['a, b'],
        });
    });

    it('keeps colons inside values', () => {
        expect(parseFrontmatter('---\nliveUrl: https://example.com\n---\n').attributes).toEqual({ liveUrl: 'https://example.com' });
    });

    it('treats a key with no value as an empty list', () => {
        expect(parseFrontmatter('---\ntags:\n---\n').attributes).toEqual({ tags: [] });
    });

    it('returns the whole file as the body when there is no frontmatter', () => {
        expect(parseFrontmatter('# Just markdown\n')).toEqual({ attributes: {}, body: '# Just markdown\n' });
    });
});
