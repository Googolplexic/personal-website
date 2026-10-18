# Styles architecture

This project uses layered, domain-focused CSS modules with explicit import order.

## Order of precedence

1. `foundation/` — Tailwind import, `@theme` tokens, self-hosted fonts, base theme (`@layer base`)
2. `components/` — reusable component styles (`@layer components`)
3. `utilities/` — layout helpers and custom `@utility` classes such as `link-underline`
4. `interactions/` — unlayered interaction systems (e.g. custom cursor)

Root entrypoint: `src/index.css`.

## Tokens

Colors and easing live in `foundation/tailwind.css` under `@theme static`, so each one is both a
CSS variable (`var(--color-gold)`) and a utility (`text-gold`, `bg-canvas`, `border-line`).
Prefer the utility in TSX. Layout sizes the CSS depends on (spotlight radius, masonry gap, nav
glass) are plain variables in `foundation/base.css`.

## Editing guidelines

- Keep import order deterministic and intentional.
- Place new styles in the narrowest domain file possible.
- Prefer adding to `components/*` rather than growing a single large file.
- Keep unlayered files only for styles that intentionally override layered classes.
- Text links use `link-underline`; titles inside a hoverable card use `group-hover:text-gold`.
