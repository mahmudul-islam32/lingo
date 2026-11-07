# ADR-005: Client query cache holds raw facts; gamification hooks derive

- **Status:** Accepted
- **Date:** 2026-11-07
- **Ticket:** PM-003 (v0.3.0 technical notes)
- **Decider:** cto

## Context

In v0.3.0 three agents read the same on-device facts through TanStack Query: platform
(PLT-008 completed lessons, PLT-009 locked deep links), gamification (GAM-003 progress,
GAM-005 hearts, GAM-008 path) and lessons (LES-009 hearts, LES-010 results rows). If two
hooks put different shapes under the same query key (for example completed lesson ids and
full results under `["progress", courseId]`), whichever fetches last overwrites the other
and the UI breaks in ways no unit test catches.

## Decisions

1. **One shape per key, always the raw fact from the repository:**
   - `["progress", courseId]` → `LessonResult[]` (`ProgressRepository.listLessonResults`)
   - `["hearts"]` → `HeartsState` as stored (not refilled)
   - `["settings"]` → `Settings | null` (`ProfileRepository.findSettings`)
   - `["content", courseId]` → `Course`; `["lesson", courseId, lessonId]` → `Lesson`
2. **Derived values are never cached under these keys.** Hooks compute them with
   `select` or `useMemo` from the pure rules (`computeUserProgress`, `viewHearts`,
   `computePathNodes`). Query-option factories live with the feature that owns the rule
   (`src/features/gamification/data/queries.ts`) or the data layer (`src/lib/*`); a second
   factory for the same key must call the same repository method.
3. **Hearts are written optimistically.** `useLoseHearts` updates `["hearts"]` with
   `setQueryData` before `saveHearts` resolves, writes are serialised, and `["hearts"]` has
   `staleTime: Infinity` and no refetch on focus, so a refetch never undoes a pending loss.
   A failed save keeps the in-memory value (LES-009 / GAM-005).
4. **Time is a hook input, not cached.** `useLocalToday` / `useMinuteClock` provide
   `today` / `now`; changing them re-derives without refetching.

## Consequences

- Any agent can invalidate a key after a write and every consumer stays consistent.
- Slightly more computation per render (derivations are pure and cheap: 1,000 results
  < 50 ms, GAM-003).
- PLT-008's `useCompletedLessonIds` must be a `select` over `LessonResult[]`.
