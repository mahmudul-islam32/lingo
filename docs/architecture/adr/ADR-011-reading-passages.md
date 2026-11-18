# ADR-011: Reading passages and reverse-direction multiple choice

- **Status:** Proposed (becomes Accepted when CTO-012 merges)
- **Date:** 2026-11-18
- **Ticket:** CTO-012 (B1-T3, plan CTO-010); consumers LES-018 (planned), LES-004 (`direction`)
- **Decisions:** PD-012, PD-019, PD-060
- **Decider:** cto

## Context

B1 needs short German texts (a flat ad, a notice, a letter, a news item) with 2–4
comprehension questions answered in English. PD-019 fixed MC to known-language prompts and
learning-language options because the contract had no `direction`; it noted a `direction`
field as the reversible way out.

## Direction (to be confirmed in CTO-012)

1. `multiple_choice.direction?: "to_learning" | "to_known"`, default `"to_learning"`.
   `to_known` swaps the `lang` of the prompt and the options.
2. Passages are a lesson-level array (`lesson.passages`, ≤ 3 per lesson, text ≤ 600
   characters, `kind` in `letter | email | notice | ad | news`). Questions are ordinary MC
   exercises with `passageId` and `direction: "to_known"`, 2–4 per passage, contiguous in
   `exercises`.
3. No new exercise type and no new answer or result shape: scoring, hearts, re-queue and
   results stats keep working per exercise.

## Alternatives considered

- **One `reading` exercise with sub-questions:** one exercise in the stats for 2–4 answers;
  needs partial scoring and a new result shape. Rejected for the player and stats cost.
- **Passage text repeated in each MC prompt:** duplicated content and prompt-length limits.

## Open questions

- Passage audio (listening to the text): later, with the TTS pipeline (PD-055).
- Should a re-queued passage question show the passage expanded? Proposal: yes.

## Consequences

To be written when the ADR is accepted.
