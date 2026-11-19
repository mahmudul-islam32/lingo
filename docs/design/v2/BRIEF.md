# Polyglow visual redesign v2: owner design brief (2026-11-19)

Source: the owner's design file "Language Learning App Design" (8 phone screens, 390 × 874).
Reference renders: `/home/user/design-ref/screen-1.png` … `screen-8.png`.
Extracted markup with inline styles (exact sizes, colours, spacing): `screen-1.html` … `screen-8.html`.

**Keep:** the name **Polyglow**, mascot **Lumi**, all features, content, behaviour, tests and
accessibility. **Change:** the whole look, matching the design as closely as our real features allow.
The design's brand name "parla" and its speech-bubble logo are NOT used: Polyglow and Lumi stay.
Never show invented data (no fake leaderboard names, no fake achievements).

## Screens in the design → our screens
1. Welcome & pick a language → onboarding welcome + course picker (German first; "DE" chip). Also
   the level step and the goal step, in the same style.
2. Home, learning path → Learn tab: top bar (course chip "DE", streak, XP, hearts), indigo unit
   banner card, big round path nodes (done = indigo with a check, current = coral star with a
   "Start · Lesson N" pill above it, locked = light grey with a lock), 4-tab bottom nav.
3. Lesson, multiple choice → MC as 2 × 2 numbered option cards, "NEW WORD" style eyebrow, indigo
   progress bar, hearts at top right, a full-width Check bar at the bottom (grey when disabled).
4. Lesson, build the sentence → speaker button + prompt bubble, answer line, word-bank tiles.
5. Answer feedback (incorrect) → red bottom sheet "Not quite …", "CORRECT ANSWER" label, red "Got it".
   Correct = the same in green. The listen screen uses the big indigo speaker plus a "0.7×" slow button.
6. Lesson complete → trophy illustration (Lumi may replace the trophy), 3 coloured stat tiles
   (TOTAL XP gold, TIME indigo, ACCURACY green), coral streak banner, indigo Continue button.
7. Leagues → bottom-nav tab exists; leagues need accounts (v0.6.0), so the screen shows an honest
   "Leagues arrive with accounts" state in the design style. No fake names.
8. Profile & progress → avatar initials circle, name / "Learning German · Joined <month>", stat
   tiles (day streak, total XP, lessons done, start level), an "XP this week" bar chart from real
   results with the daily-goal line, settings rows. Achievements: not built, so leave them out.
Practice tab (design nav): a real list of finished lessons to practise (earns hearts, PD-065).

## Design tokens (from the design)
- Primary indigo `#4338CA`; pressed/3D edge `#312E81`; indigo-700 `#3730A3`; tint `#E0E7FF`,
  `#EEF2FF`, `#C7D2FE`; indigo-500 `#6366F1`.
- Accent coral `#F2613F` (current node, streak); coral tint `#FDE7DF` / `#FFF1EC`; coral text
  `#9A3412` / `#C2410C`.
- Ink `#1B1D2A` (text); muted `#5B6070`; subtle `#7A7F92`; slate `#94A3B8`.
- Canvas `#F6F7FB` (app background); surface `#FFFFFF`; border `#E3E5EE`; strong border `#CDD0DD`.
- XP gold `#F5B400` (dark `#D99A00`, text `#8A6200`, tint `#FEF3C7`).
- Success `#15803D` (tint `#DCFCE7` / `#BBF7D0`); error `#B91C1C` (tint `#FEE2E2` / `#FFF5F5`,
  `#FCA5A5`, dark `#7F1D1D`); hearts `#F43F5E` / `#BE123C`.
- Fonts: **Bricolage Grotesque** 700/800 for headings and numbers; **DM Sans** 400/500/700 for
  body and UI (both Google Fonts, OFL; load with `next/font/google`, self-hosted at build).
- Sizes: body 14–16 px, labels 12–13 px (uppercase eyebrows, letter-spaced), headings 22–36 px.
- Radii: cards and buttons 16 px, chips 8–12 px, nodes and avatars 50 %.
- "3D" depth: solid bottom shadows, no blur. Cards `0 3px 0 #E3E5EE`; primary button
  `0 4px 0 #312E81`; big nodes `0 6px 0 #312E81` (locked `0 6px 0 #CDD0DD`). Pressed = translateY(2px)
  with a smaller shadow.
- Theme: light, as in the design. Dark mode is dropped for now (PD-066).
