# ADR-017: Pictures on choice questions (`ChoiceExercise.figure`)

- **Status:** Accepted
- **Date:** 2026-11-22
- **Ticket:** TELC-005 (owner request: show the pictures of the Einbürgerungstest picture questions)
- **Decisions:** PD-076
- **Decider:** owner + cto

## Context

Seven Einbürgerungstest questions can't be answered without a picture (coats of arms, flags,
a photo, ballot papers, a map). Until now their options described each picture in words,
which gives the answer away and doesn't train the learner to recognise what the real test
shows. No exercise type could show an image.

## Decision

- `ChoiceExerciseSchema` gets an optional `figure`: 1–4 images
  (`{ src, alt, label? }`) and an optional `credit` line. Strict, like all content schemas.
- `src` is an `ImagePathSchema` path under `/public/images/**` (`png`, `jpg`, `jpeg`,
  `webp`, `svg`). No remote URLs: the files ship with the app and are precached by the
  service worker (Serwist precaches `public/**`), so picture questions work offline.
- `alt` (known language) describes the picture without naming the answer; `label` is the
  visible caption the options refer to ("Bild 1" …).
- `ChoiceExercise` renders the figure between the question and the options: one image at
  full width (max 38 dvh), or a 2 × 2 grid (4 across from `sm`) of white cards, so
  transparent images stay readable in dark mode. A plain `<img>` is used on purpose:
  `next/image` would load through `/_next/image`, which isn't available offline.

## Consequences

- Images add to the precache (the Einbürgerungstest set is ~0.8 MB). Keep images small:
  resize to display size, JPEG for photos.
- Only `choice` has a figure. Other types can adopt the same `ExerciseFigureSchema` later.
- The importer (`scripts/import-telc/pictures.mjs`) fails the build if a referenced image is
  missing from `public/`.
