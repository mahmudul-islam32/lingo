# ADR-021: Topics are course data (`topics.json`, `CourseTopicsSchema`)

- **Status:** Accepted
- **Date:** 2026-11-28
- **Ticket:** CTO-023; consumers CON-005 (data), GAM-016 (Topics screen). Milestone v0.5.6.
- **Decider:** cto (product rules: PD-071 #5, PD-086)

## Context

v0.5.6 adds "Life in Germany" topics: named groups of existing lessons ("At the doctor's",
"Finding a flat"). The pm wants to edit them without a code change, and wants a wrong lesson
id to fail CI instead of showing a broken row. A topic belongs to one course, adds no
content, and never changes the path order, locks or XP.

## Decision

### 1. Topics are course data, in a separate file per course

- **Location:** `content/courses/<courseId>/topics.json`, holding
  `{ "courseId": "<courseId>", "topics": [Topic, …] }` and validated by `CourseTopicsSchema`.
- **Optional:** a course without the file has no topics. Only `en-de` gets one, in CON-005.
- **`Topic`** is a strict object:
  - `id`: a slug;
  - `title`: 1–30 characters;
  - `description`: 1–90 characters;
  - `lessonIds`: 3–12 slugs, no duplicates.
- **Per course:** at most 12 topics, and topic ids are unique within the course.
- **Limits** live in `CONTENT_RULES`: `courseMaxTopics`, `topicTitleMaxLength`,
  `topicDescriptionMaxLength`, `topicMinLessons`, `topicMaxLessons` and `lessonMaxTopics`.
- **Cross-file rules:** `courseTopicsIssues(course, file)` checks that the file's `courseId`
  is the course, that every lesson id is a lesson of that course, and that a lesson is in at
  most 2 topics. Each message names the topic and the id. The content test runs it for every
  course with a file, and the loader runs it at load time.

### 2. Loading

- **Loader:** `ContentRepository.getTopics(courseId): Promise<Topic[]>` in `api.ts`.
  - `BundledContentRepository` implements it with an optional `ContentLoaders.topics` map:
    one dynamic `import()` per course, like lessons, so the file is its own chunk and the
    service worker precaches it. It works offline.
  - It returns `[]` when a course has no entry.
  - The file is parsed and checked as in §1; a bad file throws `ContentValidationError`.
- **Query:** query key `["topics", courseId]` (`queryKeys.topics`) and
  `topicsQueryOptions(repository, courseId)` in `src/lib/content`.
- **Registration:** adding a file needs one line in `BUNDLED_CONTENT.topics`. The content
  test fails if a file exists but isn't registered, or the other way round.

### 3. Not synced, no version bump

- Topics are bundled, read-only content. They are never stored on a server or synced, so
  nothing changes in `/supabase` and `CONTRACTS_VERSION` stays `1`.
- Editing a topic doesn't touch `course.json`, so `course.version` and the
  `audio-v<course.version>` cache name don't change.

### 4. Alternatives considered

- **Inside `course.json`:** one file fewer, but every topic edit would bump `course.version`
  and rename the audio cache, and the manifest (statically imported into the app) would grow
  for every learner. Rejected.
- **Code in `src/features/path`:** no schema or content test, and a pm change would need a
  dev. That contradicts the user story (US-TP-01). Rejected.
- **A separate file (chosen):** what the pm asked for. It is validated like lessons, loaded
  lazily, and doesn't affect the path.

## Consumer changes

- **CON-005 (pm):**
  - add `content/courses/en-de/topics.json`;
  - add one line to `BUNDLED_CONTENT.topics` (`"en-de": json(() => import(".../topics.json"))`).
    That line is in dev-platform's lane; the pm asks for it in CON-005 or the cto adds it at
    merge.
  - the content test validates the file.
- **GAM-016 (dev-gamification):** the Topics screen reads `topicsQueryOptions` (or
  `ContentRepository.getTopics`) and the course progress. Its tests use the fixture
  `src/lib/content/__fixtures__/german-topics-fixture.ts`: the German fixture course plus
  one A2 unit, with 2 topics, one of them mixing A1 and A2 lessons.

## Consequences

- The pm edits topics like any content and CI checks them.
- A wrong lesson id fails CI with the topic and the id named.
- No server, sync, or path-order change.
