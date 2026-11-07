import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Course } from "@/contracts";
import { createGuestProfileStore } from "@/features/profile";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import { loadCourses } from "../courses";
import { OnboardingFlow } from "../OnboardingFlow";
import OnboardingPage, { metadata } from "../page";
import { MORE_LANGUAGES_TEXT, NO_COURSES_TEXT } from "../steps/CourseStep";
import { SAVE_ERROR_TEXT } from "../steps/GoalStep";
import { WELCOME_HEADING } from "../steps/Welcome";

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
  } = {},
) {
  const store = options.store ?? (await memoryStore()).store;
  const user = userEvent.setup();
  render(<OnboardingFlow loadCourses={options.load ?? (async () => courses)} store={store} />);
  return { user, store };
}

const h1 = () => screen.getByRole("heading", { level: 1 });

async function toCourseStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Get started" }));
  return screen.findByRole("radiogroup", { name: "What do you want to learn?" });
}

async function toGoalStep(user: ReturnType<typeof userEvent.setup>) {
  await toCourseStep(user);
  await user.click(screen.getByRole("radio", { name: "Spanish" }));
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
    expect(h1()).toHaveTextContent(WELCOME_HEADING);
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

  it("1, 3: Course step lists the course, coming-soon line, Continue disabled until selected", async () => {
    const { user } = await renderFlow();
    const group = await toCourseStep(user);
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(1);
    expect(radios[0]).toHaveAccessibleName("Spanish");
    expect(radios[0]).toHaveAccessibleDescription("for English speakers");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    const more = screen.getByText(MORE_LANGUAGES_TEXT);
    expect(group).not.toContainElement(more);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

    await user.click(radios[0]!);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("3: shows skeletons while courses load", async () => {
    let resolve: (value: Course[]) => void = () => {};
    const load = () => new Promise<Course[]>((r) => (resolve = r));
    const { user } = await renderFlow({ load });
    await user.click(screen.getByRole("button", { name: "Get started" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading courses");
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await act(async () => resolve(courses));
    expect(screen.getByRole("radio", { name: "Spanish" })).toBeInTheDocument();
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
    expect(screen.getByRole("radio", { name: "Spanish" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("radio", { name: "Intense 50 XP" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(h1()).toHaveTextContent(WELCOME_HEADING);
  });

  it("7: focus moves to the new step's h1 on each step change", async () => {
    const { user } = await renderFlow();
    expect(h1()).not.toHaveFocus();
    await toCourseStep(user);
    expect(h1()).toHaveTextContent("What do you want to learn?");
    expect(h1()).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: "Spanish" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(h1()).toHaveTextContent("Choose a daily goal");
    expect(h1()).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(h1()).toHaveTextContent("What do you want to learn?");
    expect(h1()).toHaveFocus();
  });

  it("8: Start learning saves course + goal to the guest profile, completes onboarding, goes to /", async () => {
    const { store, session } = await memoryStore();
    const { user } = await renderFlow({ store });
    await toGoalStep(user);
    await user.click(screen.getByRole("radio", { name: "Regular 20 XP" }));
    await user.click(screen.getByRole("button", { name: "Start learning" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(router.push).not.toHaveBeenCalled();
    const saved = await session.profile.findSettings();
    expect(saved).toMatchObject({
      courseId: "en-es",
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
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(updateSettings).toHaveBeenLastCalledWith({ courseId: "en-es", dailyGoalXp: 30 });
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
    expect(await screen.findByRole("radio", { name: "Spanish" })).toBeInTheDocument();
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
    render(<OnboardingPage />);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
