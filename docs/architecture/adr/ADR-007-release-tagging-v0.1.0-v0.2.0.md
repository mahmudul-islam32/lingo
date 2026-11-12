# ADR-007: Tagging v0.1.0 and v0.2.0 after main moved ahead

- **Status:** Accepted
- **Date:** 2026-11-12
- **Ticket:** RELEASE-v0.2.0 (also covers v0.1.0)
- **Decider:** cto

## Context

The pm accepted v0.1.0 (MVP foundation) and v0.2.0 (First playable lesson) on the same
day. By then `main` already contained all of v0.2.0 and part of v0.3.0 (gamification
hooks, hearts, top bar, LES-009/LES-010), so a v0.1.0 tag on today's `main` would ship
far more than the milestone. Releases go in order (ROADMAP: v0.1.0 first, then v0.2.0).

## Decision

1. **v0.1.0** is an annotated tag on `407e4a1`, the squash merge of PLT-005 (#42). It is
   the first commit on `main` with every v0.1.0 ticket. Its tree is identical to the
   PR #42 head `ca1765d` (branch merged with `main` 88f938b), on which both CI jobs
   (verify and e2e) passed. `package.json` at that commit still says `0.0.0`; the tag is
   the version of record. No back-dated release branch is created.
2. **v0.2.0** is an annotated tag on the merge commit of the `chore/release-v0.2.0` PR,
   which bumps `package.json` (and the lock file's root) to `0.2.0` and adds
   `CHANGELOG.md`.
3. `CHANGELOG.md` lists each milestone's tickets under its version. Work for later
   milestones that is on `main` but not yet mounted on any screen (v0.3.0) is listed
   under "Unreleased", even though the code is inside the v0.2.0 tag (and some of it
   inside the v0.1.0 tag).
4. The GitHub release for v0.1.0 is not marked latest; v0.2.0 is.

## Consequences

- Each tag points to a commit that passed CI. Tags contain some not-yet-user-facing
  code from later milestones; this is documented in the CHANGELOG intro.
- From v0.3.0 on, the cto cuts the release as soon as a milestone is accepted, so tags
  and milestones line up again.

## Alternatives considered

- Tag both versions on the same commit: simpler, but v0.1.0 would include the playable
  lesson and its notes would be misleading.
- Release branches back-dated from older commits with their own version bumps: more
  process, and the bump commits would never be on `main`.
