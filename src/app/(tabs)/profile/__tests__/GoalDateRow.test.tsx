import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HeartsState, Profile, Settings } from "@/contracts";
import { ToastProvider } from "@/components/ui";
import { addDays, deviceTimeZone, formatGoalDate, toLocalDate } from "@/features/gamification";
import {
  CHANGE_GOAL_DATE,
  createGuestProfileStore,
  GOAL_DATE_ERRORS,
  GOAL_DATE_REMOVED,
  GOAL_DATE_SAVE_ERROR,
  GOAL_DATE_SAVED,
  guestProfileStore,
  SET_GOAL_DATE,
} from "@/features/profile";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { ProfileScreen } from "../ProfileScreen";

const NOW = new Date().toISOString();

const profile: Profile = {
  id: "aaaaaaaa-0000-4000-8000-000000000001",
  displayName: "Learner",
  avatar: { kind: "initials" },
  joinedAt: "2026-09-10T12:00:00.000Z",
  onboardedAt: "2026-09-10T12:05:00.000Z",
  updatedAt: NOW,
};
const hearts: HeartsState = { current: 5, refillStartedAt: null, updatedAt: NOW };

const today = () => toLocalDate(new Date(), deviceTimeZone());

let session: LocalSession;

/** Profile on a memory session with real settings writes (like ProfileScreen test 14). */
async function renderProfile(initial: Partial<Settings> = {}) {
  const opened = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => opened });
  await store.getState().init();
  session = await opened;
  const settings = await session.profile.updateSettings({
    courseId: "en-de",
    dailyGoalXp: 10,
    ...initial,
  });
  guestProfileStore.setState({
    status: "ready",
    profile,
    onboardingComplete: true,
    updateSettings: store.getState().updateSettings,
  });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  client.setQueryData(queryKeys.hearts(), hearts);
  client.setQueryData(queryKeys.progress("en-de"), []);
  renderWithQueryClient(
    <ToastProvider>
      <ProfileScreen />
    </ToastProvider>,
    { client },
  );
  return { client, user: userEvent.setup() };
}

const rowButton = (name: string) => screen.findByRole("button", { name });
const dialog = () => screen.getByRole("dialog", { name: "Your goal date" });
const dateInput = () => within(dialog()).getByLabelText("By when?");

function typeDate(value: string) {
  fireEvent.change(dateInput(), { target: { value } });
}

async function seriousViolations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

describe("Profile goal date row and dialog (PLT-027)", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/profile");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1: 'Goal date' sits under 'Daily goal' with 'Not set' and a 'Set' button", async () => {
    await renderProfile();
    const set = await rowButton(SET_GOAL_DATE);
    expect(set).toHaveTextContent(/^Set$/);
    expect(screen.getByTestId("goal-date-value")).toHaveTextContent("Not set");
    const headings = within(document.getElementById("settings")!)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings.indexOf("Goal date")).toBe(headings.indexOf("Daily goal") + 1);
  });

  it("1: a saved plan shows 'Finish A2 by <date>' and 'Change'", async () => {
    await renderProfile({ goalPlan: { targetLevel: "A2", targetDate: "2027-03-12" } });
    const change = await rowButton(CHANGE_GOAL_DATE);
    expect(change).toHaveTextContent(/^Change$/);
    expect(screen.getByTestId("goal-date-value")).toHaveTextContent("Finish A2 by 12 Mar 2027");
  });

  it("2: the dialog offers A1 and A2 (A2 preselected) and a date field from tomorrow to +730", async () => {
    const { user } = await renderProfile();
    await user.click(await rowButton(SET_GOAL_DATE));
    const group = within(dialog()).getByRole("radiogroup", {
      name: "Which level do you want to finish?",
    });
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((r) => r.textContent)).toEqual([
      expect.stringContaining("A1"),
      expect.stringContaining("A2"),
    ]);
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    const input = dateInput();
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("min", addDays(today(), 1));
    expect(input).toHaveAttribute("max", addDays(today(), 730));
  });

  it("2: with start level A2 only A2 is offered", async () => {
    const { user } = await renderProfile({ startLevel: "A2" });
    await user.click(await rowButton(SET_GOAL_DATE));
    const radios = within(dialog()).getAllByRole("radio");
    expect(radios).toHaveLength(1);
    expect(radios[0]).toHaveTextContent("A2");
  });

  it("3: a valid date shows the preview; a near date adds the tight line", async () => {
    const { user } = await renderProfile();
    await user.click(await rowButton(SET_GOAL_DATE));
    const preview = within(dialog()).getByTestId("goal-date-preview");
    expect(preview).toBeEmptyDOMElement();
    typeDate(addDays(today(), 111));
    expect(preview).toHaveTextContent(
      "130 lessons left · about 2 lessons a day. Suggested daily goal: 20 XP.",
    );
    typeDate(addDays(today(), 10));
    expect(preview).toHaveTextContent(
      "130 lessons left · about 13 lessons a day. Suggested daily goal: 50 XP.",
    );
    expect(preview).toHaveTextContent("This date is tight. You could pick a later date.");
    // Choosing A1 recomputes with the dialog's values.
    await user.click(within(dialog()).getByRole("radio", { name: /A1/ }));
    expect(preview).toHaveTextContent("60 lessons left · about 6 lessons a day.");
  });

  it("4: Save validates the date, links the error to the field and focuses it", async () => {
    const { user } = await renderProfile();
    await user.click(await rowButton(SET_GOAL_DATE));
    const save = within(dialog()).getByRole("button", { name: "Save" });
    const cases: [string, string][] = [
      ["", GOAL_DATE_ERRORS.empty],
      [today(), GOAL_DATE_ERRORS.notAfterToday],
      [addDays(today(), -3), GOAL_DATE_ERRORS.notAfterToday],
      [addDays(today(), 731), GOAL_DATE_ERRORS.tooLate],
    ];
    for (const [value, message] of cases) {
      typeDate(value);
      await user.click(save);
      const input = dateInput();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription(message);
      expect(input).toHaveFocus();
    }
    expect((await session.profile.getSettings())?.goalPlan).toBeUndefined();
  });

  it("5: Save stores the plan, closes, toasts, returns focus and keeps the daily goal", async () => {
    const { user, client } = await renderProfile();
    const set = await rowButton(SET_GOAL_DATE);
    await user.click(set);
    const target = addDays(today(), 111);
    typeDate(target);
    await user.click(within(dialog()).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(await screen.findByText(GOAL_DATE_SAVED)).toBeInTheDocument();
    expect(screen.getByTestId("goal-date-value")).toHaveTextContent(
      `Finish A2 by ${formatGoalDate(target)}`,
    );
    const stored = await session.profile.getSettings();
    expect(stored?.goalPlan).toEqual({ targetLevel: "A2", targetDate: target });
    expect(stored?.dailyGoalXp).toBe(10);
    expect(client.getQueryData<Settings>(queryKeys.settings())?.goalPlan?.targetDate).toBe(target);
    const change = screen.getByRole("button", { name: CHANGE_GOAL_DATE });
    expect(change).toBe(set);
    expect(change).toHaveFocus();
  });

  it("6: Remove clears the plan with goalPlan: null and the row shows 'Not set'", async () => {
    const { user } = await renderProfile({
      goalPlan: { targetLevel: "A2", targetDate: addDays(today(), 50) },
    });
    await user.click(await rowButton(CHANGE_GOAL_DATE));
    expect(dateInput()).toHaveValue(addDays(today(), 50));
    await user.click(within(dialog()).getByRole("button", { name: "Remove goal date" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(await screen.findByText(GOAL_DATE_REMOVED)).toBeInTheDocument();
    expect(screen.getByTestId("goal-date-value")).toHaveTextContent("Not set");
    const stored = await session.profile.getSettings();
    expect(stored).toHaveProperty("goalPlan", null);
    expect(screen.getByRole("button", { name: SET_GOAL_DATE })).toHaveFocus();
  });

  it("6: no Remove button without a saved plan", async () => {
    const { user } = await renderProfile();
    await user.click(await rowButton(SET_GOAL_DATE));
    expect(
      within(dialog()).queryByRole("button", { name: "Remove goal date" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    [
      "Cancel",
      async (user: ReturnType<typeof userEvent.setup>) =>
        user.click(within(dialog()).getByRole("button", { name: "Cancel" })),
    ],
    ["Escape", async (user: ReturnType<typeof userEvent.setup>) => user.keyboard("{Escape}")],
    [
      "the close button",
      async (user: ReturnType<typeof userEvent.setup>) =>
        user.click(within(dialog()).getByRole("button", { name: "Close" })),
    ],
  ])("7: %s discards the dialog's values and returns focus", async (_name, dismiss) => {
    const { user } = await renderProfile();
    const set = await rowButton(SET_GOAL_DATE);
    await user.click(set);
    await user.click(within(dialog()).getByRole("radio", { name: /A1/ }));
    typeDate(addDays(today(), 30));
    await dismiss(user);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(set).toHaveFocus();
    expect(screen.getByTestId("goal-date-value")).toHaveTextContent("Not set");
    await user.click(set);
    expect(dateInput()).toHaveValue("");
    expect(within(dialog()).getByRole("radio", { name: /A2/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("8: a failed save keeps the dialog open with its values and an inline error", async () => {
    const { user } = await renderProfile({
      goalPlan: { targetLevel: "A2", targetDate: addDays(today(), 50) },
    });
    guestProfileStore.setState({
      updateSettings: vi.fn().mockRejectedValue(new Error("disk full")),
    });
    await user.click(await rowButton(CHANGE_GOAL_DATE));
    await user.click(within(dialog()).getByRole("radio", { name: /A1/ }));
    typeDate(addDays(today(), 80));
    await user.click(within(dialog()).getByRole("button", { name: "Save" }));
    expect(await within(dialog()).findByRole("alert")).toHaveTextContent(GOAL_DATE_SAVE_ERROR);
    expect(dateInput()).toHaveValue(addDays(today(), 80));
    expect(within(dialog()).getByRole("radio", { name: /A1/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // Remove fails the same way.
    await user.click(within(dialog()).getByRole("button", { name: "Remove goal date" }));
    expect(await within(dialog()).findByRole("alert")).toHaveTextContent(GOAL_DATE_SAVE_ERROR);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect((await session.profile.getSettings())?.goalPlan?.targetLevel).toBe("A2");
  });

  it("9: /profile?edit=goal-date opens the dialog once; closing replaces the URL", async () => {
    window.history.replaceState(null, "", "/profile?edit=goal-date");
    const length = window.history.length;
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { user } = await renderProfile();
    expect(await screen.findByRole("dialog", { name: "Your goal date" })).toBeInTheDocument();
    expect(scroll).toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.location.pathname + window.location.search).toBe("/profile");
    expect(window.history.length).toBe(length);
    // Re-rendering doesn't open it again.
    await act(async () => {});
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each(["en-es", "einbuergerung-en-de"])(
    "FIX-014: no goal-date row on %s (a course without levels)",
    async (courseId) => {
      await renderProfile({ courseId });
      await screen.findByRole("heading", { level: 3, name: "Daily goal" });
      await waitFor(() =>
        expect(
          screen.queryByRole("heading", { level: 3, name: "Goal date" }),
        ).not.toBeInTheDocument(),
      );
      expect(screen.queryByRole("button", { name: SET_GOAL_DATE })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: CHANGE_GOAL_DATE })).not.toBeInTheDocument();
    },
  );

  it.each(["en-es", "einbuergerung-en-de"])(
    "FIX-014 AC 3: /profile?edit=goal-date on %s opens no dialog and drops the param with replace",
    async (courseId) => {
      window.history.replaceState(null, "", "/profile?edit=goal-date");
      const length = window.history.length;
      const replace = vi.spyOn(window.history, "replaceState");
      const plan = { targetLevel: "A2" as const, targetDate: addDays(today(), 50) };
      await renderProfile({ courseId, goalPlan: plan });
      await screen.findByRole("heading", { level: 3, name: "Daily goal" });
      await waitFor(() => expect(window.location.search).toBe(""));
      expect(window.location.pathname).toBe("/profile");
      expect(replace).toHaveBeenCalled();
      expect(window.history.length).toBe(length);
      await act(async () => {});
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      // No error toast or inline error (the toast region itself stays empty).
      for (const alert of screen.queryAllByRole("alert")) expect(alert).toHaveTextContent("");
      expect(
        screen.queryByRole("heading", { level: 3, name: "Goal date" }),
      ).not.toBeInTheDocument();
      // AC 4: the saved plan is untouched.
      expect((await session.profile.getSettings())?.goalPlan).toEqual(plan);
    },
  );

  it("16: no serious or critical axe violations with the dialog open", async () => {
    const { user } = await renderProfile();
    await user.click(await rowButton(SET_GOAL_DATE));
    typeDate(addDays(today(), 111));
    expect(await seriousViolations(document.body)).toEqual([]);
  });
});
