# Screenshot and video shot list (v0.5.4)

**Last updated:** 2026-11-27 (MKT-002) · **Valid for:** v0.5.4 on `main`

**Status:** usable with care. All files in `docs/media/` are real captures from `main`, but they
were taken on **2026-11-20 for v0.5.3** (README). Since then v0.5.4 changed three visible things:
the app uses **system fonts** instead of Bricolage Grotesque and DM Sans (TELC-002), Learn can
show a **goal-date card**, and Profile has **Course**, **Goal date** and **Sound effects** rows.
The old captures are still honest (nothing they show is gone), but they don't show the new
features and the type looks slightly different. Use them as they are: no edited numbers, no fake
streaks, no invented users. Phone frames and a caption bar are fine.

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

**When the goal-card shot exists (§C #1),** it replaces #6 in the store order, and #6 moves to
7: caption "Pick a level and a date. See the plan." / "Niveau und Datum wählen. Plan sehen."

**Avoid in marketing:**
- `lesson-listen.png` (its README alt text says it shows the audio fallback; check before use,
  it may show "Audio isn't available"), `not-found.png`, `back-online.png`,
  `lesson-feedback-incorrect.png` (fine for the hearts post #9 only).
- `onboarding-2-course.png` (**new in v0.5.4**): it shows the v0.5.3 picker with German only.
  On `main` the course choice now also lists the exam-prep courses, so the old capture is out of
  date and a new one would show exam names. Don't use either (`../positioning.md` §5b).
- Any new capture of Profile → Course, or of any screen inside the exam-prep courses.

## B. Videos and GIFs

| File | Length use | Where |
|---|---|---|
| `docs/media/lesson.mp4` / `lesson.gif` | Crop to 9:16, 15–30 s | Reels/Shorts post #7, landing hero, Reddit |
| `docs/media/onboarding.mp4` / `.gif` | 10–15 s | "Start in seconds" posts, store promo video. **Check first:** it was recorded on v0.5.3; if it is recaptured on v0.5.4, crop out the course step or keep German selected without showing the other courses |
| `docs/media/offline.mp4` / `.gif` | 10 s | Offline post #8 |
| `docs/media/tabs.mp4` / `.gif` | 5–10 s | Product tour |

Sound: lessons now have sound effects (v0.5.4). A recaptured lesson video with the sound on
would suit Reels / Shorts; the current recordings have no app sound.

## C. Missing shots (request to the orchestrator, who owns `docs/media/` and the capture script)

| # | Shot | Why | Note |
|---|---|---|---|
| 1 | **Learn with the goal card** (German, e.g. "Goal: finish A2 by …", lessons left, "Use <n> XP a day") | v0.5.4's headline feature has no screenshot; needed for landing, social #11/#12 and ad #6 | **New (v0.5.4).** Use a fixed clock and a real plan made in the app, not edited numbers. German course only |
| 2 | **Profile → Goal date dialog** (level + date) | Shows how easy it is to set | **New (v0.5.4).** Crop so the Course row is not visible |
| 3 | **Results screen with the goal row** ("… lessons left") | Shows progress after every lesson | **New (v0.5.4)** |
| 4 | Practice tab with a few finished lessons | Key differentiator (free practice) has no screenshot | New flow in `scripts/readme-media/capture.mjs` |
| 5 | Out-of-hearts screen pointing to Practice | Shows the kind-hearts story | Same |
| 6 | A2 unit on the path (e.g. "train and hotel" or "letters and offices") | Proves "life in Germany" beyond A1 Unit 1 | Same |
| 7 | Recapture of the v0.5.3 set with system fonts | Store screenshots should match what users see | After v0.5.4; the orchestrator's nightly README refresh may already cover it |
| 8 | Leagues tab ("Leagues arrive with accounts") | Only if we talk about the roadmap | Same |
| 9 | Landscape / desktop view | Product Hunt-style galleries and press | Same |
| 10 | **After v0.5.5 ships (DRAFT):** Practice with the Review card ("<n> exercises are ready for review"), a review in the player, "Review complete!" | For the Smart review drafts in the kit | Only after v0.5.5 is released |

Store size: most stores want portrait 9:16 images (e.g. 1080 × 1920). The captures are 390 px
wide phone screens at 2× (about 780 px); scale up in a frame rather than stretching.
