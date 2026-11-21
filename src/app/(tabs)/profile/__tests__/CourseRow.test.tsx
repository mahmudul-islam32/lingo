import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Settings } from "@/contracts";
import { createGuestProfileStore, guestProfileStore } from "@/features/profile";
import { openLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { CHANGE_COURSE, CourseRow } from "../CourseRow";

async function setup() {
  const opened = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => opened });
  await store.getState().init();
  const session = await opened;
  const settings = await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
  guestProfileStore.setState({ updateSettings: store.getState().updateSettings });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  const user = userEvent.setup();
  renderWithQueryClient(<CourseRow />, { client });
  const value = await screen.findByTestId("course-value");
  return { user, client, value, session };
}

describe("Profile course row (TELC-001)", () => {
  it("shows the current course and switches to an exam course", async () => {
    const { user, client, value, session } = await setup();
    expect(value).toHaveTextContent("German");
    await user.click(screen.getByRole("button", { name: CHANGE_COURSE }));
    const dialog = screen.getByRole("dialog", { name: CHANGE_COURSE });
    expect(within(dialog).getByRole("radio", { name: /German/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // Hidden courses (Spanish) are not offered.
    expect(within(dialog).queryByRole("radio", { name: /Spanish/ })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("radio", { name: /Einbürgerungstest/ }));
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(value).toHaveTextContent("Einbürgerungstest");
    expect((await session.profile.getSettings())?.courseId).toBe("einbuergerung-en-de");
    expect(client.getQueryData<Settings>(queryKeys.settings())?.courseId).toBe(
      "einbuergerung-en-de",
    );
  });
});
