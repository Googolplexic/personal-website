# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
for `package.json`. Site footer versioning follows git tags `vMAJOR.MINOR` plus
commit offset (see `vite.config.ts`).

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

[2.6.0]: https://github.com/Googolplexic/personal-website/compare/v2.5...v2.6
[2.5.0]: https://github.com/Googolplexic/personal-website/compare/v2.4...v2.5
