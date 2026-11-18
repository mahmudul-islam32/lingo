# ADR-012: Grammar note card with a small table

- **Status:** Proposed (becomes Accepted when CTO-013 merges)
- **Date:** 2026-11-18
- **Ticket:** CTO-013 (B1-T4, plan CTO-010); consumer LES-019 (planned)
- **Decisions:** PD-050, PD-060, CDS-21
- **Decider:** cto

## Context

Endings, n-declension, relative pronouns and the genitive read best as a small table. The
LES-013 tip card shows plain text up to 280 characters; B1 tips carry one-line tables in the
meantime (CDS-21).

## Direction (to be confirmed in CTO-013)

1. An optional lesson-level `note`: `title`, `body` (known language) and an optional
   `table` with a `caption`, 1–4 known-language column labels and 1–6 rows of a
   known-language row header plus one learning-language cell per column.
2. Size limits that fit 375 px without horizontal scrolling (labels ≤ 16 characters, cells
   ≤ 14), so the table never needs its own scrolling region.
3. Rendered in the LES-013 card before the first exercise, as a semantic `<table>` with
   per-cell `lang`.

## Alternatives considered

- **Markdown in `tip`:** needs a parser and leaves `lang` tagging and table semantics to
  chance.
- **A note as an exercise type:** it isn't answered; it would distort progress and stats.

## Consequences

To be written when the ADR is accepted.
