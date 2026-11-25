# Importer brief (TELC-001)

Goal: bring **all** learning content of the telc B1 web app (`../telcB1-web`, data in
`../telcB1-web/src/data/*.json`, app logic in `../telcB1-web/src/sessions/*.jsx`,
`src/screens/*.jsx`, `src/core/*.js`) into the Polyglow/lingo app as two new courses:

- `telc-b1-en-de`, "telc B1 Exam Prep" (one CEFR level, B1; every unit gets `level: "B1"`)
- `einbuergerung-en-de`, "Einbürgerungstest" (no levels; units have NO `level`)

Learners know English (UI + explanations) and learn German.

## How it fits together

- `scripts/import-telc/lib.mjs`: helpers (`data`, `htmlToRich`, `htmlToPlain`, `slug`,
  `chunk`, `clip`, `optionId`, `rng`, `shuffled`, `lesson`, `unit`). Read it. Don't edit it;
  put extra helpers in your own module (or a `telc/_<yourname>-util.mjs`).
- `scripts/import-telc/build.mjs`: runs modules in path order. Each module is an ES module
  that exports `build()` returning an array of `unit({...})` bundles.
- Contracts (the law): `src/contracts/course.ts` (exercise schemas), `src/contracts/config.ts`
  (`CONTENT_RULES` limits), `src/contracts/rich-text.ts` (markup), `src/contracts/text.ts`
  (tokenisation used by word-bank validation). Read the schemas before writing anything.
- Example lessons in the existing style: `content/courses/en-de/lessons/*.json`.

Run and validate ONLY your module, into your own scratch dir (never into `content/`):

```
node scripts/import-telc/build.mjs --only <name> --out <scratch>/out
TELC_OUT=<scratch>/out npx vitest run --config scripts/import-telc/vitest.config.mts
```

Iterate until validation passes with zero problems.

## Exercise types (summary; schemas are authoritative)

Every exercise may have `explanation` (rich text ≤3000), shown after "Check".

- `explain`: teaching card `{title ≤160, body rich ≤8000, examples?: [{learning, known}] ≤24}`. Never graded.
- `task`: `{skill: "writing"|"speaking", title, task rich ≤6000, points?: string[] (≤12, each ≤280),
phrases?: string[] (≤40, each ≤280), modelAnswer rich ≤10000}`. Learner writes/speaks then sees model. Never graded.
- `choice`: `{title?, passage? rich ≤8000, prompt ≤600 (German OK), options 2–12 [{id,text ≤400}], correctOptionId}`.
  Exam-style question; option texts unique (case-insensitive).
- `listening`: `{title?, transcript ≤6000, prompt ≤600, options 2–12, correctOptionId}`. Transcript is read aloud
  by German TTS and revealed after Check. Lines starting with `Name:` are separate turns.
- `multiple_choice`: prompt ≤280 shown as ENGLISH (known language) heading; 3–4 options (≤280) shown as GERMAN.
- `match_pairs`: exactly 5 pairs `{id, learning ≤40, known ≤40}`, no duplicate texts per side.
- `word_bank_translate`: `direction` `to_learning` (prompt English → build German) or `to_known`;
  ≤24 tiles, each ≤40 chars; every answer must be buildable from the tiles after normalisation
  (`tokenizeAnswer`: lowercase, punctuation stripped). Add 2–5 plausible distractor tiles.
- `listen`: `{audio: {src: "/audio/de/telc/<anything>.mp3"}, tiles, answers}`. No file exists;
  the app reads `answers[0]` with German TTS. Same tile rules as word bank.
- `cloze`: sentence with 1–2 `___` gaps, filled sentence ≤80 chars, `translation` ≤80, each gap 2–4 options ≤24 chars.
- Don't use `speak`.

Lesson: `{id, courseId, unitId, title ≤280, tip? ≤280, exercises 1–40}` (ids added by `lesson()`).
Aim for 8–15 exercises per lesson (mock exams may go up to 40). Unit: 1–30 lessons.

## Rich text markup (for explain/task/choice passage/explanation)

Blank line = new paragraph; single newline = line break; `- ` lines = bullet list;
`## Heading` alone on a line = sub-heading; `**bold**`, `*italic*`. No HTML — convert
source HTML with `htmlToRich` (and `htmlToPlain` for short plain fields).

## IDs

- Lesson ids: `<unitId>-lNN-<slug>`, e.g. `tb1-u30-l03-perfekt`. Must be kebab-case `[a-z0-9-]`,
  ≤64 chars, unique across all courses. Use the unit-id range you were given.
- Unit ids: `tb1-uNN` (telc) / `eb-uNN` (Einbürgerung). Titles in English (German term in
  parentheses where it helps, e.g. "Reading (Lesen) · Part 1").

## Quality bar

- **Everything**: every item of every source field in your scope must end up in some exercise
  (vocab words, quiz items, example sentences, explanations, tips, model answers, …). Write a
  coverage check in your module that throws if something was dropped, and print counts.
- Never invent wrong German. Correct answers come from the source data. Distractors must be
  clearly wrong but plausible (take them from other items of the same source/topic).
- Deterministic output (use `rng(seed)`, never `Math.random`).
- Don't edit files outside your module(s). Don't touch `content/`, `src/`, or other modules.
  Don't commit. If a contract limit truly blocks content, split it (e.g. long text into
  two explain cards) rather than clipping; report anything you had to shorten.

## Report back (short)

Module file(s), units/lessons/exercises counts, coverage numbers per source field,
anything shortened or skipped and why, validation result.
