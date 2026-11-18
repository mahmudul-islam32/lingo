import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Settings } from "@/contracts";
import { createGuestProfileStore, guestProfileStore } from "@/features/profile";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import {
  CHANGE_START_LEVEL,
  LOWER_LEVEL_WARNING,
  START_LEVEL_SAVE_ERROR,
  StartLevelRow,
} from "../StartLevelRow";

let session: LocalSession;

async function setup(startLevel?: Settings["startLevel"]) {
  const opened = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => opened });
  await store.getState().init();
  session = await opened;
  const settings = await session.profile.updateSettings({
    courseId: "en-de",
    dailyGoalXp: 20,
    ...(startLevel ? { startLevel } : {}),
  });
  // The row saves through the app-wide store: point it at this test's memory session.
  guestProfileStore.setState({ updateSettings: store.getState().updateSettings });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  const user = userEvent.setup();
  renderWithQueryClient(<StartLevelRow />, { client });
  const value = await screen.findByTestId("start-level-value");
  return { user, client, value };
}

const change = () => screen.getByRole("button", { name: CHANGE_START_LEVEL });

describe("Profile start level row (PLT-025)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("7: shows A1 · Beginner when not set and a Change button", async () => {
    const { value } = await setup();
    expect(screen.getByRole("heading", { name: "Start level" })).toBeInTheDocument();
    expect(value).toHaveTextContent("A1 · Beginner");
    expect(change()).toHaveTextContent("Change");
  });

  it("8, 10: Save stores the level, closes the dialog, updates the row; focus returns", async () => {
    const { user, client, value } = await setup();
    await user.click(change());
    const dialog = screen.getByRole("dialog", { name: CHANGE_START_LEVEL });
    const a1 = within(dialog).getByRole("radio", { name: "A1 · Beginner" });
    expect(a1).toHaveAttribute("aria-checked", "true");
    await user.click(within(dialog).getByRole("radio", { name: "A2 · Elementary" }));
    expect(screen.queryByText(LOWER_LEVEL_WARNING)).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(value).toHaveTextContent("A2 · Elementary");
    expect((await session.profile.getSettings()).startLevel).toBe("A2");
    expect(client.getQueryData<Settings>(queryKeys.settings())?.startLevel).toBe("A2");
    expect(change()).toHaveFocus();
  });

  it("8: Cancel and Escape change nothing", async () => {
    const { user, value } = await setup("A2");
    expect(value).toHaveTextContent("A2 · Elementary");
    await user.click(change());
    await user.click(screen.getByRole("radio", { name: "A1 · Beginner" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(change()).toHaveFocus();

    await user.click(change());
    // Reopening starts from the stored level, not the cancelled draft.
    expect(screen.getByRole("radio", { name: "A2 · Elementary" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.click(screen.getByRole("radio", { name: "A1 · Beginner" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(value).toHaveTextContent("A2 · Elementary");
    expect((await session.profile.getSettings()).startLevel).toBe("A2");
  });

  it("9: lowering the level warns before saving; going back to A1 saves an explicit A1", async () => {
    const { user, value } = await setup("A2");
    await user.click(change());
    expect(screen.queryByText(LOWER_LEVEL_WARNING)).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "A1 · Beginner" }));
    expect(screen.getByText(LOWER_LEVEL_WARNING)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(value).toHaveTextContent("A1 · Beginner"));
    expect((await session.profile.getSettings()).startLevel).toBe("A1");
  });

  it("10: a failed save keeps the old level and shows the error", async () => {
    const { user, value } = await setup();
    guestProfileStore.setState({ updateSettings: () => Promise.reject(new Error("disk full")) });
    await user.click(change());
    await user.click(screen.getByRole("radio", { name: "A2 · Elementary" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(START_LEVEL_SAVE_ERROR);
    expect(value).toHaveTextContent("A1 · Beginner");
    expect((await session.profile.getSettings()).startLevel).toBeUndefined();
  });

  it("is hidden for a course without a level choice (en-es)", async () => {
    const opened = await openLocalSession({ forceMemory: true });
    const settings = await opened.profile.updateSettings({ courseId: "en-es", dailyGoalXp: 10 });
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.settings(), settings);
    const { container } = renderWithQueryClient(<StartLevelRow />, { client });
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
