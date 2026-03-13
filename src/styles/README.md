# Styles architecture

This project uses layered, domain-focused CSS modules with explicit import order.

## Order of precedence

1. `foundation/` — Tailwind directives + base theme (`@layer base`)
2. `components/` — reusable component styles (`@layer components`)
3. `utilities/` — utility classes (`@layer utilities`)
4. `tokens/` — unlayered token-like helpers (e.g. category badges)
5. `interactions/` — unlayered interaction systems (e.g. custom cursor)

Root entrypoint: `src/index.css`.

## Editing guidelines

- Keep import order deterministic and intentional.
- Place new styles in the narrowest domain file possible.
- Prefer adding to `components/*` rather than growing a single large file.
- Keep unlayered files only for styles that intentionally override layered classes.
