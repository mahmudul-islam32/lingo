# ADR-008: German course support, CEFR levels and German answer normalisation

- **Status:** Accepted
- **Date:** 2026-11-12
- **Ticket:** CTO-008 (product decisions PD-030, PD-032, PD-033, PD-034, PD-037)
- **Decider:** cto

## Context

The owner made German for English speakers (`en-de`) the primary course, CEFR A1 to C1,
starting with A1. The pm writes the curriculum and content (PM-005). The platform was
built for one small course (`en-es`, one unit, five lessons): no notion of level, no
explicit size limits, one hard-wired course in the lesson route and the service worker,
and answer rules written for Spanish (PD-010).

## Decisions

### 1. Level layer: declared on the course, referenced by each unit

Path hierarchy is Course → Level → Unit → Lesson (PD-030), stored flat:

```jsonc
{
  "levels": [
    { "level": "A1", "title": "A1 · Beginner", "description": "optional, ≤ 280 chars" },
    { "level": "A2", "title": "A2 · Elementary" }, // no units yet: "Coming soon"
  ],
  "units": [{ "id": "de-a1-u01", "level": "A1", "title": "Hello!", "lessons": [] }],
}
```

- `CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]`, `CefrLevelSchema`, `cefrLevelIndex`.
- `CourseLevelSchema`: `level`, `title` (1–40 chars, e.g. "A1 · Beginner"), optional
  `description` (≤ 280).
- `Course.levels?`: CEFR order, each level once. A level **may have no units** (shown as
  "Coming soon", GAM-010).
- `Unit.level?`: if the course declares `levels`, every unit has one of the declared
  levels, and units are grouped by level in CEFR order (all A1 units, then A2, …). A unit
  is in exactly one level by construction (single field). If the course declares no
  levels, no unit may have one.
- Both fields are optional, so `content/courses/en-es/course.json` is valid unchanged (no
  migration, no version bump).
- Because units are grouped in order, **the unit order is the path order**.
  `flattenCourseLessons(course)` returns every lesson with its unit and level in that
  order (for `computePathNodes` and the content layer); `groupUnitsByLevel(course)`
  returns each declared level with its units (empty for "Coming soon").
- Why flat and not `levels[].units[]`: every existing consumer (`course.units`,
  `findLesson`, path rules, static params) keeps working, and the ordering rule is one
  refinement. A nested tree would break all of them for no extra rule.
- Course content is not persisted or synced (bundled JSON; ADR-005 query keys are
  in-memory), so `CONTRACTS_VERSION` stays 1.

### 2. Limits for a real course (`CONTENT_RULES`)

| Rule                 | Before | Now  | Why                                              |
| -------------------- | ------ | ---- | ------------------------------------------------ |
| `wordBankMaxTiles`   | 16     | 24   | B2/C1 sentences with distractors                 |
| `maxAcceptedAnswers` | 10     | 20   | German word order and du/ihr/Sie variants        |
| `lessonTipMaxLength` | 200    | 280  | grammar tips (cases, verb position)              |
| `unitMinLessons`     | 1      | 1    | made explicit                                    |
| `unitMaxLessons`     | none   | 30   | explicit, generous bound                         |
| `courseMaxUnits`     | none   | 150  | A1–C1 plans roughly 12–20 units per level        |
| `courseMaxLessons`   | none   | 2000 | upper bound for one manifest (static params, SW) |

Unchanged: 1–20 exercises per lesson (content targets 10–12), 3–4 multiple-choice
options, exactly 5 match pairs, 40 characters per tile/pair word, 280 per text field.
The answer payload already allows 32 tiles.

### 3. German answer normalisation (PD-033, extends PD-010)

One implementation in `src/contracts/text.ts`, used by both the content schema
(buildable from tiles) and the checker; no per-language switch is needed:

- **Umlauts and ß are significant** for tile and listen answers: "schon" ≠ "schön",
  "Straße" ≠ "Strasse", "Brüder" ≠ "Bruder". No ss → ß and no ae/oe/ue folding in the
  shared normalisation (it would let content bugs through). NFD input equals NFC.
- **Case-insensitive** (PD-010): capitalised noun tiles ("Hund") build answers whatever
  the case, sentence-initial words never fail, "ÄPFEL" = "äpfel", capital "ẞ" lower-cases
  to "ß". Tiles are shown as authored, so the learner still sees noun capitals.
- **Punctuation as today**, now also German quotes `„ “ ‚ » « › ‹`. Apostrophes stay
  significant ("geht's" ≠ "gehts"); typographic `’` equals `'`. `‘` is read as an
  apostrophe, so authored text uses `„…“`, never `‚…‘`. Hyphens split words
  ("U-Bahn" → "u bahn"), identically for tiles and answers, so a tile `U-Bahn` builds
  "Ich nehme die U-Bahn." and matches.
- **Typed answers** (Phase 2, PD-033 point 3): "ss" for "ß" and ae/oe/ue for umlauts will
  be accepted _with a spelling note_. That needs a new result field and its own helper,
  so it is not built now; the recommendation "ss accepted for typed text, tiles exact"
  is adopted and extended by the pm's decision.
- **Speech** (`foldDiacritics`): umlauts fold (ö → o) as accents did, and "ß" now folds to
  "ss" (de-CH recognisers never write "ß").

### 4. Speech locale (PD-034)

`speechLocale(lang)` in `src/contracts/language.ts`: `de` → `de-DE`; a tag with a region
is kept; others unchanged (`es` stays `es`, the current behaviour). Speech synthesis
(listen fallback) and recognition (speak) read the locale from here, never hard-coded.
German audio paths `/audio/de/<level>/<unit>/<exercise-id>.mp3` already match
`AudioPathSchema`.

### 5. Course registry and multiple bundled courses

- `COURSE_REGISTRY` in `src/lib/content/bundled-content.ts`: `en-de` `available`,
  `en-es` `hidden` (PD-030). The loader maps have exactly these ids, in this order
  (tested). `listAvailableCourses()` returns the available ones (onboarding, PLT-024);
  hidden courses still load with `getCourse`. `DEFAULT_COURSE_ID = "en-de"`.
- The lesson route stays `/lesson/<lessonId>`; **lesson ids and exercise ids are unique
  across all courses** (`content.test.ts`, `bundled-content.test.ts`). The page prerenders
  every lesson of every registered course and resolves the course with
  `bundledCourseIdOfLesson`; `LESSON_ROUTES` (service worker precache) covers all
  courses. Learners already on `en-es` keep their `settings.courseId`.
- en-de ids (PD-037): unit `de-a1-u01`, lesson `de-a1-u01-l1-<slug>`, exercise
  `de-a1-u01-l1-ex01`. They can never collide with en-es (`unit-1`, `u1-l1-…`).

## Consequences

- The pm can author A1 at full size now; later levels add a `levels` entry (any time,
  even before content) and append units.
- Until PLT-024, onboarding still calls `listBundledCourses()` and shows German and
  Spanish; PLT-024 switches it to `listAvailableCourses()`.
- Precache and static params grow with the course. Near the `courseMaxLessons` bound they
  need a per-level split (lazy level packs); revisit when B1 content starts.
- Rejected: a nested `levels[].units[]` tree (breaks every consumer); one course per level
  (progress, streaks and the path would be split); folding ß or umlauts in the shared
  normalisation (hides real spelling errors; tiles make it unnecessary).
