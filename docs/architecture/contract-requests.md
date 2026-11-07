# Contract requests

Devs and the pm never edit `/src/contracts`. If you need a contract change, **stop**
and add an entry below (newest first). The cto answers in the same entry, makes the
change on a `chore/` branch and lists every affected feature.

Status values: `open` · `approved` · `rejected` · `done`.

## Template

Copy this block, fill it in, and put it under "Requests".

```md
### CR-NNN: <short title>

- **Requested by:** <agent> · **Date:** YYYY-MM-DD · **Ticket:** <TICKET-ID>
- **Status:** open
- **Contract(s):** e.g. `src/contracts/course.ts` → `ListenExerciseSchema`
- **Problem:** what you can't do with the current contract
- **Proposed change:** fields/types to add, remove or change (with an example)
- **Breaking?:** yes/no (does it change persisted or synced data or existing content?)

**CTO decision:** (cto fills in) approved/rejected, reasoning, final shape, affected
features, follow-up PR
```

## Requests

### CR-002: Skipped attempts and "perfect" when every exercise is skipped

- **Requested by:** dev-lessons · **Date:** 2026-11-07 · **Ticket:** LES-002
- **Status:** open
- **Contract(s):** `src/contracts/lesson-session.ts` → `ExerciseAttemptSchema.answer`,
  `LessonResultSchema` (`perfect` refinement); `src/contracts/answer.ts` →
  `MultipleChoiceAnswerSchema`
- **Problem:**
  1. A skipped attempt must carry an `answer` of the exercise's type. That works for tile,
     match-pairs and speak answers (empty arrays), but `MultipleChoiceAnswerSchema.optionId`
     is a required slug, so a skipped multiple-choice exercise (`onSkip("invalid_content")`)
     has no honest "no option" value.
  2. PD-012 says a perfect lesson needs "0 mistakes **and at least 1 counted exercise**",
     but `LessonResultSchema` requires `perfect === (mistakeCount === 0)`. If every
     exercise was skipped (for example all listen exercises with no audio), the
     result has to say `perfect: true` even though PD-012 says it isn't.
- **Proposed change:**
  1. Make `ExerciseAttemptSchema.answer` nullable, required to be `null` iff
     `outcome === "skipped"` (e.g. `{ outcome: "skipped", answer: null }`).
  2. Change the refinement to `perfect === (mistakeCount === 0 && exerciseCount - skippedCount >= 1)`
     (and keep "perfect bonus requires perfect").
- **Breaking?:** (1) no, `ExerciseAttempt` is in-memory only. (2) It's a tighter rule on a
  synced payload, but only for the all-skipped case, which can't have been produced yet.
- **Workaround in place:** (1) the reducer records `{ type: "multiple_choice", optionId:
"skipped" }` for a skipped multiple-choice exercise (`emptyAnswerFor`). (2)
  `LessonSessionSummary.perfect` follows PD-012 and drives the XP bonus, while
  `buildLessonResult` sets `perfect: mistakeCount === 0` so the result stays schema-valid.
  The all-skipped edge case gets no perfect bonus.

**CTO decision:** _(pending)_

### CR-001: Match-pairs answer should carry the mismatch count

- **Requested by:** dev-lessons · **Date:** 2026-11-07 · **Ticket:** LES-001
- **Status:** done
- **Contract(s):** `src/contracts/answer.ts` → `MatchPairsAnswerSchema` (and optionally
  `AnswerCheckResultSchema`)
- **Problem:** LES-001 AC8 and PD-012 need the check result to report whether any
  mismatch happened during a match-pairs exercise (accuracy, mistakes, and from v0.3.0
  at most 1 heart). The answer only holds the final `matches`, so `checkAnswer` cannot
  know about mismatched taps. ADR-002 §6 already names `mistakeCount` as the way to
  add this.
- **Proposed change:** add `mismatchCount: NonNegativeIntSchema` to
  `MatchPairsAnswerSchema`, e.g.
  `{ type: "match_pairs", matches: [...], mismatchCount: 2 }`. Optionally add
  `hadMismatch: z.boolean().optional()` to `AnswerCheckResultSchema` so the session
  can compute accuracy from the result alone.
- **Breaking?:** no for content. `ExerciseAttempt.answer` is in-memory only, so no
  persisted or synced data changes; `CONTRACTS_VERSION` stays 1.
- **Workaround in place:** `checkMatchPairsWithMismatches({ exercise, answer,
mismatchCount })` in `src/features/lessons/checking` returns
  `{ result, hadMismatch }`, with the count tracked by the player. It will be folded
  into `checkAnswer` once this is approved.
- **Related note (no change requested):** `AnswerCheckResult.heartCost` is documented as
  "1 for incorrect non-speak answers", while ADR-002 §6 says match pairs never cost
  hearts. `checkAnswer` follows the contract (an incomplete match-pairs submission is
  `incorrect` with `heartCost` 1). The UI never submits an incomplete board, so in
  practice match pairs cost 0 hearts. Please confirm or adjust the wording.

**CTO decision:** approved (2026-11-07), branch `chore/cr-001-match-pairs-mismatch`.

- **Answer:** `MatchPairsAnswerSchema.mismatchCount: NonNegativeIntSchema` (required).
  The player counts mismatched taps; there is no hidden default, so a forgotten count
  fails typecheck instead of silently reporting 0.
- **Result:** instead of a match-pairs-only `hadMismatch`, `AnswerCheckResultSchema` gets
  a required, type-agnostic `mistake: boolean`: true for every `incorrect` outcome and
  for a `correct` match pairs with `mismatchCount > 0`; never for `skipped`. The session
  counts `mistake` for `LessonResult.mistakeCount`, `perfect` and first-try accuracy, so
  PD-012 lives in one place (`checkAnswer`). `ExerciseAttemptSchema` copies `mistake`.
  Refinements: `incorrect` ⇒ `mistake`; `skipped` ⇒ not `mistake`; `heartCost > 0` ⇒
  `mistake`.
- **Heart cost (the related note):** PD-012 wins over the old ADR-002 §6 wording. Match
  pairs cost **at most 1 heart**: 1 if `mismatchCount > 0` (outcome stays `correct`, no
  re-queue), 1 for an incomplete board (`incorrect`), else 0. Hearts only take effect in
  v0.3.0 (LES-009), so v0.2.0 behaviour is unchanged. ADR-002 §6 and ARCHITECTURE §
  "Rules" / match-pairs row are updated.
- **Breaking?** No persisted or synced shape changes (`LessonResult`, Supabase tables
  untouched; `ExerciseAttempt` is in-memory only). `CONTRACTS_VERSION` stays 1.
- **Workaround removed:** `checkMatchPairsWithMismatches` / `MatchPairsCheck` are
  deleted from `src/features/lessons/checking`; `checkAnswer` reads `mismatchCount`.
- **Affected features:** lessons (LES-001 checker, done in this branch; LES-002 session
  must copy `mistake` into attempts and count it; LES-006 match-pairs player must send
  `mismatchCount`; LES-008 results screen reads the counts; LES-009 hearts uses
  `heartCost`), gamification (GAM-002 consumes `perfect`/`heartCost` only, no code
  change). Platform: none.
