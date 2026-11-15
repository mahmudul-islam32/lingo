# Polyglow Roadmap

**Owner:** pm · **Last updated:** 2026-11-15 (release acceptance PM-ACC3 for v0.3.0 …
v0.5.0; one combined v0.5.0 release; accounts renumbered v0.6.0; cloze to v0.5.1; B1
planning starts; PD-053 … PD-055) ·
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

### Later German levels (planned)

| Milestone | Content | Content tickets (planned) | Tech needed (planned, curriculum §6) |
|---|---|---|---|
| **v0.5.0 — German A2** | See the section above | CON-DE-A2-01 … 14, CON-DE-A2-QA | LES-013 (tip card), CTO-009 + LES-015 (cloze, non-blocking, PD-049). Gender choice = one-gap cloze; reverse MC and grammar note card not needed for A2 |
| **v0.5.1 — A2 cloze follow-up** (planned) | 1–2 cloze exercises in A2 lessons drilling endings and prepositions (U4, U6, U9, U10), new ids only | CON-DE-A2-CLZ (planned) | CTO-009 + LES-015 (see the v0.5.1 section) |
| **v1.1.0 — German B1** (**planning starts now**, PD-054) | 16 units, ~80 lessons, ~1,000 items | CON-DE-B1-PLAN, then CON-DE-B1-01 … 16, CON-DE-B1-QA | Cloze exercise, typed answers with `ss` / umlaut leniency (PD-033), reading passage |
| **v1.2.0 — German B2** | 18 units, ~90 lessons, ~1,500 items | CON-DE-B2-01 … 18, CON-DE-B2-QA | Longer listening comprehension, guided writing (TBD), healthcare elective path |
| **v1.3.0 — German C1** | 18 units, ~90 lessons, ~1,500 items | CON-DE-C1-01 … 18, CON-DE-C1-QA | Academic reading and register exercises, academic elective path |

Public launch (v1.0.0) ships with **A1 + A2** (PD-036). A native-speaker review of A1 and A2
is blocking for v1.0.0 (PD-038).

### v1.1.0 — German B1: planning (starts now, PD-054)

B1 is the next content level after launch (`curriculum-german.md` §2: 16 units, ~80
lessons). Planning runs now, in parallel with v0.6.0 and v1.0.0, as A2 did (PD-045 …
PD-052). B1 lesson files don't merge into `main` before v1.0.0 ships.

| ID | Title | Owner | Priority | Depends on |
|---|---|---|---|---|
| CON-DE-B1-PLAN (planned) | B1 plan: unit list and grammar order (curriculum §4c), size target, CDS additions for B1, tech needs list, the 16 unit tickets with fixed appendices (PD-052 style) | pm | P1 | CON-DE-A2-QA merged |
| CTO-(tbd) | Tech proposals from the plan: typed answers with `ss` / umlaut leniency (PD-033), reading passage, grammar note card with tables (curriculum §6) | cto | P1 | CON-DE-B1-PLAN |

Planning is ready when the plan is logged as decisions and the 16 unit tickets exist. B1
writing starts after v1.0.0's native review (CON-DE-NR), so A2 fixes from that review feed
into the B1 appendices.

---

## v0.6.0 — Accounts and sync (formerly v0.4.0; **resumes now**, PD-054)

**Goal:** a guest can create an account (email or Google) without losing progress, and
lessons finished offline sync reliably when the device reconnects.

It was paused on 2026-11-12 by the German pivot (PD-036). It resumed on 2026-11-15, when every
German milestone through v0.5.0 was merged. Because A2 ships first as v0.5.0, this milestone
is renumbered **v0.6.0**. The `v0.4.0` number is not used (PD-054). Ticket IDs don't change.
- dev-platform starts with **PLT-010** and **PLT-015**. PLT-015 now covers caching all **130
  German lessons** (A1 + A2) and their audio, not only Unit 1.
- dev-lessons takes FIX-005 (P2) after #55.
- dev-gamification takes FIX-003 first.

The pm writes the ticket files for PLT-010 … PLT-018 before the devs start them.

| ID | Title | Owner |
|---|---|---|
| PLT-010 | Supabase client, email sign-up, log-in, log-out, session handling | dev-platform |
| PLT-011 | Google sign-in | dev-platform |
| PLT-012 | Password reset by email | dev-platform |
| PLT-013 | "Save your progress" prompt and guest → account migration | dev-platform |
| PLT-014 | Sync queue: idempotent upload of lesson results (no double XP) | dev-platform |
| PLT-015 | Offline caching of Unit 1 lessons and audio, sync on reconnect | dev-platform |
| PLT-016 | Profile screen (name, avatar, total XP, streaks, lessons, join date) | dev-platform |
| PLT-017 | Settings screen (daily goal, sound, speaking exercises, appearance dark/light (PD-015), log out) | dev-platform |
| PLT-018 | Onboarding "I already have an account" path | dev-platform |

---

## v1.0.0 — MVP launch polish (planned)

**Goal:** meet the PRD quality bars (Lighthouse PWA pass, Performance ≥ 90, Accessibility
≥ 95), measure the success metrics, and cover the key flows with e2e tests.

| ID | Title | Owner |
|---|---|---|
| LES-011 | Speak exercise (optional, skippable, never costs a heart; P2) | dev-lessons |
| LES-012 | Sound effects (correct, incorrect, lesson complete; respects setting) | dev-lessons |
| ~~LES-013~~ | Lesson tip card: **moved to v0.5.0 as P1** (PD-050) | dev-lessons |
| LES-016 (planned) | Play prompt audio on multiple choice and `to_known` word banks (PD-055, with the TTS pipeline) | dev-lessons |
| FIX-005 | Lumi ember on the lesson error and audio-unavailable states (P2; any time) | dev-lessons |
| PLT-019 | Analytics events for the PRD success metrics | dev-platform |
| PLT-020 | Draft terms and privacy pages, 13+ notice | dev-platform |
| PLT-021 | Accessibility audit (findings become `fix/` tickets per owner). Inputs from the v0.2.0 review: is "Exercise 1 of N" announced on the first exercise (LES-002 AC13 note)? The storage notice uses non-token colours and a text "Dismiss" button (PLT-003 note) | dev-platform |
| PLT-022 | Performance budget and Lighthouse mobile ≥ 90 | dev-platform |
| PLT-023 | E2E suite: guest first lesson, offline → sync, sign-up migration, out of hearts | dev-platform |
| CON-004 | Spanish Unit 1 QA, speak exercises, final audio references. **Deferred** while Spanish is hidden (PD-030); only the `u1-l2-ex07` wording fix stays, as a small content fix | pm |
| CON-DE-SPK | German A1–A2 speak exercises and final `de-DE` audio references (with LES-011) | pm |
| CON-DE-NR | Native-speaker review of A1 + A2 fixed (blocking for launch, PD-038). Prep: the A2 QA's scripted follow-ups (lexical token scan, word-bank permutation check) run before the reviewer starts (PM-ACC3) | pm |
| CON-003 | UI microcopy review (kind feedback, empty/error states) | pm |
| CTO-(tbd) | E2E in CI, TTS audio pipeline (waits on owner for the TTS licence, PRD Q7), release | cto |

---

## Phase 2 (placeholders, not scheduled)

Ordered by expected impact on the PRD goals (G2 retention first):

1. Streak freeze and streak repair
2. Practice / review mode (spaced repetition of weak words) that earns hearts back
3. Daily reminders via Web Push
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

## Phase 3 (placeholders)

Additional known languages for German (`uk-de`, `ar-de` with RTL, `tr-de`, `es-de`; PD-031,
these need a localised UI), German electives (healthcare B1–B2, academic B2–C1), "deadline
mode" (target level by date), stories and dialogue lessons, pronunciation scoring,
subscription (pricing hypotheses in `market-analysis-german.md` §6), native wrappers (only
if PWA limits block growth), teacher tools and B2B cohorts.
