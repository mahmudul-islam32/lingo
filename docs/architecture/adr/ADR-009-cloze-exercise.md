# ADR-009: `cloze` (fill-the-gap) exercise contract

- **Status:** Accepted
- **Date:** 2026-11-16
- **Ticket:** CTO-009 (product decisions PD-012, PD-019, PD-033, PD-049); consumer LES-015
- **Decider:** cto

## Context

A2 German drills grammar choices (der / die / das, dem / den, blauen / blaue, auf dem /
auf den). Full-sentence multiple choice works but is slow to read. PD-049 asks for one
generic `cloze` type with 1–2 gaps and 2–4 options per gap, and makes gender choice a
one-gap cloze instead of its own type. Typed gaps are Phase 2 (PD-033).

## Decisions

### 1. Content shape (`ClozeExerciseSchema`, strict)

```jsonc
{
  "id": "de-a2-u06-l1-ex11",
  "type": "cloze",
  "sentence": "Ich lege das Buch auf ___ Tisch.", // learningLanguage, authored case
  "translation": "I put the book on the table.", // knownLanguage
  "audio": { "src": "/audio/de/de-a2-u06-l1-ex11.mp3" }, // optional, full correct sentence
  "gaps": [
    {
      "options": [
        { "id": "dem", "text": "dem" },
        { "id": "den", "text": "den" },
      ],
      "correctOptionId": "den",
    },
  ],
}
```

- **Inline marker, positional gaps.** A gap is exactly `CLOZE_GAP_MARKER` (`"___"`) in
  `sentence`; `gaps[i]` belongs to the i-th marker in reading order. The author writes one
  readable German sentence, and the screen reader can read it as one sentence with each
  gap as "blank i of n". Alternatives rejected: a segment array (`[{text}, {gap}]`) is
  hard to author and review; `{{0}}`-style placeholders add an id that must match.
- **Gaps have no id.** Position is the identity; there are at most 2. Option ids are unique
  **within** a gap and may repeat across gaps (`der` in both gaps of a sentence).
- `translation` is required (product needs it under the sentence); max 80 characters.
- `audio` is optional and reads the full, correctly filled sentence (PD-034 fallback when
  absent).

### 2. Validation rules

| Rule                                                                                 | Limit (`CONTENT_RULES`)               |
| ------------------------------------------------------------------------------------ | ------------------------------------- |
| Marker count equals `gaps.length`                                                    | 1–2 (`clozeMinGaps` / `clozeMaxGaps`) |
| Options per gap                                                                      | 2–4 (`clozeMinOptions` / `Max`)       |
| Option ids and texts (case-insensitive) unique within a gap                          | —                                     |
| `correctOptionId` is one of the gap's options                                        | —                                     |
| Option text: trimmed, non-blank, no `_`                                              | ≤ 24 (`clozeOptionMaxLength`)         |
| Sentence with **each gap filled by its longest option** (worst case, CDS-13)         | ≤ 80 (`clozeSentenceMaxLength`)       |
| `translation`                                                                        | ≤ 80 (`clozeTranslationMaxLength`)    |
| Markers are exactly `___`; no other underscore in the sentence                       | —                                     |
| Gaps are separated by text (no `______` or `___ ___`), and the sentence has text too | —                                     |

"After replacing the markers" (CTO-009 AC 2) is defined as the longest-option fill, so
whatever the learner picks, the rendered sentence fits the LES-014 / LES-015 layout.

### 3. Answer and check

- `ClozeAnswerSchema = { type: "cloze", optionIds: Slug[] }` (1–2 entries),
  `optionIds[i]` for `gaps[i]`.
- `AnswerCheckResult.wrongGapIndexes?: number[]`: 0-based, ascending, present only for
  cloze; empty iff `outcome === "correct"` (schema refinement). Other types never set it,
  so their results are unchanged.
- `checkClozeAnswer(exercise, answer)` is a **pure contract function** next to the schema
  (like `isBuildableFromTiles`), so the gap/split rules have one implementation.
  `checkAnswer` in `features/lessons/checking` delegates its `cloze` branch to it.
  - `correct` only when every gap has its `correctOptionId` and no extra id is sent.
  - `correctAnswer` = `clozeCorrectSentence(exercise)`: the sentence filled with the
    correct options, authored case.
  - PD-012 unchanged: an incorrect check is 1 mistake, costs
    `GAME_CONFIG.heartsLostPerMistake` (1) and is re-queued by the session like any
    other incorrect answer.
- Helpers for the component: `splitClozeSentence` (text / gap segments with `gapIndex`),
  `countClozeGaps`, `fillClozeSentence`.

### 4. Languages (`lang`)

`sentence` and option texts are in the course's `learningLanguage`; `translation` is in
`knownLanguage`. PD-019 (MC prompts in the known language) is unchanged for
`multiple_choice`.

### 5. Compatibility with older clients

Course content is **bundled** into the app build (ARCHITECTURE §9, `bundled-content.ts`)
and precached with the same service worker as the code. A cached older client therefore
only ever has the content of its own build; a lesson with `cloze` can't reach a client
whose schema doesn't know the type. No content version gate is needed.

Inside a build that knows the contract but has no component yet (this release, before
LES-015), the registry has no `cloze` entry, so the player leaves those exercises out and
doesn't count them (LES-002 criterion 9, as for `speak` before LES-011). **Content may use
`cloze` only from the release that contains LES-015** (pm rule; the cto blocks content PRs
that add cloze earlier).

If remote content delivery is ever added, it must carry a minimum app/contract version;
that is a separate ADR.

### 6. Persisted data

`ExerciseAttempt` is in-memory; `LessonResult` and Supabase tables don't store answers
or exercise types. `CONTRACTS_VERSION` stays 1. No migration.

## Consequences

- One generic type covers gender choice, articles, endings and prepositions (PD-049).
- The lesson checker gained one delegating branch; LES-015 owns the component, its
  registration and the feedback marking.
- Out of scope: typed gaps, more than 2 gaps, drag-and-drop, shared tiles between gaps.
