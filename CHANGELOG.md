# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
for `package.json`. Site footer versioning follows git tags `vMAJOR.MINOR` plus
commit offset (see `vite.config.ts`).

## [3.1.0] - 2026-10-28

### Added

- Command menu (Ctrl/⌘+K, or the search button in the navbar) to jump to any project, origami piece or page, open the resume or social links, copy a link to the current page, or toggle the spotlight.
- View Transitions: a card's image grows into its detail page and settles back into its card on the way back; other page changes cross-fade.
- Blurred placeholders made at build time, shown while each image loads.
- Lightbox: swipe or drag down to close, drags that can be caught mid-flight, keyboard shortcut hints and bigger tap targets.
- Admin: undo after deleting, renames that show at once, and idempotency keys so a retried request isn't applied twice.

### Changed

- Balanced headline wrapping, no single-word last lines in body text, safe-area padding on notched phones and tabular figures in dates.
- Going back to a listing returns to the same scroll position.
- Images already in the browser cache show at once instead of fading in again.
- Personal Website project: new screenshots and an updated write-up.
- Dropped Lenis; the desktop scroll is no longer animated twice, and the pointer stays hidden while the custom cursor sits still.

### Fixed

- The hero spotlight works before the spotlight toggle is touched.
- Page transitions in Safari and Firefox, and a one-frame flash before them.
- The Ctrl K hint no longer wraps on narrow screens, and closing the command menu no longer leaves the search button highlighted.
- Page changes, image loads and carousels no longer jump; narrow carousel frames are centred and portraits shrink inside a fixed frame.
- Duplicate page URLs redirect to the canonical path.

## [3.0.0] - 2026-10-18

### Added

- Every page is prerendered to HTML at build time (React Router framework mode), so pages paint and get indexed without running JavaScript.
- Exhibit codes on cards ("P·07"), wall-label placards, and an exhibition layout for Featured Works with one lead piece.
- One filter bar for both listings: search, technologies, tags, sort, category and grouped or list view, all kept in the URL so filtered views can be shared.
- Origami pages show the markdown write-up from `info.md` below the details.
- Skip link, visible focus rings, `aria-current` on nav links, a keyboard-operable filter dropdown, and a lightbox that behaves as a modal dialog (focus trap, Escape, focus returns to the photo).
- Images load in 600, 1280 and 2560 px WebP copies picked by screen size; the lightbox uses the 2560 px copy and preloads its neighbours. Images fade in over a placeholder, except the first ones on a page.
- Tests: Vitest unit tests (`pnpm test`) and a Playwright + axe smoke test of the main pages at desktop and phone sizes (`pnpm test:e2e`, after `pnpm build`).
- GitHub Actions CI runs typecheck, lint, unit tests, build and the smoke test on pull requests and `main`.
- `scripts/hash-password.mjs` makes a bcrypt hash for `ADMIN_PASSWORD_HASH`.

### Changed

- React 19, React Router 7, Vite 8, Tailwind 4, TypeScript 6, ESLint 10.
- Dark and gold theme rebuilt on Tailwind theme tokens, a 12-column page grid and a type scale; web fonts are self-hosted.
- Project and origami detail pages share one layout, and Back returns to wherever the visitor came from.
- `pnpm preview` serves the build the way Vercel does, including the `vercel.json` headers and compression.
- Pre-commit hook lints staged files; ESLint adds type-aware rules for unhandled promises, deprecated APIs and thrown values.
- Portfolio and Origami subtitles rewritten; the About text no longer tells phone visitors to try desktop.

### Removed

- The link-preview middleware and `og-page` function; prerendered pages carry their own meta tags.
- The hand-written boot shells in `index.html`.

### Fixed

- Logo links' accessible names include the visible "CL" (WCAG 2.5.3).
- Frontmatter values the admin editor writes in quotes are read without the quotes.

### Security

- `?to=` redirects only to an allowlist of sites; anything else still gets the Rick Roll.
- Admin login accepts a bcrypt hash (`ADMIN_PASSWORD_HASH`), compares plain passwords in constant time, and blocks an IP for 15 minutes after 5 failed attempts.
- The admin API refuses cross-origin requests and drops its CORS headers; uploads are capped at 3 MB.
- Content Security Policy, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` headers on every page.

## [2.6.0] - 2026-08-04

### Added

- Custom cursor morphs into a gallery-style scrollbar thumb at the right edge (dock, drag, idle fade).
- `scroll-locked` flag so lightbox (and similar overlays) disable the custom scrollbar.

### Changed

- Native page scrollbar hidden in favor of the cursor-driven thumb.

## [2.5.0] - 2026-04-23

### Added

- Static RSS 2.0 feeds generated at build time: `/rss.xml`, `/rss-portfolio.xml`, `/rss-origami.xml` (`scripts/generate-rss.js`).
- Feed discovery via `<link rel="alternate" type="application/rss+xml">` in `index.html` and notes in `public/robots.txt`.

[3.1.0]: https://github.com/Googolplexic/personal-website/compare/v3.0...v3.1
[3.0.0]: https://github.com/Googolplexic/personal-website/compare/v2.6...v3.0
[2.6.0]: https://github.com/Googolplexic/personal-website/compare/v2.5...v2.6
[2.5.0]: https://github.com/Googolplexic/personal-website/compare/v2.4...v2.5
