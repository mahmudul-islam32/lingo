import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Course } from "@/contracts";
import { createGuestProfileStore } from "@/features/profile";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import {
  ContentRepositoryProvider,
  firstLessonPath,
  listAvailableCourses as loadCourses,
  listBundledCourses,
} from "@/lib/content";
import {
  createFixtureRepository,
  FIXTURE_COURSE_ID,
} from "@/lib/content/__fixtures__/fixture-course";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { effectiveCourseId, OnboardingFlow } from "../OnboardingFlow";
import OnboardingPage, { metadata } from "../page";
import { MORE_LANGUAGES_TEXT, NO_COURSES_TEXT } from "../steps/CourseStep";
import { SAVE_ERROR_TEXT } from "../steps/GoalStep";
import { WELCOME_FALLBACK_HEADING, welcomeHeading } from "../steps/Welcome";

const WELCOME_HEADING = welcomeHeading("German");

const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/onboarding",
}));

let courses: Course[];

async function memoryStore() {
  const session: Promise<LocalSession> = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => session });
  await store.getState().init();
  return { store, session: await session };
}

async function renderFlow(
  options: {
    load?: () => Promise<Course[]>;
    store?: ReturnType<typeof createGuestProfileStore>;
    client?: ReturnType<typeof createTestQueryClient>;
  } = {},
) {
  const store = options.store ?? (await memoryStore()).store;
  const user = userEvent.setup();
  renderWithQueryClient(
    <OnboardingFlow loadCourses={options.load ?? (async () => courses)} store={store} />,
    { client: options.client ?? createTestQueryClient() },
  );
  return { user, store };
}

/** From the course data (PLT-024 AC 4), never hard-coded: `/lesson/de-a1-u01-l1-…`. */
const firstGermanLesson = () => firstLessonPath(courses[0]!);

const h1 = () => screen.getByRole("heading", { level: 1 });

async function toCourseStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Get started" }));
  return screen.findByRole("radiogroup", { name: "What do you want to learn?" });
}

async function toGoalStep(user: ReturnType<typeof userEvent.setup>) {
  await toCourseStep(user);
  // German is the only available course, so it is preselected (PLT-024 AC 2).
  expect(screen.getByRole("radio", { name: "German" })).toHaveAttribute("aria-checked", "true");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  return screen.getByRole("radiogroup", { name: "Choose a daily goal" });
}

describe("onboarding flow (PLT-004)", () => {
  beforeEach(async () => {
    router.replace.mockReset();
    courses = await loadCourses();
  });

  it("1, 2: Welcome step with Lumi (happy), heading, one primary button, no log-in link", async () => {
    await renderFlow();
    expect(await screen.findByRole("heading", { level: 1, name: WELCOME_HEADING })).toBeVisible();
    expect(screen.getByText("Short lessons, real progress.")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Get started" })).toBeEnabled();
    const lumi = document.querySelector('svg[data-pose="happy"]');
    expect(lumi).toBeInTheDocument();
    expect(lumi).toHaveAttribute("aria-hidden", "true"); // decorative next to the heading
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/already have an account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Step \d of 3/)).not.toBeInTheDocument();
    expect(metadata.title).toBe("Get started");
  });

  it("PLT-024 1, 2: Course step lists only German, preselected, Continue enabled; Spanish isn't named", async () => {
    const { user } = await renderFlow({ load: () => loadCourses() });
    const group = await toCourseStep(user);
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(1);
    expect(radios[0]).toHaveAccessibleName("German");
    expect(radios[0]).toHaveAccessibleDescription("for English speakers");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(within(radios[0]!).getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.queryByText(/Spanish/)).not.toBeInTheDocument();
    const more = screen.getByText(MORE_LANGUAGES_TEXT);
    expect(group).not.toContainElement(more);
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

    // Selecting it again keeps it selected.
    await user.click(radios[0]!);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("PLT-024 2 (PLT-004 3): with two or more courses nothing is preselected", async () => {
    const { user } = await renderFlow({ load: () => listBundledCourses() });
    const group = await toCourseStep(user);
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "false"]);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Spanish" }));
    expect(screen.getByRole("radio", { name: "Spanish" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("PLT-024 2: effectiveCourseId prefers the choice, else the only course", () => {
    const [german] = courses;
    expect(effectiveCourseId(null, { status: "loading" })).toBeNull();
    expect(effectiveCourseId(null, { status: "error" })).toBeNull();
    expect(effectiveCourseId(null, { status: "ready", courses: [] })).toBeNull();
    expect(effectiveCourseId(null, { status: "ready", courses: [german!] })).toBe("en-de");
    expect(effectiveCourseId("en-es", { status: "ready", courses: [german!] })).toBe("en-es");
    expect(
      effectiveCourseId(null, { status: "ready", courses: [german!, { ...german!, id: "x" }] }),
    ).toBeNull();
  });

  it("PLT-024 3: the Welcome heading names the default course's language (en-es → Spanish)", async () => {
    const { store } = await memoryStore();
    renderWithQueryClient(
      <OnboardingFlow loadCourses={async () => courses} store={store} defaultCourseId="en-es" />,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Learn Spanish in five minutes a day",
      }),
    ).toBeInTheDocument();
  });

  it("PLT-024 3: the heading comes from the course data (fixture repository), with a static fallback", async () => {
    const { store } = await memoryStore();
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    const fixture = createFixtureRepository();
    const repository = {
      ...fixture,
      getCourse: async (id: string) => {
        await gate;
        return fixture.getCourse(id);
      },
    };
    renderWithQueryClient(
      <ContentRepositoryProvider repository={repository}>
        <OnboardingFlow
          loadCourses={async () => courses}
          store={store}
          defaultCourseId={FIXTURE_COURSE_ID}
        />
      </ContentRepositoryProvider>,
    );
    expect(h1()).toHaveTextContent(WELCOME_FALLBACK_HEADING);
    expect(h1()).not.toHaveTextContent(/German|Spanish/);
    await act(async () => release());
    // The fixture course learns `es`: the name comes from `Intl.DisplayNames`.
    expect(
      await screen.findByRole("heading", { level: 1, name: welcomeHeading("Spanish") }),
    ).toBeInTheDocument();
  });

  it("PLT-024 3: a course that can't be read keeps the fallback heading", async () => {
    const { store } = await memoryStore();
    renderWithQueryClient(
      <OnboardingFlow loadCourses={async () => courses} store={store} defaultCourseId="nope" />,
    );
    await waitFor(() => expect(h1()).toHaveTextContent(WELCOME_FALLBACK_HEADING));
    expect(screen.getByRole("button", { name: "Get started" })).toBeEnabled();
  });

  it("3: shows skeletons while courses load", async () => {
    let resolve: (value: Course[]) => void = () => {};
    const load = () => new Promise<Course[]>((r) => (resolve = r));
    const { user } = await renderFlow({ load });
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading courses");
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await act(async () => resolve(courses));
    expect(screen.getByRole("radio", { name: "German" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("4: goal step shows the four options from contracts, none preselected, Start disabled", async () => {
    const { user } = await renderFlow();
    const group = await toGoalStep(user);
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "false",
      "false",
    ]);
    const expected = [
      ["Casual 10 XP", "About 1 lesson a day"],
      ["Regular 20 XP", "About 2 lessons a day"],
      ["Serious 30 XP", "About 3 lessons a day"],
      ["Intense 50 XP", "About 5 lessons a day"],
    ];
    radios.forEach((radio, i) => {
      expect(radio).toHaveAccessibleName(expected[i]![0]);
      expect(radio).toHaveAccessibleDescription(expected[i]![1]);
    });
    expect(screen.getByRole("button", { name: "Start learning" })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Serious 30 XP" }));
    expect(screen.getByRole("button", { name: "Start learning" })).toBeEnabled();
  });

  it("5: arrow keys move the selection; the selected option shows a check icon", async () => {
    const { user } = await renderFlow();
    const group = await toGoalStep(user);
    const radio = (name: string) => within(group).getByRole("radio", { name });
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();

    await user.tab(); // into the group: first option is the only Tab stop
    expect(radio("Casual 10 XP")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(radio("Regular 20 XP")).toHaveFocus();
    expect(radio("Regular 20 XP")).toHaveAttribute("aria-checked", "true");
    expect(within(radio("Regular 20 XP")).getByTestId("check-icon")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(radio("Serious 30 XP")).toHaveAttribute("aria-checked", "true");
    expect(radio("Regular 20 XP")).toHaveAttribute("aria-checked", "false");
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    expect(radio("Intense 50 XP")).toHaveFocus(); // wraps around
    expect(radio("Intense 50 XP")).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Home}");
    expect(radio("Casual 10 XP")).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByTestId("check-icon")).toHaveLength(1);
    // Roving tabindex: only the checked option is in the Tab order.
    expect(
      within(group)
        .getAllByRole("radio")
        .map((r) => r.tabIndex),
    ).toEqual([0, -1, -1, -1]);
  });

  it("6: Back returns to the previous step and keeps its selection", async () => {
    const { user } = await renderFlow();
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Intense 50 XP" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "German" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("radio", { name: "Intense 50 XP" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(h1()).toHaveTextContent(WELCOME_HEADING));
  });

  it("7: focus moves to the new step's h1 on each step change", async () => {
    const { user } = await renderFlow();
    expect(h1()).not.toHaveFocus();
    await toCourseStep(user);
    expect(h1()).toHaveTextContent("What do you want to learn?");
    expect(h1()).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: "German" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(h1()).toHaveTextContent("Choose a daily goal");
    expect(h1()).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(h1()).toHaveTextContent("What do you want to learn?");
    expect(h1()).toHaveFocus();
  });

  it("PLT-009: Start learning refreshes the cached settings, so the chosen goal is read", async () => {
    const { store, session } = await memoryStore();
    const client = createTestQueryClient();
    const queryFn = vi.fn(() => session.profile.findSettings());
    client.setQueryDefaults(queryKeys.settings(), { queryFn });
    // A settings read from before onboarding (`null`), as GAM-003 would have cached it.
    client.setQueryData(queryKeys.settings(), null);
    const { user } = await renderFlow({ store, client });
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Regular 20 XP" }));
    await user.click(screen.getByRole("button", { name: "Start learning" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(firstGermanLesson()));
    await waitFor(() =>
      expect(client.getQueryData(queryKeys.settings())).toMatchObject({ dailyGoalXp: 20 }),
    );
    expect(queryFn).toHaveBeenCalled();
  });

  it("PLT-024 4: the first lesson path is en-de's first A1 lesson", () => {
    expect(courses.map((c) => c.id)).toEqual(["en-de"]);
    expect(firstGermanLesson()).toMatch(/^\/lesson\/de-a1-u01-l1-[a-z0-9-]+$/);
  });

  it("8: Start learning saves course + goal to the guest profile, completes onboarding, goes to Lesson 1", async () => {
    const { store, session } = await memoryStore();
    const { user } = await renderFlow({ store });
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Regular 20 XP" }));
    await user.click(screen.getByRole("button", { name: "Start learning" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(firstGermanLesson()));
    expect(router.push).not.toHaveBeenCalled();
    const saved = await session.profile.findSettings();
    expect(saved).toMatchObject({
      courseId: "en-de",
      dailyGoalXp: 20,
      soundEffectsEnabled: true,
      speakingExercisesEnabled: true,
    });
    expect((await session.profile.getProfile()).onboardedAt).not.toBeNull();
    expect(store.getState().onboardingComplete).toBe(true);
    expect(store.getState().settings?.dailyGoalXp).toBe(20);
  });

  it("10: nothing is saved before Start learning (a reload starts over at Welcome)", async () => {
    const { store, session } = await memoryStore();
    const { user } = await renderFlow({ store });
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Casual 10 XP" }));
    expect(await session.profile.findSettings()).toBeNull();
    expect((await session.profile.getProfile()).onboardedAt).toBeNull();
  });

  it("11: a save error shows an alert, stays on step 3 and keeps the selection", async () => {
    const { store } = await memoryStore();
    const updateSettings = vi
      .fn()
      .mockRejectedValueOnce(new Error("disk full"))
      .mockImplementation(store.getState().updateSettings);
    store.setState({ updateSettings });
    const { user } = await renderFlow({ store });
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Serious 30 XP" }));
    await user.click(screen.getByRole("button", { name: "Start learning" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(SAVE_ERROR_TEXT);
    expect(h1()).toHaveTextContent("Choose a daily goal");
    expect(screen.getByRole("radio", { name: "Serious 30 XP" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(router.replace).not.toHaveBeenCalled();
    expect(store.getState().onboardingComplete).toBe(false);

    // The button stays enabled for a retry.
    const start = screen.getByRole("button", { name: "Start learning" });
    expect(start).toBeEnabled();
    await user.click(start);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(firstGermanLesson()));
    expect(updateSettings).toHaveBeenLastCalledWith({ courseId: "en-de", dailyGoalXp: 30 });
  });

  it("11: a failure to mark onboarding complete also shows the alert", async () => {
    const { store } = await memoryStore();
    store.setState({ completeOnboarding: vi.fn().mockRejectedValue(new Error("nope")) });
    const { user } = await renderFlow({ store });
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Casual 10 XP" }));
    await user.click(screen.getByRole("button", { name: "Start learning" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(SAVE_ERROR_TEXT);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("12: empty state with Try again when no courses are available", async () => {
    const load = vi.fn<() => Promise<Course[]>>().mockResolvedValueOnce([]);
    load.mockResolvedValueOnce(courses);
    const { user } = await renderFlow({ load });
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(await screen.findByText(NO_COURSES_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("radio", { name: "German" })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("12: a failed course load shows the same empty state", async () => {
    const load = vi.fn<() => Promise<Course[]>>().mockRejectedValue(new Error("chunk failed"));
    const { user } = await renderFlow({ load });
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(await screen.findByText(NO_COURSES_TEXT)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("onboarding page", () => {
  it("renders one main and no bottom nav", async () => {
    const { store } = await memoryStore();
    const { guestProfileStore } = await import("@/features/profile");
    guestProfileStore.setState({ ...store.getState() });
    renderWithQueryClient(<OnboardingPage />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
