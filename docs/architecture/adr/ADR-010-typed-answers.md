# ADR-010: Typed answers with German spelling leniency

- **Status:** Proposed (becomes Accepted when CTO-011 merges)
- **Date:** 2026-11-18
- **Ticket:** CTO-011 (B1-T2, plan CTO-010); consumer LES-017 (planned)
- **Decisions:** PD-010, PD-012, PD-033
- **Decider:** cto

## Context

B1 scenarios (U6, U8, U11, U16) ask the learner to write one sentence of an email or a
complaint. Tiles can't practise spelling. PD-033 §3 decided that typed answers accept `ss` for
`ß` and `ae / oe / ue` for `ä / ö / ü`, and a lower-case noun, each as correct with a note.
The shared normalisation (`normalizeAnswerText`) must stay strict for tiles and schema
validation (PD-033 §1).

## Direction (to be confirmed in CTO-011)

1. A new exercise type `typed_translate` (known-language prompt, 1–6 accepted
   learning-language answers, `answers[0]` canonical) and answer `{ type, text }`.
2. A pure `checkTypedAnswer` in `src/contracts/answer.ts`. Order: exact match on the strict
   normalisation; then a match after `foldGermanSpelling` on both sides (`ß → ss`, `ä → ae`,
   `ö → oe`, `ü → ue`); then incorrect. No typo distance in v1.1.0.
3. `AnswerCheckResult` gains optional `spellingNotes: { kind: "sharp_s" | "umlaut" |
"capitalisation"; expected: string }[]`. A correct answer with notes is not a mistake
   (PD-012) and costs no heart.
4. The fold table is per learning language (`de` only). `foldDiacritics` stays speech-only.
5. The schema rejects two accepted answers of one exercise that fold to the same text.

## Open questions

- Should a lenient match count as "first try correct" in the results accuracy? Proposal: yes
  (the learner was right; the note teaches the spelling).
- Typo tolerance (one edit) for long words: out of scope, revisit with B1 QA data.

## Consequences

To be written when the ADR is accepted.
