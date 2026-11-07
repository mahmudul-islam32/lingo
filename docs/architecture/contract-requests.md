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

### CR-001: Match-pairs answer should carry the mismatch count

- **Requested by:** dev-lessons · **Date:** 2026-11-07 · **Ticket:** LES-001
- **Status:** open
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

**CTO decision:** _(pending)_
