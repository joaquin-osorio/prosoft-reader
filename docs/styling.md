# Styling: Tailwind CSS + shadcn/ui

## Tailwind CSS v4

- Loaded through the `@tailwindcss/vite` plugin (`vite.config.ts`). There is no `tailwind.config.*` or PostCSS config: v4 is configured CSS-first.
- `src/index.css` is the single global stylesheet. It imports Tailwind, `tw-animate-css`, `shadcn/tailwind.css` and the Geist font, then defines the theme.
- Theme tokens (`--background`, `--primary`, `--radius`, …) are CSS variables in `:root` / `.dark`, mapped to Tailwind utilities in the `@theme inline` block (e.g. `--color-primary` → `bg-primary`). Change colors there, not in components.
- Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`): add the `dark` class to an ancestor (normally `<html>`). It does **not** follow `prefers-color-scheme` on its own; nothing toggles it yet.

## shadcn/ui

- Config: `components.json`. Style `base-nova` (Base UI primitives via `@base-ui/react`, not Radix), base color `neutral`, icons from `lucide-react`.
- Add components with `npx shadcn@latest add <name>`. They are generated into `src/components/ui/` and are owned by this repo — edit them freely.
- `cn()` (class merging) is re-exported from `src/lib/utils.ts`; generated components import it from the `cn` package directly.
- `src/components/ui/**` has `react-refresh/only-export-components` disabled in `eslint.config.js`, because shadcn components export variant helpers (`buttonVariants`, …) that other components import. Keep app components out of that folder so they stay covered by the rule.

## Import alias

`@/*` → `src/*`, declared in `tsconfig.json` (read by the shadcn CLI), `tsconfig.app.json` (typecheck) and `vite.config.ts` (bundling). Keep all three in sync. No `baseUrl`: it is deprecated in TypeScript 6 and `paths` resolves relative to the tsconfig without it.
