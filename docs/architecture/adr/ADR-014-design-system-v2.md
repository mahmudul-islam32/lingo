# ADR-014: Design system v2 (light theme, new tokens, fonts and shared components)

- **Status:** Accepted
- **Date:** 2026-11-19
- **Ticket:** CTO-016; screen restyles follow in dev-platform, dev-lessons and dev-gamification
- **Decider:** cto (owner design brief)
- **Supersedes in part:** [ADR-004](ADR-004-design-tokens-ui-primitives.md) (palette, dark-first theme)
- **Reference:** [`docs/design/v2/`](../../design/v2/BRIEF.md): owner brief, 8 screen renders
  (`screen-N.png`) and the extracted markup with exact inline styles (`screen-N.html`)

## Context

The owner supplied a new visual design for the whole app (8 phone screens, 390 × 874): a
light, flat-with-depth look with an indigo primary, a coral accent, XP gold, "3D" solid
bottom shadows and two Google fonts. The design's brand name and logo are not used:
Polyglow and Lumi stay. Dark mode is dropped for now (PD-066).

v1 (ADR-004) was dark-first (midnight indigo + amber) with a `data-theme="light"`
override. Around 150 feature call sites use the v1 token names (`bg-surface`, `text-fg`,
`text-fg-muted`, `border-border-strong`, `bg-primary text-on-primary`, `night-*`, `glow-*` …),
so renaming tokens would break every feature at once.

## Decision

### 1. One light theme, v1 names kept, values remapped

`src/components/ui/tokens.css` has a single `@theme static` block; there is no
`[data-theme]` override and `color-scheme` is `light`. Every v1 token name still exists
with a v2 value, so features compile and render in the new palette before their restyle:

| Role               | Tokens (v1 names kept, **v2 additions in bold**)                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas / surfaces  | `canvas` #F6F7FB, `surface` #FFF, `surface-raised` #F1F2F8                                                                                                                                                                                          |
| Text               | `fg` #1B1D2A, `fg-muted` #5B6070, **`fg-subtle`** #7A7F92 (non-text / large only), **`eyebrow`** #6D28D9                                                                                                                                            |
| Borders            | `border` #E3E5EE, **`border-muted`** #CDD0DD, `border-strong` #7A7F92 (3:1 control outline), **`track`** #E3E5EE                                                                                                                                    |
| Primary (indigo)   | `primary` #4338CA, `primary-hover` #3730A3, **`primary-edge`** #312E81, `on-primary` #FFF, **`primary-soft`** #E0E7FF, **`primary-tint`** #EEF2FF, **`primary-ring`** #C7D2FE, **`primary-fg`** #3730A3, `focus` #4338CA, `progress` #4338CA        |
| **Accent (coral)** | **`accent`** #F05E3C, **`accent-edge`** / **`accent-strong`** #C2410C, **`on-accent`**, **`accent-soft`** #FDE7DF, **`accent-tint`** #FFF1EC, **`accent-fg`** #9A3412                                                                               |
| XP                 | `xp` #8A6200 (text), **`xp-gold`** #F5B400 (fill/icon), **`xp-edge`** #D99A00, **`xp-soft`** #FEF3C7, **`on-xp-gold`** #3D2B00                                                                                                                      |
| Success            | `success` #15803D, `success-hover`, **`success-edge`**, `on-success`, `success-soft` #DCFCE7, **`success-border`** #BBF7D0, `success-fg` #14532D                                                                                                    |
| Error              | `danger` #B91C1C, `danger-hover`, **`danger-edge`** #7F1D1D, `on-danger`, `danger-soft` #FEE2E2, **`danger-tint`** #FFF5F5, **`danger-border`** #FCA5A5, `danger-fg` #7F1D1D                                                                        |
| Hearts             | `heart` #F43F5E (icon), **`heart-fg`** #BE123C (count text)                                                                                                                                                                                         |
| **Disabled**       | **`disabled`** #E3E5EE, **`on-disabled`** #5B6070                                                                                                                                                                                                   |
| Scales             | `night-50…950` = indigo (600 = primary), `glow-50…900` = XP gold / Lumi's lantern, **`coral-50…700`**, **`pink-soft` / `pink-fg`** (chip tone)                                                                                                      |
| Radii              | `rounded-card` / `rounded-control` 16 px, **`rounded-chip`** 12 px, **`rounded-tile`** 18 px, **`rounded-banner`** 20 px                                                                                                                            |
| **3D shadows**     | `shadow-3d-card` (0 3px 0 #E3E5EE), `-neutral`, `-primary` (0 4px 0 #312E81), `-soft`, `-success`, `-danger`, each with a `-pressed` twin; `shadow-3d-node` (0 6px 0 #312E81), `-node-locked`, `-node-current` (coral halo); `shadow-ring-selected` |
| Utilities          | `focus-ring` (3 px indigo outline), **`eyebrow`** (13 px uppercase label)                                                                                                                                                                           |

Pressed state everywhere: `translate-y-0.5` (2 px) plus the `-pressed` shadow. Shadows
never blur. `cn()` knows the custom shadow and radius names, so conflicts resolve.

### 2. Contrast is tested, two deliberate deviations from the brief

`tokens.test.ts` checks every text pair the components use at 4.5:1 and non-text UI
(focus ring, control outlines, hearts, progress fills against the track, the coral node)
at 3:1.

- **Coral `#F2613F` → `#F05E3C`.** The brief's coral is 2.99:1 on the canvas; one notch
  darker reaches 3.08:1 and is visually identical. White on coral is 3.3:1, so coral
  carries icons and large text only; coral TEXT uses `accent-fg` / `accent-strong`.
- **`border-strong` stays a 3:1 outline (#7A7F92)** for controls whose boundary matters
  (text inputs, radio circles). The brief's "strong border" #CDD0DD is `border-muted`
  (decorative, and the locked-node edge).
- XP gold `#F5B400` is never text (1.8:1 on white): XP text is `xp` #8A6200 (5.5:1), as in
  the design's top bar.

### 3. Fonts via `next/font/google`, self-hosted at build

`src/app/layout.tsx` loads **Bricolage Grotesque** (700, 800) as `--font-bricolage` and
**DM Sans** (400, 500, 700) as `--font-dm-sans` on `<html>`. tokens.css maps them to the
Tailwind families `font-display` and `font-body` (and `font-sans`, the default), and
`h1–h3` default to `font-display`. Both fonts are OFL; `next/font` downloads them at build
time and serves them from `/_next/static/media` (no runtime Google request, works
offline once precached). Builds therefore need network access to Google Fonts; if a
build environment is offline, switch to `next/font/local` with the files under
`src/app/fonts/` (OFL text included).

### 4. Shared components restyled, APIs backward compatible

Every existing prop and default keeps working; additions are optional.

- **Button:** primary indigo + `shadow-3d-primary` + pressed translate; `secondary` white
  with border and card edge; `ghost` indigo text; `danger` / `success` with dark edges;
  new `soft` variant (indigo tint). Disabled = grey `disabled` / `on-disabled`, flat, no
  opacity. Sizes: `sm` 36 px, `md` 52 px (was 44), `lg` 56 px (was 48). Radius 16 px, bold.
- **IconButton:** 12 px radius, `ghost` icons in `fg-muted`, new `xl` size (64 px).
- **Card:** `default` = white, 2 px `border`, `shadow-3d-card`; `raised` = deeper neutral
  edge; `accent` = indigo banner (`bg-primary`, 20 px radius); new `flat`, `tint`, `warm`.
- **ProgressBar:** fill on `track`, no border; new `accent` tone.
- **XpBadge:** gold-tint pill, gold bolt, dark-gold text; new `variant="plain"` for the top bar.
- **HeartIcon:** lost hearts drawn in `border-strong` (3:1). **Dialog:** 20 px radius,
  display-font title. **Toast:** white / tinted panels with the card edge.
- **New:** `Chip` (course code / option number / level tag, tones indigo, coral, gold,
  pink, green, neutral, optional screen-reader `label`), `StatTile` (label + display
  number, tones gold, indigo, green, coral, neutral; `header` and `inline` layouts),
  `OptionCard` (selectable card with check circle; `row` and `tile` layouts; `selected`,
  `status="correct" | "incorrect"`; sets `aria-checked` for `role="radio"`/`"checkbox"`,
  else `aria-pressed`), `NavTab` + `navTabClassName()` (bottom-nav tab, `aria-current`),
  and icons `FlameIcon`, `StarIcon`, `LockIcon`, `SpeakerIcon`, `HomeIcon`, `TargetIcon`,
  `TrophyIcon`, `UserIcon`, `GearIcon`.
- **Lumi** is unchanged in shape; its colours come from the remapped tokens (gold body,
  indigo caps, ink outline) and sit well on the light canvas.

### 5. Theme API

`THEMES` is `["light"]`. `Theme` still accepts `"dark"` as a deprecated value so the
shell compiles; nothing keys off `data-theme` any more. `BRAND_HEX` gains `primary`,
`primaryEdge`, `accent`, `canvas`, `surface`; `canvasDark` / `canvasLight` are deprecated
aliases of `canvas`.

## Consequences

- Every screen switches to the light palette as soon as this merges, before its restyle.
  Feature-specific layouts (path nodes, top bar, lesson footer, feedback sheet, lesson
  complete, profile, leagues placeholder, practice list) are restyled by their owners on
  top of this branch.
- **dev-platform** follow-ups: set `DEFAULT_THEME` to `"light"` and remove the theme
  toggle in `providers.tsx` (and its test); manifest `theme_color` / `background_color` to
  `BRAND_HEX.primary` / `BRAND_HEX.canvas`; replace `night-400` in `RadioCardGroup` with
  `OptionCard`. CTO-016 changed `layout.tsx` only for font wiring, `themeColor` and the
  iOS status-bar style (`default`, dark text on the light canvas).
- **dev-lessons:** three tests asserted `min-h-12` on `lg` buttons; they now assert
  `min-h-14` (56 px). `MatchPairsExercise` uses `glow-100` / `night-900`, still AA.
- **dev-gamification / path:** `SkillPathView` uses `night-700` / `night-50` / `night-100` /
  `glow-400`, still AA in v2; restyle to `Card tone="accent"` and the `shadow-3d-node*` tokens.
- Re-introducing dark mode later means adding a `[data-theme="dark"]` block with the same
  names and extending `tokens.test.ts` per theme (as v1 did).
