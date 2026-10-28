import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const ROUTES = ['/', '/portfolio', '/origami', '/portfolio/torgal', '/origami/ryujin-3-5', '/admin'];

/** Collects console errors, uncaught exceptions and CSP violations while a page is open */
function watchForErrors(page: Page) {
    const errors: string[] = [];
    page.on('console', (message) => {
        // A logged-out admin session check answers 401, which the browser logs as an error
        if (message.type() === 'error' && !message.location().url.includes('/api/')) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    return errors;
}

/** Opens a page and waits until it's hydrated; the prerendered HTML ignores input until then */
async function open(page: Page, route: string) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
}

// The preview serves only the static site, so answer the admin API as a logged-out session
test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', (route) => route.fulfill({ status: 401, json: { valid: false } }));
});

for (const route of ROUTES) {
    test(`${route} renders without errors or accessibility violations`, async ({ page }) => {
        const errors = watchForErrors(page);
        const response = await page.goto(route);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
        await expect(page.locator('h1')).toBeVisible();
        await page.waitForLoadState('networkidle');

        const { violations } = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
        expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map(node => node.target.join(' ')).join(', ')}`)).toEqual([]);
        expect(errors).toEqual([]);
    });
}

test('unknown paths get the 404 page', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toBeVisible();
});

test('searching the portfolio filters the cards and updates the URL', async ({ page }) => {
    await open(page, '/portfolio');
    const cards = page.locator('article');
    const total = await cards.count();

    await page.getByLabel('Search', { exact: true }).fill('torgal');
    await expect(page).toHaveURL(/search=torgal/);
    await expect(cards.filter({ hasText: 'Torgal' }).first()).toBeVisible();
    expect(await cards.count()).toBeLessThan(total);
});

test('the lightbox opens, moves to the next image and closes with Escape', async ({ page }) => {
    await open(page, '/origami/ryujin-3-5');
    await page.locator('[aria-haspopup="dialog"]').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const firstSrc = await dialog.locator('img[data-fade]').getAttribute('src');
    await dialog.getByRole('button', { name: 'Next image' }).click();
    await expect(dialog.locator('img[data-fade]')).not.toHaveAttribute('src', firstSrc ?? '');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
});

test('the command menu opens with the shortcut, finds a piece and goes to it', async ({ page }) => {
    await open(page, '/portfolio');
    await page.keyboard.press('ControlOrMeta+k');
    const menu = page.getByRole('dialog', { name: 'Search the site' });
    await expect(menu).toBeVisible();
    // Contrast is checked once the fade-in has finished
    await menu.evaluate((dialog) =>
        Promise.all(dialog.getAnimations({ subtree: true }).map((animation: { finished: Promise<unknown> }) => animation.finished)),
    );

    const { violations } = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations.map(({ id }) => id)).toEqual([]);

    await page.keyboard.type('ryujin');
    await expect(menu.getByRole('option', { name: /Ryujin/ })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/origami\/ryujin-3-5$/);
    await expect(menu).toBeHidden();
});

test.describe('?to= redirects', () => {
    for (const [to, expected] of [
        ['https://github.com/Googolplexic', 'https://github.com/Googolplexic'],
        ['https://evil.example/phish', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ]) {
        test(`${to} goes to ${new URL(expected).hostname}`, async ({ page }) => {
            await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
            const leaving = page.waitForRequest((request) => request.isNavigationRequest() && !request.url().includes('localhost'));
            await page.goto(`/?to=${encodeURIComponent(to)}`);
            expect((await leaving).url()).toBe(expected);
        });
    }
});
