# Screenshot and video shot list (v0.5.3)

**Status:** ready to use. All files are real captures from `main` in `docs/media/` (README,
2026-11-20, v0.5.3 design). Use them as they are: no edited numbers, no fake streaks, no
invented users. Phone frames and a caption bar are fine.

## A. Store / listing screenshots (order matters: first three sell)

| # | File | Caption (EN) | Caption (DE) | Use |
|---|---|---|---|---|
| 1 | `docs/media/learn-lessons.png` | German for life in Germany, A1 to A2 | Deutsch für den Alltag, A1 bis A2 | Store #1, landing hero |
| 2 | `docs/media/lesson-tip.png` | A short tip before every lesson | Vor jeder Lektion ein kurzer Tipp | Store #2 |
| 3 | `docs/media/lesson-choice.png` | Five-minute, game-like lessons | Lektionen in fünf Minuten | Store #3 |
| 4 | `docs/media/lesson-feedback-correct.png` | Every correct answer gives a heart back | Jede richtige Antwort bringt ein Herz zurück | Store #4, ad image |
| 5 | `docs/media/onboarding-2b-level.png` | Start at A1 or jump to A2 | Starte bei A1 oder direkt bei A2 | Store #5 |
| 6 | `docs/media/profile.png` | Your streak, XP and week at a glance | Serie, XP und Woche auf einen Blick | Store #6 |
| 7 | `docs/media/lesson-word-bank.png` | Build sentences in both directions | Sätze bauen, in beide Richtungen | Landing, social |
| 8 | `docs/media/lesson-match-pairs.png` | Match the pairs | Paare finden | Social |
| 9 | `docs/media/lesson-results.png` | XP, accuracy, time and your streak | XP, Genauigkeit, Zeit und Serie | Social |
| 10 | `docs/media/offline-banner.png` | Works offline | Funktioniert offline | Landing |
| 11 | `docs/media/onboarding-1-welcome.png` | Meet Lumi, your paper-lantern guide | Das ist Lumi, dein Laternen-Guide | Social, press |

**Avoid in marketing:** `lesson-listen.png` (its README alt text says it shows the audio
fallback; check before use, it may show "Audio isn't available"), `not-found.png`,
`back-online.png`, `lesson-feedback-incorrect.png` (fine for the hearts post #9 only).

## B. Videos and GIFs

| File | Length use | Where |
|---|---|---|
| `docs/media/lesson.mp4` / `lesson.gif` | Crop to 9:16, 15–30 s | Reels/Shorts post #7, landing hero, Reddit |
| `docs/media/onboarding.mp4` / `.gif` | 10–15 s | "Start in seconds" posts, store promo video |
| `docs/media/offline.mp4` / `.gif` | 10 s | Offline post #8 |
| `docs/media/tabs.mp4` / `.gif` | 5–10 s | Product tour |

## C. Missing shots (request to the orchestrator, who owns `docs/media/` and the capture script)

| Shot | Why | Note |
|---|---|---|
| Practice tab with a few finished lessons | Key differentiator (free practice) has no screenshot | New flow in `scripts/readme-media/capture.mjs` |
| Out-of-hearts screen pointing to Practice | Shows the kind-hearts story | Same |
| A2 unit on the path (e.g. "train and hotel" or "letters and offices") | Proves "life in Germany" beyond A1 Unit 1 | Same |
| Leagues tab ("Leagues arrive with accounts") | Only if we talk about the roadmap | Same |
| Landscape / desktop view | Product Hunt-style galleries and press | Same |

Store size: most stores want portrait 9:16 images (e.g. 1080 × 1920). The captures are 390 px
wide phone screens at 2× (about 780 px); scale up in a frame rather than stretching.
