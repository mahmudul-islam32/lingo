# ADR-004: Design tokens and shared UI primitives

- **Status:** Accepted
- **Date:** 2026-11-07
- **Ticket:** CTO-004
- **Decider:** cto

## Context

Every feature ticket needs the same buttons, cards, progress bar, dialog and toast, and
the brand (PD-001: midnight indigo + amber/gold, warm off-white, functional
correct/incorrect colours separate from the brand) has to be applied consistently with
WCAG AA contrast. Feature code must never contain colour literals (PLT-001 criterion 12).

## Decisions

1. **Tokens are Tailwind v4 theme variables** in `src/components/ui/tokens.css`
   (imported by `src/app/globals.css`). Raw brand scales `night-50…950` (indigo) and
   `glow-50…900` (amber); semantic tokens `canvas`, `surface`, `surface-raised`, `fg`,
   `fg-muted`, `border`, `border-strong`, `primary`, `primary-hover`, `on-primary`,
   `focus`, `progress`, `xp`, `heart`, `backdrop`, and the functional feedback set
   `success`, `success-hover`, `on-success`, `success-soft`, `success-fg`, `danger`,
   `danger-hover`, `on-danger`, `danger-soft`, `danger-fg`. Use them as classes
   (`bg-canvas`, `text-fg`, `bg-success-soft text-success-fg` …).
2. **Dark-first.** The default values are the dark theme (midnight indigo canvas, warm
   off-white text, amber primary). `data-theme="light"` on `<html>` (or any subtree)
   switches to the warm off-white light theme by overriding the same variables, so
   components never branch on the theme. The PM's UX notes that mention "white cards,
   indigo text" map to `bg-surface text-fg` and render correctly in both themes. Which
   theme the app ships by default (or a user setting) can be changed by dev-platform in
   the root layout without touching components.
3. **Contrast is tested, not eyeballed.** `src/components/ui/__tests__/tokens.test.ts`
   parses `tokens.css` and asserts ≥ 4.5:1 for every text pair and ≥ 3:1 for focus ring,
   control borders, hearts and progress fill, in both themes, and that feedback colours
   are not brand colours. Changing a token that breaks AA fails CI.
4. **Primitives** live in `src/components/ui` and are exported from `@/components/ui`:
   `Button`, `IconButton`, `Card`, `ProgressBar`, `Dialog` (alias `Modal`), `Toast` /
   `ToastProvider` / `useToast`, `HeartIcon`, `XpBadge`, `Skeleton`, `Spinner`,
   `VisuallyHidden`, icons (`CheckIcon`, `CrossIcon`, `CloseIcon`, `BoltIcon`), `cn()`,
   `BRAND_HEX`. They are presentational (no stores, no data access), use native elements
   (`<button>`), and accept `ref` as a prop (React 19).
5. **Motion without a library.** CSS animations (`animate-slide-up`, `animate-fade-in`,
   `animate-shake`, Tailwind `animate-spin/pulse`) are always applied through the
   `motion-safe:` variant, so `prefers-reduced-motion: reduce` disables them. Framer
   Motion stays allowed for features that need layout/exit animations (via `LazyMotion`
   - `useReducedMotion`), but the primitives don't pull it into every route.
6. **Dialog is a custom accessible modal** (portal, `aria-modal`, Tab trap, Escape,
   scroll lock, focus restore) rather than native `<dialog>`, because jsdom (our unit
   test environment) doesn't implement `showModal()` reliably and we need the same
   behaviour in tests and browsers.
7. **`cn()` = clsx + tailwind-merge** (extended with the `focus-ring` utility), so
   `className` overrides on primitives work predictably.

## Alternatives considered

- **Light theme by default** (closer to the PM UX notes): kept as a supported theme; dark
  is the default because the lantern/glow identity reads best on midnight indigo and it
  was the orchestrator's direction. Reversible in one attribute.
- **A component library (Radix, Headless UI):** robust, but adds weight and another API
  to learn for five small components. Revisit if we need comboboxes/menus.
- **CSS-in-JS / design-token JSON pipeline:** unnecessary with Tailwind v4 theme variables.

## Consequences

- Features use only tokens; review greps new files for hex/rgb literals.
- The manifest and `<meta name="theme-color">` read `BRAND_HEX` (tested against the CSS).
- Changing an existing primitive requires a note in the PR description (`CLAUDE.md`).
- No `/dev/ui` preview route yet (it would live in dev-platform's `src/app`); the unit
  tests document usage. Can be added later by dev-platform.
