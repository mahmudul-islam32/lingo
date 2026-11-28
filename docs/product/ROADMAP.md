# Polyglow Roadmap

**Owner:** pm · **Last updated:** 2026-11-28 (PM-014: v0.5.6 "Life in Germany topics" tickets
CON-005, CTO-023, GAM-016 written, topics go on Practice → `/topics`; FIX-015 shipped (#127);
v0.6.0 "Accounts and sync" tickets PLT-010 … PLT-018 written with CTO-025 (part A, local
Supabase) and CTO-024 (part B, owner's hosted project), owner items O1 … O5; build order
v0.6.0 part A first with v0.5.6 in parallel; PD-085 … PD-087). Before that 2026-11-27 (release acceptance PM-ACC6: v0.5.5 "Smart
review" ready for release, all eight tickets accepted incl. CTO-020; FIX-015 and CTO-021 are
non-blocking follow-ups, PD-083; exam-prep courses hidden at public launch unless cleared,
PLT-030 planned, PD-084). Before that 2026-11-26 (FIX-014 accepted, so PLT-027 is accepted and
v0.5.4 "Goal date" is ready for release; and PM-012: v0.5.5 "Smart review" tickets written,
CTO-019, GAM-015, LES-023, PLT-029; CTO-018 completed; GAM-014 and PLT-028 written; parallel
build plan; PD-079 … PD-082). Before that 2026-11-25 (release acceptance PM-ACC5: in v0.5.4 "Goal
date" CTO-017, GAM-013 and LES-022 are accepted, PLT-027 is rejected and FIX-014 blocks the
release; per-course goal plan CTO-018 added to v0.5.5; PD-077, PD-078). Before that
2026-11-21 (marketing proposals review: v0.5.4 "Goal date"
added with CTO-017, GAM-013, PLT-027, LES-022; v0.5.5 "Smart review", v0.5.6 "Life in Germany
topics" and v0.7.0 "Habit protection" planned; v1.0.0 and Phase 2/3 updated; PD-071, PD-072).
Before that 2026-11-20 (release acceptance PM-ACC4: v0.5.3 "Redesign"
ready for release; FIX-006 … FIX-011 ticket files; v0.5.2 marked released; PD-067 … PD-070).
Before that 2026-11-19 (v0.5.3 "Redesign" added: CTO-016, PLT-026,
GAM-012, LES-021, PD-066). Before that 2026-11-18 (v0.5.2 "Start level and earn hearts" added:
CTO-015, GAM-011, LES-020, PLT-025, PD-064, PD-065). Before that 2026-11-16 (v1.1.0 German B1 planned: CON-DE-B1-PLAN,
16 unit tickets, QA ticket, PD-056 … PD-063). Before that 2026-11-15 (release acceptance
PM-ACC3 for v0.3.0 … v0.5.0; one combined v0.5.0 release; accounts renumbered v0.6.0; cloze
to v0.5.1; B1 planning starts; PD-053 … PD-055) ·
**Source:** `PRD.md`, `user-stories.md`, decisions in `decisions.md` (PD-004 onward cover
this roadmap)

**Status values:** **open** = not merged on `main` yet · **merged** = on `main`, PM
acceptance pending or failed · **accepted** = on `main` and every criterion passed in the
"PM acceptance" section of the ticket. A milestone is **ready for release** when every
ticket in it is accepted; the cto then runs the release checklist.

Each milestone is a versioned release. The `cto` cuts the release when every ticket in it
has been merged and accepted (`ORCHESTRATOR.md`, step 6). Tickets live in
`docs/product/tickets/<ID>.md`. Tickets marked **(planned)** have reserved IDs but no ticket
file yet. The pm writes them when the previous milestone is close to done.

Owners: `dev-platform` (PLT-), `dev-lessons` (LES-), `dev-gamification` (GAM-), `pm` (CON-),
`cto` (CTO-).

---

## Phase 1 architecture (before v0.1.0)

**Goal:** the foundations every feature ticket depends on. Owned by the cto.

| ID | Title | Owner | Status |
|---|---|---|---|
| CTO-001 | Scaffold, tooling, CI | cto | Merged (#4) |
| CTO-002 | `ARCHITECTURE.md` and all contracts with zod schemas in `/src/contracts` | cto | Merged (on `main` b5f30ec) |
| CTO-003 | Supabase schema, RLS, seed (local/mock) | cto | Merged (on `main` b5f30ec) |
| CTO-004 | Shared UI primitives (Button, Card, ProgressBar, Modal, Toast) and design tokens | cto | Merged (on `main` b5f30ec) |

No PLT/LES/GAM ticket starts until CTO-002 is merged. Tickets that use UI also wait for
CTO-004.

---

## v0.1.0 — MVP foundation

**Milestone status: ready for release** (pm, 2026-11-12). Every ticket is accepted. Only
the cto release checklist remains (see below).

**Goal:** a new visitor can open Polyglow, install it, finish onboarding as a guest and
move around an accessible, branded app shell that still loads offline.

| ID | Title | Owner | Priority | Depends on | Status |
|---|---|---|---|---|---|
| PLT-001 | App shell, routing and bottom navigation | dev-platform | P0 | CTO-002, CTO-004 | accepted (2026-11-08) |
| PLT-002 | Installable PWA: manifest, icons, service worker, offline shell | dev-platform | P0 | PLT-001 | accepted (2026-11-08; AC8 manual DevTools check moves to the release PR) |
| PLT-003 | Guest mode: on-device learner profile | dev-platform | P0 | CTO-002 | accepted (2026-11-08) |
| PLT-004 | Onboarding: choose course and daily goal | dev-platform | P0 | PLT-001, PLT-003, GAM-001 (soft) | accepted (2026-11-08) |
| PLT-005 | Install prompt and app-update notification | dev-platform | P1 | PLT-002, CTO-004 | accepted (2026-11-12, #42) |
| PLT-006 | Offline indicator and `useOnlineStatus` hook | dev-platform | P1 | PLT-001 | accepted (2026-11-08; AC8 re-checked on the real `/lesson/*` route 2026-11-12) |
| GAM-001 | Lumi mascot component (4 static poses) | dev-gamification | P0 | CTO-004 | accepted (2026-11-08, incl. pm brand/originality check) |

**Still missing before v0.1.0 can be released.** No product blockers. Release checklist
only (cto, `ORCHESTRATOR.md` step 6):
1. The manual Chrome DevTools > Application > Manifest check on
   `npm run build && npm run start`, recorded in the release PR (PLT-002 AC8, PD-020).
2. CI green on the release commit, including the e2e job and the `pwa-prod` project
   (`update-toast.pwa.spec.ts` for PLT-005, `pwa.spec.ts`).
3. `CHANGELOG.md` and the version bump.

There are no FAIL items in v0.1.0, so it needs no fix tickets. Note for the cto: `main`
already contains v0.2.0 and part of v0.3.0, so a v0.1.0 tag on today's `main` would
include them. Whether to tag an earlier commit or cut v0.1.0 and v0.2.0 back to back from
the same commit is a release-process choice for the cto. Product-wise, both milestones are
accepted, so either is fine.

**Parallel build plan**
- Wave 1 (as soon as CTO-002 and CTO-004 are merged): **PLT-001**, **PLT-003**, **GAM-001**.
  These share no files.
- Wave 2: **PLT-002** and **PLT-006** (both need only PLT-001), **PLT-004** (needs PLT-001 and
  PLT-003; uses a placeholder image if GAM-001 isn't merged yet).
- Wave 3: **PLT-005** (needs PLT-002).
- While v0.1.0 is mostly platform work, `dev-lessons` and `dev-gamification` can start the
  v0.2.0 tickets that depend only on contracts: **LES-001**, **LES-004**, **LES-005**,
  **LES-006**, **GAM-002**. They stay in the v0.2.0 milestone; starting early is allowed.

---

## v0.2.0 — First playable lesson

**Milestone status: ready for release** (pm, 2026-11-12). Every ticket is accepted. Only
the cto release checklist remains (see below).

**Goal:** a guest goes from onboarding straight into Lesson 1 and plays a full lesson
(multiple choice, word-bank translation, match pairs, listening), with feedback,
re-queued mistakes and a results screen. Results are saved on the device.

| ID | Title | Owner | Priority | Depends on | Status |
|---|---|---|---|---|---|
| LES-001 | Answer checking (`checkAnswer`) | dev-lessons | P0 | CTO-002 | accepted (2026-11-08) |
| LES-002 | Lesson player: flow, progress bar, quit dialog, re-queue | dev-lessons | P0 | CTO-002, CTO-004, LES-001 | accepted (2026-11-08) |
| LES-003 | Correct / incorrect feedback panel | dev-lessons | P0 | LES-002, CTO-004 | accepted (2026-11-08) |
| LES-004 | Multiple-choice exercise | dev-lessons | P0 | CTO-002 | accepted (2026-11-08; real-content `lang` tagging depends on CON-002) |
| LES-005 | Translate exercise (word bank) | dev-lessons | P0 | CTO-002 | accepted (2026-11-08) |
| LES-006 | Match-pairs exercise | dev-lessons | P0 | CTO-002 | accepted (2026-11-08) |
| LES-007 | Listen exercise (word bank, normal and slow audio) | dev-lessons | P0 | CTO-002, LES-005 | accepted (2026-11-08) |
| LES-008 | Lesson results screen | dev-lessons | P0 | LES-002, GAM-002, PLT-008, CON-001 (e2e only) | accepted (2026-11-12; AC1, 10, 12 re-checked on the real route, e2e enabled) |
| GAM-002 | XP calculation (`calculateXp`) | dev-gamification | P0 | CTO-002 | accepted (2026-11-08) |
| PLT-007 | Course loading, lesson route and temporary lesson list | dev-platform | P0 | PLT-001, PLT-004, LES-002 | accepted (2026-11-12, #46; also verifies PLT-004 AC8's new target) |
| PLT-008 | Save lesson results on the device (also mounts `ResultsScreen`, PD-020) | dev-platform | P0 | PLT-003, PLT-007 | accepted (2026-11-12, #46; AC9 amended by PD-021) |
| CON-001 | Unit 1 content: 5 original lessons (en → es) | pm | P0 | CTO-002 | accepted (2026-11-12, re-review after CON-002) |
| CON-002 | Fix: multiple-choice prompts in English, options in Spanish (PD-019, course version 2) | pm | P0 | CON-001, LES-004 | accepted (2026-11-12, #36) |
| FIX-001 | Fix: Enter on a selected multiple-choice option checks the answer (LES-002 AC3 with real components) | dev-lessons | P0 | LES-002, LES-004 | accepted (2026-11-12, #37; ticket file written after the merge) |

**Still missing before v0.2.0 can be released.** No product blockers. Release checklist
only (cto):
1. CI green on the release commit, including the e2e job: `lesson-route.spec.ts`,
   `lessons-results.spec.ts` (no `test.fixme` left) and `lesson-offline.pwa.spec.ts`.
   The pm accepted these on code and test evidence. If any of them is red at release
   time, the release stops and the failure becomes a `fix/` ticket.
2. `CHANGELOG.md` and the version bump. The changelog should mention FIX-001.

Not blocking, already scheduled:
- `u1-l2-ex07` prompt capitalisation ("Where" → "where"): CON-004, v1.0.0.
- GAM-003 criterion 15 (hearts read error → full hearts, PD-021): v0.3.0, before GAM-003
  is accepted.
- An assertion that the offline lesson e2e shows no banner (PLT-006 nice-to-have): PLT-023,
  v1.0.0.

Releases go in order: v0.1.0 first, then v0.2.0.

**Parallel build plan**
- Wave 1 (contracts only): **LES-001**, **LES-004**, **LES-005**, **LES-006**, **GAM-002**,
  **CON-001**. Exercise components are built against the exercise-component props interface
  the cto defines in the Technical notes of LES-002, so they don't need the player to exist.
- Wave 2: **LES-002** (needs LES-001), **LES-007** (reuses the LES-005 word bank).
- Wave 3: **LES-003** (needs LES-002) and **PLT-007** (needs LES-002) in parallel.
- Wave 4: **PLT-008** (needs PLT-007), then **LES-008** (needs PLT-008 for saving; its e2e
  test needs CON-001).
- Speak is not in v0.2.0. It is P2 and comes in v1.0.0 (PD-006).

---

## v0.3.0 — Gamification loop

**Milestone status: merged, 1 fix open** (pm, 2026-11-15, PM-ACC3). 9 of 10 tickets are
accepted. GAM-003 failed criterion 15, so the hearts read error fallback goes to
**FIX-003**. Released inside the combined **v0.5.0** release, with no tag of its own (PD-054).

**Goal:** finishing a lesson visibly moves XP, the streak and the daily goal; hearts
create stakes; lessons unlock in order on the skill path.

The pure rules (XP, streak, hearts, daily goal) already shipped with GAM-002, so v0.3.0 is
about read/write hooks, UI and the skill path (PD-017).

| ID | Title | Owner | Priority | Depends on | Status |
|---|---|---|---|---|---|
| GAM-003 | XP totals and today's XP from saved results (`computeUserProgress`, `useUserProgress`, `useLocalToday`); new AC15: hearts read error → full hearts (PD-021) | dev-gamification | P0 | GAM-002, PLT-008 | merged; **AC15 FAIL → FIX-003** (2026-11-15) |
| GAM-004 | Streak status and `useStreak` hook (engine shipped in GAM-002) | dev-gamification | P0 | GAM-003 | accepted (2026-11-15) |
| GAM-005 | Hearts state, lose-hearts mutation and hearts meter | dev-gamification | P0 | GAM-002, PLT-003, PLT-008, CTO-004 | accepted (2026-11-15) |
| GAM-006 | Daily goal progress ring on Learn | dev-gamification | P0 | GAM-003, CTO-004 | accepted (2026-11-15) |
| GAM-007 | Top bar: streak, total XP, hearts | dev-gamification | P0 | GAM-003, GAM-004, GAM-005, CTO-004 | accepted (2026-11-15) |
| GAM-008 | Skill path screen (`computePathNodes`, node states, unlock in order, 0-hearts gate) | dev-gamification | P0 | GAM-003, GAM-005, PLT-007, CTO-004, CON-001 (e2e) | accepted (2026-11-15; AC6 names extended by FIX-002) |
| GAM-009 | Lumi reflects the streak (glowing / ember) | dev-gamification | P1 | GAM-001, GAM-004 | accepted (2026-11-15) |
| LES-009 | Hearts in the lesson player and "out of hearts" screen | dev-lessons | P0 | LES-002, LES-003, GAM-005 | accepted (2026-11-15; PM-note polish → FIX-005, P2) |
| LES-010 | Results screen: streak and daily-goal rows with celebration | dev-lessons | P1 | LES-008, GAM-003, GAM-004 | accepted (2026-11-15) |
| PLT-009 | Mount the gamification loop on Learn and the lesson route (replaces the temporary list, locked deep links, loop e2e) | dev-platform | P0 | GAM-006, GAM-007, GAM-008, GAM-009, LES-009, LES-010, PLT-007, PLT-008 | accepted (2026-11-15) |
| FIX-002 | Path: accessible names contain the visible text (WCAG 2.5.3); scroll by position (no ticket file, found in code) | dev-gamification | P1 | GAM-008 | merged, effect verified in PM-ACC3 |
| FIX-003 | Hearts read error must not hide XP, streak, goal and path progress (GAM-003 AC15) | dev-gamification | P0 | GAM-003, GAM-005 | **open** |

**Parallel build plan**
- Wave 1 (as soon as v0.2.0's PLT-008 is merged): **GAM-003** and **GAM-005**
  (independent files; one-line barrel conflicts only). The pure `computePathNodes` part
  of **GAM-008** (criteria 1–3) needs only contracts and can start here too.
  dev-lessons can start **LES-009** against stubs of the GAM-005 hook signatures.
- Wave 2: **GAM-004**, **GAM-006** (need GAM-003), the **GAM-008** screen (needs GAM-003 +
  GAM-005), and **LES-009** with the real hooks (needs GAM-005).
- Wave 3: **GAM-007** (needs GAM-003/004/005), **GAM-009** (needs GAM-004) and **LES-010**
  (needs GAM-003/004). These three touch different folders.
- Wave 4: **PLT-009** (composes everything; can stub while the last tickets are in review).
- Across agents: dev-gamification carries the critical path (GAM-003 → GAM-004 →
  GAM-007). dev-lessons works on LES-009 then LES-010. dev-platform is free until PLT-009.
  The v0.4.0 early start (PLT-010, PLT-012) is withdrawn: v0.4.0 is paused (PD-036). Once
  CTO-008 is merged, dev-platform, dev-lessons and dev-gamification take PLT-024, LES-014
  and GAM-010 from v0.3.1.

---

## German track (current priority, PD-030, PD-036)

The owner moved the product to **German**: English → German (`en-de`), CEFR A1 → C1, A1
first. Market: `market-analysis-german.md`. Curriculum and content standard (CDS-1…13):
`curriculum-german.md`. The Spanish course stays in the codebase but is hidden from
onboarding (PD-030).

Order of work: v0.3.0 finishes as planned (German needs the path, hearts and XP), and the
German tech tickets can start **now** in parallel because they touch other files or come
after GAM-008 / PLT-009. ~~v0.4.0 is paused until v0.3.3 ships.~~ **Update 2026-11-15
(PD-054):** every German milestone through v0.5.0 is merged on `main`. They ship as **one
combined v0.5.0 release** once these are done:
1. LES-014 (#55) is merged and re-checked by the pm.
2. FIX-003 is merged.
3. The A2 QA branch `docs/con-de-a2-qa` is merged.
4. The FIX-004 playthrough passes.

The accounts milestone resumes now as **v0.6.0** (formerly v0.4.0).

**Release checklist (cto, after the four items above):**
1. CI green on the release commit, including e2e and `pwa-prod`.
2. `CHANGELOG.md` 0.5.0 with one block per milestone (v0.3.0, v0.3.1–v0.3.3, v0.5.0), an
   ADR-007-style note that v0.3.x weren't tagged on their own, and FIX-002 / FIX-003 under
   Fixed.
3. `package.json` `0.2.0 → 0.5.0`.
4. Tag `v0.5.0`.

### v0.3.1 — German A1, part 1: course support + Units 1–4

**Milestone status: merged except LES-014** (pm, 2026-11-15, PM-ACC3). 7 of 8 accepted.
LES-014 is pending PR #55. Released inside v0.5.0 (PD-054).

**Goal:** a new visitor is onboarded into German and can play A1 Units 1–4 on a path
grouped by CEFR level.

| ID | Title | Owner | Priority | Depends on | Status |
|---|---|---|---|---|---|
| CTO-008 | German course support: CEFR level layer, course registry, `en-de` default, German normalisation tests, speech locale | cto | P0 | CTO-002 | accepted (2026-11-15, #52; AC21 answered by PD-055) |
| PLT-024 | German course in onboarding and Learn (registry, preselect, lesson route across courses, Spanish guests unchanged) | dev-platform | P0 | CTO-008, CON-DE-A1-01, PLT-009 (soft) | accepted (2026-11-15, #56) |
| GAM-010 | Skill path with CEFR levels and many units (level/unit headers, collapse, "Coming soon") | dev-gamification | P0 | CTO-008, GAM-008 | accepted (2026-11-15, #57) |
| LES-014 | German in the lesson player (de-DE speech fallback, authored-case tiles, long words at 375 px) | dev-lessons | P0 | CTO-008, LES-007 | **open** (PR #55; every AC "PASS pending #55", re-check after merge) |
| CON-DE-A1-01 | A1 Unit 1 "Hello!" (creates `en-de/course.json`) | pm | P0 | CTO-008 | accepted (2026-11-15, #53) |
| CON-DE-A1-02 | A1 Unit 2 "Where Are You From?" | pm | P0 | CON-DE-A1-01 | accepted (2026-11-15, #53) |
| CON-DE-A1-03 | A1 Unit 3 "Numbers and Letters" | pm | P0 | CON-DE-A1-02 | accepted (2026-11-15, #53; letter audio checked in FIX-004) |
| CON-DE-A1-04 | A1 Unit 4 "At the Bakery" | pm | P0 | CON-DE-A1-03 | accepted (2026-11-15, #53) |

**Parallel build plan**
- Wave 1: **CTO-008**. Meanwhile the pm drafts CON-DE-A1-01 lesson files against today's
  `LessonSchema` (unchanged) and adds the manifest once CTO-008 is merged.
- Wave 2 (after CTO-008): **PLT-024**, **GAM-010**, **LES-014** in parallel (three different
  folders), and **CON-DE-A1-01 → 04** in sequence (pm).
- Wave 3: PLT-024's e2e test with real German content (needs CON-DE-A1-01).

### v0.3.2 — German A1, part 2: Units 5–8

**Milestone status: accepted** (pm, 2026-11-15, PM-ACC3). Released inside v0.5.0 (PD-054).

| ID | Title | Owner | Priority | Depends on | Status |
|---|---|---|---|---|---|
| CON-DE-A1-05 | A1 Unit 5 "At the Supermarket" | pm | P0 | CON-DE-A1-04 | accepted (2026-11-15, #53) |
| CON-DE-A1-06 | A1 Unit 6 "Family and Friends" | pm | P0 | CON-DE-A1-05 | accepted (2026-11-15, #53) |
| CON-DE-A1-07 | A1 Unit 7 "My Day" | pm | P0 | CON-DE-A1-06 | accepted (2026-11-15, #53) |
| CON-DE-A1-08 | A1 Unit 8 "Free Time" | pm | P0 | CON-DE-A1-07 | accepted (2026-11-15, #53) |

Content only. Devs pick up any `fix/` tickets from the v0.3.1 review, then v0.3.0 / v0.3.1
leftovers. dev-platform may start **PLT-015** groundwork (offline caching for many lessons)
only if it doesn't touch accounts.

### v0.3.3 — German A1, part 3: Units 9–12 + QA ("German A1 complete")

**Milestone status: merged, 1 fix open** (pm, 2026-11-15, PM-ACC3). 4 of 5 accepted.
CON-DE-A1-QA criterion 7 (per-unit playthrough at 375 × 667 with the German voice) failed
and goes to **FIX-004**, which runs after #55. Released inside v0.5.0 (PD-054).

| ID | Title | Owner | Priority | Depends on | Status |
|---|---|---|---|---|---|
| CON-DE-A1-09 | A1 Unit 9 "By Bus and Train" | pm | P0 | CON-DE-A1-08 | accepted (2026-11-15, #53) |
| CON-DE-A1-10 | A1 Unit 10 "The New Flat" | pm | P0 | CON-DE-A1-09 | accepted (2026-11-15, #53) |
| CON-DE-A1-11 | A1 Unit 11 "At the Doctor's" | pm | P0 | CON-DE-A1-10 | accepted (2026-11-15, #53) |
| CON-DE-A1-12 | A1 Unit 12 "Offices and Work" (incl. A1 checkpoint lesson) | pm | P0 | CON-DE-A1-11 | accepted (2026-11-15, #53) |
| CON-DE-A1-QA | A1 content QA pass over all 60 lessons | pm | P0 | CON-DE-A1-01…12, LES-014, GAM-010, PLT-024 | merged (#54); **AC7 FAIL → FIX-004** |
| FIX-004 | A1 playthrough at 375 × 667 with the German voice (12 lessons + checkpoint, letters, 9 changed listens) | pm (orchestrator's browser run) | P0 | #55, FIX-003, A2 QA merge | **open** (release gate) |

~~When v0.3.3 is released, v0.4.0 resumes and v0.5.0 German A2 starts in parallel.~~ A2 was
written and merged in parallel (#59–#63). Accounts resume now as **v0.6.0** (PD-054).

### v0.5.0 — German A2 ("German A2 complete")

**Milestone status: merged except the QA pass** (pm, 2026-11-15, PM-ACC3).
- **Accepted:** CON-DE-A2-01 … 14 (#60–#63) and LES-013 (#58), all on 2026-11-15.
- **CON-DE-A2-QA:** PASS pending the merge of `docs/con-de-a2-qa`. The German-voice part of
  its criterion 11 is pending #55.
- **CTO-009 and LES-015:** not started; they move to **v0.5.1** (PD-049, PD-054).
- **Release:** v0.5.0 is cut as the combined release for v0.3.0 … v0.5.0 once the four
  items in the German track section are done.

**Goal:** a learner who finished A1 can play all of A2 (14 units, 70 lessons, ~460 new items,
PD-045, PD-046) on the path under "A2 · Elementary", with a grammar tip before each lesson,
and finish with the A2 checkpoint. Plan: `curriculum-german.md` §4b; content standard
CDS-1 … CDS-19 (§7).

| ID | Title | Owner | Priority | Depends on | Wave |
|---|---|---|---|---|---|
| CON-DE-A2-01 | A2 Unit 1 "Weather and Seasons" (`im` + month, `aber / oder / denn`) | pm (writer 1) | P0 | CON-DE-A1-QA | 1 |
| CON-DE-A2-02 | A2 Unit 2 "How Was Your Weekend?" (`war / hatte`, Perfekt with `haben`) | pm (writer 2) | P0 | appendix of 01 | 1 |
| CON-DE-A2-03 | A2 Unit 3 "Holiday Stories" (Perfekt with `sein`, accusative pronouns / prepositions) | pm (writer 3) | P0 | appendices of 01–02 | 1 |
| CON-DE-A2-04 | A2 Unit 4 "Gifts and Celebrations" (dative: articles, pronouns, verbs) | pm (writer 4) | P0 | appendices of 01–03 | 1 |
| CON-DE-A2-05 | A2 Unit 5 "Errands in Town" (dative prepositions, hundreds, years) | pm (writer 1) | P0 | appendices of 01–04 | 2 |
| CON-DE-A2-06 | A2 Unit 6 "Clothes and Shopping" (basic adjective endings) | pm (writer 2) | P0 | appendices of 01–05 | 2 |
| CON-DE-A2-07 | A2 Unit 7 "Health and Sport" (reflexive verbs, `du / ihr` imperative, `sollen`) | pm (writer 3) | P0 | appendices of 01–06 | 2 |
| CON-DE-A2-08 | A2 Unit 8 "Appointments and Phone Calls" (past modals, `weil`, minutes) | pm (writer 4) | P0 | appendices of 01–07 | 2 |
| CON-DE-A2-09 | A2 Unit 9 "At Home and the Neighbours" (two-way prepositions) | pm (writer 1) | P0 | appendices of 01–08 | 3 |
| CON-DE-A2-10 | A2 Unit 10 "Train and Hotel" (`auf / von Gleis`, `Bahnsteig`, delay minutes) | pm (writer 2) | P0 | appendices of 01–09 | 3 |
| CON-DE-A2-11 | A2 Unit 11 "Work and Job Search" (`dass`) | pm (writer 3) | P0 | appendices of 01–10 | 3 |
| CON-DE-A2-12 | A2 Unit 12 "Offices and Letters" (`wenn`, `deshalb / trotzdem`, `ob`) | pm (writer 4) | P0 | appendices of 01–11 | 3 |
| CON-DE-A2-13 | A2 Unit 13 "Media and Comparisons" (comparative, superlative) | pm (writer 1) | P0 | appendices of 01–12 | 4 |
| CON-DE-A2-14 | A2 Unit 14 "Plans and the Future" (`werden`) + A2 checkpoint | pm (writer 2) | P0 | appendices of 01–13 | 4 |
| CON-DE-A2-QA | A2 content QA pass over all 70 lessons | pm | P0 | CON-DE-A2-01…14 | 5 |
| LES-013 | Lesson tip card (moved from v1.0.0, PD-050) | dev-lessons | P1 | LES-002, LES-014 | any |
| ~~CTO-009~~ | Contract for a `cloze` exercise type: **moved to v0.5.1** (PD-054) | cto | P1 | CTO-008 | — |
| ~~LES-015~~ | Cloze exercise component: **moved to v0.5.1** (PD-054) | dev-lessons | P1 | CTO-009, LES-002, LES-003, LES-014 | — |

Status per ticket (2026-11-15): CON-DE-A2-01 … 14 **accepted**; CON-DE-A2-QA **open** (branch
`docs/con-de-a2-qa`, every criterion PASS pending merge); LES-013 **accepted**.

### v0.5.1 — A2 cloze follow-up (planned)

**Goal:** endings and prepositions get a faster, focused drill: a cloze exercise type plus
1–2 cloze exercises in the A2 lessons that drill them.

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-009 | Contract for a `cloze` exercise type (PD-049) | cto | P1 | CTO-008 |
| LES-015 | Cloze exercise component | dev-lessons | P1 | CTO-009, LES-002, LES-003, LES-014 |
| CON-DE-A2-CLZ (planned) | 1–2 cloze exercises in A2 U4, U6, U9, U10 lessons, new ids only | pm | P1 | LES-015 merged |

Runs in parallel with v0.6.0. It doesn't block v1.0.0. If it isn't done by then, it moves to
v1.1.0, where B1 needs cloze anyway.

**Parallel build plan (4 writers per wave, PD-052)**
- **Wave 1:** CON-DE-A2-01, 02, 03, 04 in parallel. Each writer uses only A1 and the
  appendices of earlier units (all appendices are fixed in the tickets), never the other
  writers' lesson files.
- **Wave 2:** CON-DE-A2-05, 06, 07, 08. Starts when wave 1's self-reviews are in, so any
  vocabulary requests from wave 1 are settled first (the pm amends the appendices if needed).
- **Wave 3:** CON-DE-A2-09, 10, 11, 12.
- **Wave 4:** CON-DE-A2-13 and 14 (writers 1–2). Writers 3–4 start the cross-unit
  consistency pass for CON-DE-A2-QA criterion 1 on waves 1–3 (vocabulary additions list,
  coverage-map counts), which the QA ticket then completes.
- **Wave 5:** CON-DE-A2-QA (pm), including the playthrough on the preview with LES-013.
- Units are merged into `course.json` in unit order by the orchestrator; a partially
  merged A2 is playable because the path shows the merged A2 units under the A2 header.
- **Dev work** runs alongside v0.4.0: **LES-013** first (P1, A2 depends on tips being
  visible; must be merged before the A2 QA playthrough), then **CTO-009 → LES-015** if
  capacity allows. Neither cloze ticket blocks the v0.5.0 release; if they slip, they move
  to the next milestone and the cloze content follow-up waits with them.
- **Ready for release** when CON-DE-A2-01…14, CON-DE-A2-QA and LES-013 are accepted. As the
  combined release (PD-054) it also needs LES-014 (#55), FIX-003 and FIX-004.

### v0.5.2 — Start level and earn hearts (planned 2026-11-18, PD-064, PD-065)

**Milestone status: released** as 0.5.2 on 2026-11-19 (`CHANGELOG.md`, with v0.5.1 and
FIX-005 … FIX-007; status corrected in PM-ACC4). Owner request of 2026-11-18; design in
ADR-013. The three feature tickets start in parallel from the ADR once CTO-015 is merged.

**Goal:** a learner can start at A2 instead of A1 (onboarding, path "Start here", Profile),
and correct answers earn hearts back, so practising a finished lesson (free, also at 0
hearts) replaces waiting for the 4-hour refill.

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-015 | Contract for `settings.startLevel`, path start level, heart gains and the practice flag (ADR-013) | cto | P1 | — |
| GAM-011 | Path start level, "Start here", `gainHearts` rule and hook, 0-hearts gate for completed lessons | dev-gamification | P1 | CTO-015, GAM-008 |
| LES-020 | Earn a heart per correct Check, free practice, out-of-hearts copy | dev-lessons | P1 | CTO-015, GAM-011, LES-009 |
| PLT-025 | Onboarding "Where do you want to start?", Profile start level, lesson route with start level and practice | dev-platform | P1 | CTO-015, GAM-011, LES-020 |

LES-016 … LES-019 are reserved (PD-055, CTO-010), so the lessons ticket is LES-020. Runs in
parallel with v0.5.1 and v0.6.0; it doesn't block v1.0.0. **Ready for release** when the four
tickets are accepted.

### v0.5.3 — Redesign (planned 2026-11-19, PD-066)

**Milestone status: ready for release** (2026-11-20, PM-ACC4,
`tickets/PM-ACC4-v0.5.3-acceptance.md`). All four tickets are **accepted** on `main`
`053a37b`, as are the review fixes FIX-008 (Practice test clock), FIX-009 (path header vs. top
bar) and FIX-010 (results streak once, gold goal bar, audio timeout). Accepted deviations:
PD-067 … PD-069. CTO-016 AC 1 (design README) moves to **FIX-011** (cto, P2, not blocking,
PD-070). Release PR #94. Owner design of 2026-11-19 (brief and 8 reference screens, copied
to `docs/design/v2/` by CTO-016). Polyglow and Lumi stay; the design's "parla" name and logo
are not used.

**Goal:** every screen matches the owner's v2 design (light theme, Bricolage Grotesque + DM
Sans, indigo / coral palette, 3D cards and buttons, 4-tab nav Learn / Practice / Leagues /
Profile) with **no behaviour change**; Practice lists real finished lessons (PD-065), Leagues
shows an honest "arrives with accounts" state, Profile shows only real stats.

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-016 | Design system v2: tokens, fonts, shared components (Button 3D, Card, ProgressBar, StatTile, Chip, OptionCard), `docs/design/v2` references | cto | P1 | — |
| PLT-026 | Onboarding (screen 1), app shell + 4-tab nav, Profile (screen 8) with "XP this week", settings rows, offline banner / 404 / install card | dev-platform | P1 | CTO-016 |
| GAM-012 | Learn path (screen 2), level headers + "Start here", Practice tab, Leagues "arrives with accounts", hearts dialog | dev-gamification | P1 | CTO-016, PLT-026 |
| LES-021 | Lesson player (screens 3–6): header, MC 2 × 2, word bank, listen, match, cloze, feedback sheets, tip card, out-of-hearts, results | dev-lessons | P1 | CTO-016 |
| FIX-008 | Practice tab test uses a fixed clock (accepted) | dev-gamification | P1 | GAM-012 |
| FIX-009 | Path auto-scroll keeps headers clear of the top bar (accepted) | dev-gamification | P1 | GAM-012 |
| FIX-010 | Results streak line once, gold goal bar, audio load timeout (accepted) | dev-lessons | P1 | LES-021 |
| FIX-011 | `docs/design/v2/README.md` screen → ticket map (open, **not blocking**, PD-070) | cto | P2 | CTO-016 |

CTO-016 goes first; PLT-026 and LES-021 then run in parallel, GAM-012 starts once PLT-026's
routes and nav are merged. Runs after v0.5.2 and in parallel with v0.5.1 and v0.6.0; it
doesn't block v1.0.0. **Ready for release** when the four tickets are accepted.

### v0.5.4 — Goal date (planned 2026-11-21, PD-071)

**Milestone status: ready for release** (2026-11-26, FIX-014 re-check; PM-ACC5,
`tickets/PM-ACC5-v0.5.4-acceptance.md`). FIX-014 (#112, `main` 96a1948) is **accepted**
(7 of 7 PASS; cto e2e 156/156), so PLT-027 now counts as **accepted** and every ticket is
accepted. Only the cto release checklist remains (`chore/release-v0.5.4`). History: on
2026-11-25 PLT-027 was rejected on AC 10 (a dead "Set a goal date" link on courses without
levels) and FIX-014 blocked the release (PD-077). The single
global plan ships as built; per-course plans follow in v0.5.5 (CTO-018, PD-078). Marketing
proposal #1, accepted in PD-071. Needs no backend.

**Goal:** a learner can set a target level and date in Profile; Learn shows lessons left,
days to go and whether the daily goal gets them there, with a one-tap suggested goal; the
results screen shows lessons left. Free (PD-072). Kind copy, no exam names (PD-035).

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-017 | Contract: `settings.goalPlan`, `GoalPlanStatus`, `computeGoalPlan` signature, `goalPlanMaxDays` (accepted) | cto | P1 | CTO-015 |
| GAM-013 | `computeGoalPlan` rule, `useGoalPlan` hook, `GoalPlanCard` (5 statuses + no-plan link) (accepted) | dev-gamification | P1 | CTO-017, GAM-003, GAM-006, GAM-011 |
| PLT-027 | Profile "Goal date" row and dialog, Learn card mount, suggested-goal wiring, results wiring, e2e (accepted 2026-11-26 through FIX-014; rejected on AC 10 on 2026-11-25) | dev-platform | P1 | CTO-017, GAM-013, LES-022 (AC 13), PLT-025, PLT-026 |
| LES-022 | Results screen goal-date row (accepted) | dev-lessons | P2 | CTO-017, LES-021 |
| FIX-014 | No goal-date card or link on Learn for courses without levels (accepted 2026-11-26, #112, PD-077) | dev-platform | P1 | PLT-027, GAM-013 |

**Parallel build plan:** CTO-017 first. Then GAM-013 and LES-022 in parallel (different
folders). PLT-027 can build the Profile row and dialog against the contract at once and
mounts the card and the results prop when GAM-013 and LES-022 are merged. Runs in parallel
with v0.6.0 (blocked on the owner's hosted Supabase); doesn't block v1.0.0. **Ready for
release** since 2026-11-26: FIX-014 is accepted, so PLT-027 counts as accepted.

### v0.5.5 — Smart review (tickets written 2026-11-26, PM-012; PD-071, PD-078 … PD-082)

**Milestone status: ready for release** (2026-11-27, PM-ACC6,
`tickets/PM-ACC6-v0.5.5-acceptance.md`). All eight tickets are **accepted** on `main`
`6bb29a4` (cto e2e 164/164 on a production build, mobile-chrome / desktop-chrome / pwa-prod).
PLT-029 AC 10 ("Back" label on the review error state) moved to **FIX-015** (P2, not
blocking, PD-083). The deprecated `SettingsPatch.goalPlan` is removed by **CTO-021** before
v0.6.0 sync (not blocking). Only the cto release checklist remains (`chore/release-v0.5.5`).
Local only; needs no backend.

**Goal:** Practice gets a "Review" session built from the exercises the learner already
answered and got wrong or hasn't seen for a while (spaced repetition: 1, 3, 7, 14, 30 days),
up to 10 exercises, free with no daily cap, at 0 hearts too, earning hearts like practice
(PD-065) and XP like a lesson (PD-079). No new content. In the same milestone, each course
gets its own goal plan (PD-078) before v0.6.0's settings sync.

**Smart review (PD-079 … PD-081):**

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-019 | Per-exercise outcomes on `LessonResult`, review-result kind, `ReviewItem`, `SelectReviewItems`, `reviewSessionSize`, `reviewIntervalsDays`, `REVIEW_EXERCISE_TYPES`, Supabase column (accepted 2026-11-27, #115) | cto | P1 | CTO-015, CTO-018 |
| GAM-015 | `selectReviewItems` rule, review results count XP but never complete a lesson, `useReviewQueue`, Practice "Review" card (accepted 2026-11-27, #119) | dev-gamification | P1 | CTO-019, GAM-012 |
| LES-023 | Outcomes in every finished result, review mode in the player (practice rules, "Review" label), review results screen ("Review more") (accepted 2026-11-27, #116) | dev-lessons | P1 | CTO-019, LES-020, LES-021, LES-022 |
| PLT-029 | `/review` route (load items, empty / error / offline), save outcomes with the result, guest-migration payload, e2e (accepted 2026-11-27, #120; AC 10 → FIX-015) | dev-platform | P1 | CTO-019, GAM-015, LES-023, PLT-025 |
| CTO-020 | Exercise-id uniqueness documented as a review guarantee (content test, contracts, ADR-019 §5) (accepted 2026-11-27, #123; ticket file written after the merge) | cto | P1 | CTO-008, CTO-019 |
| FIX-015 | The review error state says "Back", not "Back to Learn" (**shipped**, merged #127; carried into v0.5.6, PD-083) | dev-lessons (+ one line dev-platform) | P2 | LES-023, PLT-029 |

**Per-course goal plan (PD-078, PD-082), contract first:**

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-018 | A goal plan per course: contract, stored-data migration, `goalPlanFor` selector, Supabase column, LWW note (accepted 2026-11-27, #114) | cto | P1 | CTO-017, FIX-014 |
| GAM-014 | `useGoalPlan({ courseId })` reads that course's plan (accepted 2026-11-27, #117) | dev-gamification | P1 | CTO-018, GAM-013 |
| PLT-028 | Profile row and dialog read / write the active course's plan; results row uses the lesson's course; switch-course e2e (accepted 2026-11-27, #118) | dev-platform | P1 | CTO-018, GAM-014, FIX-014 |
| CTO-021 | Remove the deprecated `SettingsPatch.goalPlan` write path (ADR-018 §5). Not blocking v0.5.5; **must merge before PLT-010 / PLT-014** (PD-083). **Done** (on `main` before v0.6.0 starts, recorded in PM-014) | cto | P1 | PLT-028 |

CTO-018 must merge **before** v0.6.0's settings sync (PLT-010 / PLT-014). Done (#114).

**Parallel build plan**
- **Wave 0 (cto, one session, in order):** **CTO-018**, then **CTO-019** (both edit
  `user.ts` / `config.ts` / `api.ts` and the Supabase schema; two PRs, merged in that order).
  FIX-014 must be merged first (v0.5.4).
- **Wave 1 (after CTO-018):** **GAM-014** (dev-gamification, small) and **PLT-028**
  (dev-platform; can build against the selector and stub the hook until GAM-014 merges).
- **Wave 2 (after CTO-019):** **GAM-015** (dev-gamification, after GAM-014) and **LES-023**
  (dev-lessons) in parallel: different folders, both only need the contract. dev-platform
  starts **PLT-029**'s storage part (criteria 1–4) at the same time.
- **Wave 3:** **PLT-029**'s route and e2e once GAM-015 and LES-023 are merged (it may build
  the route against stubs of `useReviewQueue` and the review player props from the ADR).
- **Across agents:** dev-platform carries the critical path (PLT-028 → PLT-029); dev-lessons
  has one ticket; dev-gamification has GAM-014 → GAM-015. Nothing in v0.5.5 waits on the
  owner.
- **Ready for release** when the seven tickets are accepted. v0.5.5 doesn't block v1.0.0;
  CTO-018 (and in practice CTO-019, whose outcomes ride on synced results) must be on `main`
  before PLT-010 / PLT-014 start. **Met on 2026-11-27** (PM-ACC6), with CTO-020 as an eighth
  accepted ticket.

**Release checklist (cto):** CI green on the release commit (e2e incl. `pwa-prod`);
`CHANGELOG.md` 0.5.5 (Smart review, per-course goal plans; note that review history starts
empty and fills as learners finish lessons, PD-080; FIX-015 listed as known); `package.json`
`0.5.4 → 0.5.5`; tag `v0.5.5`. Supabase migrations stay un-run on hosted Supabase.

### v0.5.6 — Life in Germany topics (tickets written 2026-11-28, PM-014; PD-071, PD-085, PD-086)

**Milestone status: open.** Tickets written; builds in parallel with v0.6.0 part A (PD-085).
Local only; needs no backend.

**Goal:** a "Life in Germany" screen (`/topics`, opened from a card on the **Practice** tab,
PD-086) with 7 topics (registering your address, at the doctor's, at the supermarket, bus and
train, your flat, work, letters and forms). Each topic lists its existing A1 / A2 lessons with
the same path state as Learn (Done / Up next / Open / Locked); **locked lessons stay locked**
(PD-064). No new content. Public topic landing pages wait for the public URL (v1.0.0).

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| FIX-015 | Review error state says "Back" (**shipped**, merged #127; PM acceptance with this release) | dev-lessons (+ one line dev-platform) | P2 | LES-023, PLT-029 |
| CTO-023 | Topics as course data? ADR-021, strict topic schema, content test (lesson ids exist, ≤ 2 topics a lesson), loader + query key, fixture | cto | P1 | CTO-008 |
| CON-005 | Map 7 topics to existing `en-de` A1 / A2 lessons (draft mapping in the ticket; verify, then write the data file) | pm | P1 | CTO-023 (data file only) |
| GAM-016 | Practice "Life in Germany" card, `/topics` screen with disclosure rows and each lesson's path state; dev-platform adds the route file (criterion 16) | dev-gamification (+ one file dev-platform) | P1 | CTO-023, GAM-011, GAM-012; CON-005 for real data |

**Parallel build plan** (see also the combined plan under v0.6.0):
- **Now:** the pm verifies the CON-005 mapping (criteria 1–5) against the lesson files.
- **cto:** CTO-023 right after CTO-025, in the same run (PD-085).
- **After CTO-023:** GAM-016 (dev-gamification) builds against the CTO-023 fixture; the pm
  writes the CON-005 data file. dev-platform adds the `/topics` route file between two PLT
  tickets.
- **Ready for release** when CTO-023, CON-005 and GAM-016 are accepted and FIX-015 passes its
  acceptance. Doesn't wait for v0.6.0 and doesn't block v1.0.0.

### Later German levels (planned)

| Milestone | Content | Content tickets (planned) | Tech needed (planned, curriculum §6) |
|---|---|---|---|
| **v0.5.0 — German A2** | See the section above | CON-DE-A2-01 … 14, CON-DE-A2-QA | LES-013 (tip card), CTO-009 + LES-015 (cloze, non-blocking, PD-049). Gender choice = one-gap cloze; reverse MC and grammar note card not needed for A2 |
| **v0.5.1 — A2 cloze follow-up** (planned) | 1–2 cloze exercises in A2 lessons drilling endings and prepositions (U4, U6, U9, U10), new ids only | CON-DE-A2-CLZ (planned) | CTO-009 + LES-015 (see the v0.5.1 section) |
| **v1.1.0 — German B1** (**planned**, PD-056 … PD-063) | 16 units, 80 lessons, ~510 appendix entries (PD-057) | CON-DE-B1-PLAN, CON-DE-B1-01 … 16, CON-DE-B1-QA | None blocking (PD-060): cloze, typed answers (PD-033), reading passage, note card are follow-ups; B1-T5 fit check |
| **v1.2.0 — German B2** | 18 units, ~90 lessons, ~1,500 items | CON-DE-B2-01 … 18, CON-DE-B2-QA | Longer listening comprehension, guided writing (TBD), healthcare elective path |
| **v1.3.0 — German C1** | 18 units, ~90 lessons, ~1,500 items | CON-DE-C1-01 … 18, CON-DE-C1-QA | Academic reading and register exercises, academic elective path |

Public launch (v1.0.0) ships with **A1 + A2** (PD-036). A native-speaker review of A1 and A2
is blocking for v1.0.0 (PD-038).

### v1.1.0 — German B1 (planned 2026-11-16, PD-056 … PD-063)

**Milestone status: planned.** CON-DE-B1-PLAN is written (branch
`docs/pm-007-german-b1-plan`); the 16 unit tickets and the QA ticket exist with fixed
appendices. Writing can start once the plan is merged and the B1-T5 fit check is done
(PD-063).

**Goal:** a learner who finished A2 can play all of B1 (16 units, 80 lessons, ~510 new
appendix entries, PD-056, PD-057) under "B1 · Intermediate", with a grammar tip before each
lesson, and finish with the 16-exercise B1 checkpoint. Plan: `curriculum-german.md` §4c;
content standard CDS-1 … CDS-28 (§7).

**Merge rule (PD-063):** B1 writing no longer waits for CON-DE-NR, but no B1 file reaches
`main` before **v1.0.0 is tagged**. Unit PRs stay open until then; after CON-DE-NR the pm
runs the native-review delta (CON-DE-B1-QA criterion 13).

| ID | Title | Owner | Priority | Depends on | Wave |
|---|---|---|---|---|---|
| CON-DE-B1-PLAN | B1 plan: §4c, size, CDS-20 … 28, tech needs list, 16 unit tickets + QA ticket | pm | P1 | CON-DE-A2-QA merged | 0 |
| CON-DE-B1-01 | B1 Unit 1 "Could You Help Me?" (polite Konjunktiv II, indirect questions) | pm (writer 1) | P0 | CON-DE-B1-PLAN, B1-T5 check | 1 |
| CON-DE-B1-02 | B1 Unit 2 "Life Stories" (Präteritum, `als / wenn`) | pm (writer 2) | P0 | appendix of 01 | 1 |
| CON-DE-B1-03 | B1 Unit 3 "People Around Me" (relative clauses nom. / acc.) | pm (writer 3) | P0 | appendices of 01–02 | 1 |
| CON-DE-B1-04 | B1 Unit 4 "Everyday Work" (verbs with prepositions, `wo- / da-`) | pm (writer 4) | P0 | appendices of 01–03 | 1 |
| CON-DE-B1-05 | B1 Unit 5 "Learning for Life" (zu-infinitive, `um … zu`) | pm (writer 1) | P0 | appendices of 01–04, wave 1 scripts | 2 |
| CON-DE-B1-06 | B1 Unit 6 "Renting a Flat" (dative / prepositional relatives, dative endings) | pm (writer 2) | P0 | appendices of 01–05 | 2 |
| CON-DE-B1-07 | B1 Unit 7 "Doctors and Hospitals" (n-declension, dative reflexive) | pm (writer 3) | P0 | appendices of 01–06 | 2 |
| CON-DE-B1-08 | B1 Unit 8 "Orders and Complaints" (`obwohl`, `damit`) | pm (writer 4) | P0 | appendices of 01–07 | 2 |
| CON-DE-B1-09 | B1 Unit 9 "Environment and the City" (passive present, `lassen`) | pm (writer 1) | P0 | appendices of 01–08, wave 2 scripts | 3 |
| CON-DE-B1-10 | B1 Unit 10 "If I Had More Time" (Konjunktiv II in full, `sollte`) | pm (writer 2) | P0 | appendices of 01–09 | 3 |
| CON-DE-B1-11 | B1 Unit 11 "Letters from the Authorities" (genitive, `wegen / trotz / während`) | pm (writer 3) | P0 | appendices of 01–10 | 3 |
| CON-DE-B1-12 | B1 Unit 12 "News and Reports" (passive Präteritum, Plusquamperfekt, `nachdem / bevor`) | pm (writer 4) | P0 | appendices of 01–11 | 3 |
| CON-DE-B1-13 | B1 Unit 13 "Food and Markets" (endings without article, genitive endings, attributive comparison) | pm (writer 1) | P0 | appendices of 01–12, wave 3 scripts | 4 |
| CON-DE-B1-14 | B1 Unit 14 "Living Together" (two-part connectors) | pm (writer 2) | P0 | appendices of 01–13 | 4 |
| CON-DE-B1-15 | B1 Unit 15 "Discussing and Deciding" (`während / seitdem / bis`) | pm (writer 3) | P0 | appendices of 01–14 | 4 |
| CON-DE-B1-16 | B1 Unit 16 "Next Steps" (`ohne / statt … zu`, `wohl`) + B1 checkpoint | pm (writer 4) | P0 | appendices of 01–15 | 4 |
| CON-DE-B1-QA | B1 content QA pass over all 80 lessons, native-review delta | pm | P0 | CON-DE-B1-01 … 16, CON-DE-NR | 5 |
| CON-DE-B1-NR (planned) | Native-speaker review of B1 fixed (blocking for v1.1.0, PD-063) | pm (owner arranges the reviewer) | P0 | CON-DE-B1-QA | 5 |
| CTO-(tbd) B1-T2 | Typed answers with `ss` / umlaut leniency (PD-033): contract + checker | cto | P1 | — (not blocking) | any |
| CTO-(tbd) B1-T3 | Reading passage type with reverse-direction options (PD-019) | cto, dev-lessons | P1 | — (not blocking; else v1.1.1) | any |
| CTO-(tbd) B1-T4 | Grammar note card with tables | cto, dev-lessons | P2 | — (not blocking) | any |
| B1-T5 | Fit check at 375 × 667: 240-character tip, 110-character prompt with 14 tiles | pm (preview) | P1 | LES-013 | 0 |
| CON-DE-B1-CLZ / -TYP / -RDG (planned) | Cloze, typed and reading follow-ups in B1 lessons, new ids only | pm | P2 | LES-015 / B1-T2 / B1-T3 | after 5 |

Tech needs list and which units benefit from each type: `curriculum-german.md` §4c. Cloze
(CTO-009, LES-015) stays in v0.5.1; if it slips past v1.0.0 it moves here (see v0.5.1).

**Parallel build plan (4 writers per wave, PD-062)**
- **Wave 0:** the pm runs the B1-T5 fit check on the preview. If it fails, CDS-20 / CDS-21
  fall back to 80 / 200 characters and writing still starts.
- **Wave 1:** CON-DE-B1-01 … 04 in parallel. Each writer uses A1, A2, the earlier B1
  appendices and the own unit only, never other writers' lesson files.
- **After every wave:** the orchestrator runs the scripted checks on that wave (lexical
  token scan against the appendices, word-bank permutation and buildability, lengths,
  case-only pairs, digits, ordering regexes, duplicates). The pm settles vocabulary requests
  and amends later appendices before the next wave starts.
- **Wave 2:** 05 … 08. **Wave 3:** 09 … 12. **Wave 4:** 13 … 16.
- **Wave 5:** CON-DE-B1-QA on the combined preview branch, including the native-review delta
  once CON-DE-NR is done, and the playthrough.
- **Merge:** after v1.0.0 is tagged, the orchestrator inserts the units in unit order under
  the `B1` level; the cto merges.
- **Ready for release** when CON-DE-B1-01 … 16, CON-DE-B1-QA and CON-DE-B1-NR are
  accepted. The follow-ups (CLZ, TYP, RDG) and B1-T2 … T4 don't block v1.1.0.

---

## v0.6.0 — Accounts and sync (formerly v0.4.0; tickets written 2026-11-28, PM-014; PD-054, PD-085, PD-087)

**Milestone status: open; top engineering priority (PD-085).** Part A is built and accepted
against a **local Supabase**; part B waits on the owner's hosted project. Released only after
part B's hosted smoke test (PD-087).

**Goal:** a guest can create an account (email or Google) without losing progress, lessons
finished offline sync when the device reconnects, and a learner can sign in on a second device
and continue where they left off. Today progress is guest-only and stays on the device.

History: paused on 2026-11-12 by the German pivot (PD-036), renumbered from v0.4.0 (PD-054).
Ticket IDs are kept; PLT-010, PLT-015, PLT-016 and PLT-017 are re-scoped (PD-087). CTO-018,
CTO-019 and CTO-021 are done, so settings and results already have their final shape for sync.
Already in place: schema, RLS and `migrate_guest_to_account` (`/supabase`, ADR-003), the Dexie
sync queue that every write fills (`src/lib/offline`).

**Accounts flag (PD-087):** without the Supabase URL and anon key at build time the app stays
guest-only with no auth UI and no request to Supabase. Part A merges into `main` dark.

**Part A — local Supabase, no owner keys**

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-025 | ADR-020 (auth, push / pull, account switch, log-out), accounts and Google flags, `.env.example`, local harness + `accounts` e2e project, RLS / RPC tests, settings merge rule on log-in | cto | P0 | CTO-003, CTO-018, CTO-019, CTO-021 (done) |
| PLT-010 | Supabase client, email sign-up and log-in screens, "check your inbox", offline state, session (`useSession`) | dev-platform | P0 | CTO-025 (e2e only) |
| PLT-013 | "Save your progress" prompt (after lesson 1 and 5), guest → account migration, identity switch, nothing-lost e2e | dev-platform | P0 | PLT-010, CTO-025 |
| PLT-014 | Sync engine push: triggers, idempotent upload, backoff, rejected vs. retried, 401 pause, one sync per device, `useSyncStatus` | dev-platform | P0 | CTO-025, PLT-010; PLT-013 (e2e) |
| PLT-015 | Sync engine pull and second device: paged pull, merge (union / LWW), query refresh, two-device e2e (re-scoped; caching → PLT-031) | dev-platform | P0 | PLT-014, PLT-013 |
| PLT-017 | Log out with final sync and unsynced warning, fresh guest; Account rows in Profile settings (no appearance row) | dev-platform | P0 | PLT-010, PLT-014, PLT-015 |
| PLT-012 | Password reset by email (no account enumeration; local mail UI e2e) | dev-platform | P1 | PLT-010, CTO-025 |
| PLT-011 | Google sign-in: button behind its flag, `/auth/callback`, cancel / error copy, open-redirect guard (mocked provider; live check in CTO-024) | dev-platform | P1 | PLT-010, CTO-025 |
| PLT-016 | Profile account card: guest "Save your progress", "Signed in as …", sync line (saved / saving / offline n / paused / log in again) | dev-platform | P1 | PLT-010, PLT-013, PLT-014 |
| PLT-018 | Onboarding "I already have an account" → log in → skip onboarding, load the account's progress | dev-platform | P1 | PLT-010, PLT-013, PLT-015 |

**Part B — the owner's hosted project**

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CTO-024 | Runbook, migrations on hosted, auth settings (email confirmation on), env in hosting, hosted smoke test incl. second device and Google | cto | P0 | O1, O2, O4 (O3 for Google); part A accepted |

**Owner items (PD-087; nothing in part A waits for them):**
- **O1** Create a project at supabase.com (an EU region is suggested). Give the team the
  **Project URL** and the **anon (public) key** only. **Never share the service-role key or the
  database password in chat.**
- **O2** Let the cto apply migrations without sharing secrets: add the Supabase access token,
  project ref and database password as GitHub Actions secrets yourself, or run the runbook
  commands from CTO-024 yourself.
- **O3** (for Google sign-in) Create an OAuth client in Google Cloud and enter its client ID and
  secret in the Supabase dashboard yourself (Authentication → Providers → Google).
- **O4** The URL the app is served from (preview or public), for sign-in redirects and email
  links.
- **O5** (before the public launch, not blocking v0.6.0) A custom email sender for auth emails.

**Combined parallel build plan: v0.6.0 part A + v0.5.6 (PD-085)**
- **Wave 0:** cto **CTO-025**, then **CTO-023** (v0.5.6) in the same run. dev-platform starts
  **PLT-010** at once (screens, client, RTL; its e2e after CTO-025). pm verifies the CON-005
  mapping.
- **Wave 1 (after CTO-025):** dev-platform **PLT-013** → **PLT-014**. dev-gamification
  **GAM-016** after CTO-023; pm writes the CON-005 data file. dev-platform adds the `/topics`
  route file (GAM-016 criterion 16) between PLT-013 and PLT-014.
- **Wave 2:** dev-platform **PLT-015** → **PLT-017**, then **PLT-012** and **PLT-011**.
- **Wave 3:** dev-platform **PLT-016**, **PLT-018**. pm acceptance of part A on local Supabase.
- **Part B (any time O1, O2, O4 are done):** cto **CTO-024**; pm re-checks the `accounts` e2e on
  the hosted preview.
- **Lanes:** dev-platform carries the critical path (PLT-010 → 013 → 014 → 015 → 017).
  dev-gamification has GAM-016 only; dev-lessons has nothing in either milestone (FIX-005 or
  v1.0.0 groundwork if capacity allows).
- **Ready for release:** v0.5.6 when its three tickets are accepted (likely first). v0.6.0 when
  every part A ticket is accepted on local Supabase **and** CTO-024 is accepted on the hosted
  project. v0.7.0 starts after v0.6.0 (PD-071).

The goal plan travels with settings as one plan per course (CTO-018); lesson results carry
per-exercise outcomes and a review kind (CTO-019); PLT-014 uploads both unchanged. Marketing
proposal #2 (PD-071): the public URL stays an owner item (O4).

---

## v0.7.0 — Habit protection (planned, PD-071)

**Goal:** fewer broken streaks. Optional daily reminder (Web Push, opt-in, learner-chosen
time; on iPhone only for the installed app) and **one free streak freeze a week**. After
v0.6.0, because push needs a server and the freeze inventory should sync from day one.
Doesn't block v1.0.0. Needs a cto note on push consent and GDPR wording first. Tickets are
written after v0.6.0 starts.

---

## v1.0.0 — MVP launch polish (planned)

**Goal:** meet the PRD quality bars (Lighthouse PWA pass, Performance ≥ 90, Accessibility
≥ 95), measure the success metrics, and cover the key flows with e2e tests.

| ID | Title | Owner |
|---|---|---|
| LES-011 | Speak exercise (optional, skippable, never costs a heart; P2) | dev-lessons |
| ~~LES-012~~ | Sound effects: **pulled forward at the owner's request** (PD-074) | dev-lessons |
| ~~LES-013~~ | Lesson tip card: **moved to v0.5.0 as P1** (PD-050) | dev-lessons |
| LES-016 (planned) | Play prompt audio on multiple choice and `to_known` word banks (PD-055, with the TTS pipeline) | dev-lessons |
| FIX-005 | Lumi ember on the lesson error and audio-unavailable states (P2; any time) | dev-lessons |
| PLT-019 | Analytics events for the PRD success metrics | dev-platform |
| PLT-020 | Draft terms and privacy pages, 13+ notice | dev-platform |
| PLT-021 | Accessibility audit (findings become `fix/` tickets per owner). Inputs from the v0.2.0 review: is "Exercise 1 of N" announced on the first exercise (LES-002 AC13 note)? The storage notice uses non-token colours and a text "Dismiss" button (PLT-003 note) | dev-platform |
| PLT-022 | Performance budget and Lighthouse mobile ≥ 90 | dev-platform |
| PLT-023 | E2E suite: guest first lesson, offline → sync, sign-up migration, out of hearts. Input from PM-ACC6: assert the first Practice lesson card starts above the fold with the Review card "due" (GAM-015 AC 14) | dev-platform |
| PLT-031 (planned) | Offline caching of all A1 + A2 German lessons and their audio (moved from PLT-015, PD-087); with the TTS pipeline, since German audio files don't exist yet | dev-platform |
| PLT-032 (planned) | **Launch gate:** delete my account (Profile → Account, confirms, removes server data and the device data), with the privacy page PLT-020 (PD-087) | dev-platform (RPC / policy with the cto) |
| PLT-030 (planned) | **Launch gate:** set `telc-b1-en-de` and `einbuergerung-en-de` to `hidden` in the course registry before the public URL goes live, unless the owner has cleared licence (A7) and names (A8) for that course; devices already on them keep them (as en-es, PD-030). Trigger: public URL scheduled (PD-084) | dev-platform (registry with the cto) |
| CON-(tbd) (planned, conditional) | Rename the exam-prep courses ("German B1 Intensive", "Life in Germany: Citizenship Questions") and add the "not affiliated" line, only if A7 is cleared and A8 doesn't allow the exam names (PD-084) | pm |
| CON-004 | Spanish Unit 1 QA, speak exercises, final audio references. **Deferred** while Spanish is hidden (PD-030); only the `u1-l2-ex07` wording fix stays, as a small content fix | pm |
| CON-DE-SPK | German A1–A2 speak exercises and final `de-DE` audio references (with LES-011) | pm |
| CON-DE-NR | Native-speaker review of A1 + A2 fixed (blocking for launch, PD-038). Prep: the A2 QA's scripted follow-ups (lexical token scan, word-bank permutation check) run before the reviewer starts (PM-ACC3) | pm |
| CON-003 | UI microcopy review (kind feedback, empty/error states) | pm |
| CTO-(tbd) | E2E in CI, TTS audio pipeline (waits on owner for the TTS licence, PRD Q7), release. Recorded `de-DE` audio for every listen exercise is marketing proposal #3 (PD-071) | cto |
| (planned) | Shareable level and streak card (Web Share API, Lumi, level, streak, app URL; "finished the A1 path", never "certified"). Trigger: public URL (PD-071) | tbd when written |
| (planned) | Public "Life in Germany" topic landing pages from marketing copy. Trigger: public URL and domain (PD-071) | dev-platform |
| (note) | Cookieless, consent-based analytics: cto technical note before PLT-019 (PD-071) | cto |

---

## Phase 2 (placeholders, not scheduled)

Ordered by expected impact on the PRD goals (G2 retention first):

1. Streak freeze (now v0.7.0, PD-071) and streak repair
2. ~~Practice / review mode (spaced repetition of weak words) that earns hearts back~~ now
   v0.5.5 "Smart review" (PD-071)
3. ~~Daily reminders via Web Push~~ now v0.7.0 (PD-071)
4. Level checkpoints and "jump ahead" / placement tests for German (Spanish units 2–5 are
   "later" while Spanish is hidden, PD-030)
5. Weekly XP leagues and leaderboards (Supabase Realtime), Leaderboard tab
6. Achievements and badges
7. Friends: follow, see friends' streaks
8. Image-based multiple choice, reverse-direction multiple choice (Spanish prompt,
   English options; needs a contract `direction` field, PD-019), typed translation with
   diacritic tolerance, tap-to-hear word tiles
9. Mascot animations and reactions across the lesson flow
10. Apple sign-in
11. Mock level checkpoint (timed, can-do report). **Deferred** (PD-071); trigger: B1 merged
    and a go decision on paid plans
12. "Polyglow Plus is coming" interest-test card. **Deferred** (PD-071); trigger: PLT-019
    analytics live and the owner puts charging on the table

## Phase 3 (placeholders)

Additional known languages for German (`uk-de`, `ar-de` with RTL, `tr-de`, `es-de`; PD-031,
these need a localised UI), German electives (healthcare B1–B2, academic B2–C1),
~~"deadline mode" (target level by date)~~ (now v0.5.4 "Goal date"), stories and dialogue
lessons, pronunciation scoring, subscription (only if the owner decides to charge; pricing
position PD-072, hypotheses in `docs/marketing/pricing.md`), native wrappers (only if PWA
limits block growth), teacher tools and B2B cohorts (marketing proposal #10, deferred: trigger
v0.6.0 released, an organisation asks for a pilot, owner legal set-up, PD-071). AI
conversation partner: rejected for now (PRD §7), revisit after B1.
