# Project status

**Last update:** 2026-11-28 ~03:35 Europe/Berlin (scheduled 01:00 run)
**Version on `main`:** **0.5.5** (#125: smart review) + unreleased groundwork for v0.5.6 and v0.6.0 ·
**Course:** German A1 + A2 on `main`; B1 Units 1–13 written (unmerged by plan, PD-063)

## Where things stand
- **Tickets for v0.5.6 "Life in Germany topics" and v0.6.0 "Accounts and sync"** merged (PM-014,
  #130): CON-005, CTO-023/024/025, GAM-016, PLT-010–018; PD-085 to PD-087 (accounts part A first,
  on a local Supabase, while the hosted project waits on the owner).
- **CTO-025 accounts groundwork (#131, ADR-020):**
  - Accounts are off unless both Supabase variables are set. The app then makes zero Supabase
    requests.
  - CI gained an `accounts` job: a local Supabase, `npm run test:db` (RLS, migration, merge cases)
    and `npm run test:e2e:accounts`.
  - The guest-to-account migration now merges settings instead of replacing them. Goal plans
    merge per course, the newer plan wins, and the start level is kept.
- **CTO-023 topics as course data (#132, ADR-021):** a `topics.json` per course,
  `ContentRepository.getTopics`, precached, with a fixture for GAM-016.
- **Formatting:** CTO-022 (#128) added `npm run format:check` to CI.
- **FIX-016 (#133):** the e2e accessibility check now waits for entrance animations to finish.
- No app feature shipped this run. The cto's usage limit hit mid-run, so the dev tickets start next run.

## Handoff
- **dev-platform, v0.6.0 part A** (local Supabase, flags off): PLT-010 email auth, then PLT-013
  guest→account migration, PLT-014 sync push, PLT-015 pull and second device, PLT-017 log out,
  then PLT-012, PLT-011, PLT-016, PLT-018. Follow the ROADMAP waves and ADR-020. Also review the
  ~40 lines the cto added in `src/lib/content` and `src/lib/query/keys.ts` (#132), and the
  `/topics` route file for GAM-016.
- **dev-gamification:** GAM-016, a Topics card on Practice and the `/topics` screen.
- **pm:** CON-005, which maps topics to lessons in `content/courses/en-de/topics.json`. It also
  needs one registration line in `BUNDLED_CONTENT.topics`, done by dev-platform or the cto; the
  content test fails until it is added. Then pm acceptance and the v0.5.6 release.
- **Flake:** `review.spec.ts:123` (offline review) failed 1 in 10 local runs. Assign it to dev-platform.
- **cto:** switch the Supabase config from `auth.email.enable_signup` to `auth.email.enabled`
  (CLI 3.4.0 deprecation). Part B (CTO-024) can start its runbook (`docs/architecture/hosted-supabase.md`) now that the
  owner gave the project URL and publishable key (see "Waiting on owner"). Migrations wait on O2
  and redirects on O4. This container's network blocks `*.supabase.co`, so reach it from CI.
- **Carried over:**
  - Marketing screenshots for v0.5.4 and v0.5.5, and the README refresh (orchestrator).
  - Precaching lessons per course.
  - B1 Wave 4: Units 14–16, then QA. These merge after v1.0.0.
  - v1.0.0: PLT-030 (hide the exam courses), TTS licence, speaking, native-speaker review.

## Blockers
- Usage limits end most runs early; agents are resumed after each reset.
- Disk is tight (~3 GB free): delete `.next` and `test-results` in worktrees after use.
- This container has no Docker. The real local Supabase stack runs only in the CI `accounts` job.

## Waiting on owner (non-blocking)
- Tags and GitHub releases: `9d885c9` as `v0.5.0`, `3627efc` as `v0.5.2`, `11b5d2d` as
  `v0.5.3`, `6a84047` as `v0.5.4`, `c23df26` as `v0.5.5` (and `v0.1.0` / `v0.2.0`). Agents don't
  create tags or releases.
- Go-ahead to delete merged branches (agents are blocked from deleting branches).
- **Hosted Supabase for v0.6.0 part B (O1–O5):**
  - O1 done (2026-11-28): project URL `https://puitzylpkxqnvbkkubyf.supabase.co`, publishable key
    `sb_publishable_BsyWb044n3gZP-p-WhhFXQ_vUq6JaJC`. Both are public values. Don't set them in a
    production build until v0.6.0 part A has passed acceptance (PD-087).
  - Smoke test (2026-11-28): the project is reachable and the key works (auth health 200). Only
    email login is on, with email confirmation required. No app tables yet, because no migrations
    are applied (waits on O2).
  - Never share the service-role key or the database password.
  - O2: add `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` and `SUPABASE_DB_PASSWORD` as GitHub
    Actions secrets yourself.
  - Set up a Google OAuth client and give the team the app URL.
  - Later: a custom email sender.
- **Exam courses (marketing A7/A8, PD-084):** confirm the source and licence of the telc B1
  content and the Einbürgerungstest catalogue, including the Q55 Bundestag photo. Also decide
  whether the exam names may be used publicly. Until then these courses are hidden at public launch.
- **Launch gate (marketing A1–A4):** a public URL, a domain and trademark check for "Polyglow",
  an Impressum and privacy policy, and a feedback inbox. Exact steps are in
  `docs/marketing/waiting-on-owner.md`.
- Native-speaker review of German content: the lists are in each ticket's
  "Uncertainties / needs native review".
- TTS provider licence (PRD Q7): German audio falls back to "Audio isn't available" + Skip.

## Run log
- 2026-11-06 … 11-11: Phase 0–1, v0.1.0 and v0.2.0 built and merged (#2–#50).
- 2026-11-12: owner pivot to German. Market analysis and curriculum, contracts, A1 Units 1–12 (#51–#53).
- 2026-11-13 01:00 run: A1 QA merged (#54). A2 plan written, A2 Units 1–4 written and pushed.
  The run was cut short by the usage limit.
- 2026-11-14 01:00 run: merged #56–#59. A2 Units 5–12 written, validated and pushed. Cut short by the usage limit.
- 2026-11-15 01:00 run: A2 Units 13–14 written; #60–#67 and #55 merged; A2 QA and FIX-004 playthroughs PASS.
- 2026-11-16 01:00 run: v0.5.0 released (#69), cloze contract and component built, B1 plan written,
  FIX-005 built. Stopped by the weekly usage limit.
- 2026-11-17 01:00 run: #68–#74 merged; B1-T5 fit check PASS; FIX-005 rework; B1 Units 1–2 writing.
- 2026-11-18 01:00 run: FIX-006/007 and the B1 tech plan merged; B1 Units 5–10 written.
- 2026-11-18 (owner request): start level and earning hearts built and merged (#79–#83).
- 2026-11-19 01:00 run: verified #79–#83 on main (e2e 120/120); B1 Units 11–12 written.
- 2026-11-19 (owner request): redesign v2 built (CTO-016, PLT-026, GAM-012, LES-021).
- 2026-11-20 01:00 run: redesign merged (#86–#96) and released as v0.5.3; B1 Unit 13 written; README re-captured.
- 2026-11-25 (owner "resume run"): v0.5.4 integrated, FIX-012/013 fixed owner-merge breakages, PM-011 rejected PLT-027 → FIX-014.
- 2026-11-26 01:00 run: #111–#117 merged; **v0.5.4 released**; v0.5.5 contracts, LES-023 and GAM-014 merged; PLT-028/GAM-015/PLT-029 open (#118–#120).
- 2026-11-27 01:00 run: PLT-028 CI fixed, #118–#127 merged; **v0.5.5 released**; MKT-002 kit refresh; PD-083/084; CTO-022 open (#128).
- 2026-11-28 01:00 run: #128–#133 merged (PM-014 tickets, CTO-025 accounts groundwork + `accounts` CI job, CTO-023 topics data, `format:check` in CI, FIX-016). Cto hit the usage limit mid-run; dev tickets start next run.
