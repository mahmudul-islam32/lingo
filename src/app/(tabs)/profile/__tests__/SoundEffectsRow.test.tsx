import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Settings } from "@/contracts";
import { createGuestProfileStore, guestProfileStore } from "@/features/profile";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import {
  SOUND_EFFECTS_SAVE_ERROR,
  SoundEffectsRow,
  TURN_SOUND_EFFECTS_OFF,
  TURN_SOUND_EFFECTS_ON,
} from "../SoundEffectsRow";

const { play } = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock("@/features/lessons", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/lessons")>()),
  sharedSoundEffects: () => ({ play }),
}));

let session: LocalSession;

async function setup(soundEffectsEnabled = true) {
  const opened = openLocalSession({ forceMemory: true });
  const store = createGuestProfileStore({ loadSession: () => opened });
  await store.getState().init();
  session = await opened;
  const settings = await session.profile.updateSettings({
    courseId: "en-de",
    dailyGoalXp: 20,
    soundEffectsEnabled,
  });
  // The row saves through the app-wide store: point it at this test's memory session.
  guestProfileStore.setState({ updateSettings: store.getState().updateSettings });
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.settings(), settings);
  const user = userEvent.setup();
  renderWithQueryClient(<SoundEffectsRow />, { client });
  const value = await screen.findByTestId("sound-effects-value");
  return { user, client, value };
}

describe("Profile sound effects row (LES-012)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    play.mockReset();
  });

  it("shows On and turns sound effects off, silently", async () => {
    const { user, client, value } = await setup(true);
    expect(screen.getByRole("heading", { name: "Sound effects" })).toBeInTheDocument();
    expect(value).toHaveTextContent("On");
    await user.click(screen.getByRole("button", { name: TURN_SOUND_EFFECTS_OFF }));

    await waitFor(() => expect(value).toHaveTextContent("Off"));
    expect((await session.profile.getSettings()).soundEffectsEnabled).toBe(false);
    expect(client.getQueryData<Settings>(queryKeys.settings())?.soundEffectsEnabled).toBe(false);
    expect(screen.getByRole("button", { name: TURN_SOUND_EFFECTS_ON })).toHaveTextContent(
      "Turn on",
    );
    expect(play).not.toHaveBeenCalled();
  });

  it("turning sound effects on saves and plays a preview chime", async () => {
    const { user, value } = await setup(false);
    expect(value).toHaveTextContent("Off");
    await user.click(screen.getByRole("button", { name: TURN_SOUND_EFFECTS_ON }));

    await waitFor(() => expect(value).toHaveTextContent("On"));
    expect((await session.profile.getSettings()).soundEffectsEnabled).toBe(true);
    expect(play).toHaveBeenCalledWith("correct");
  });

  it("shows an error and keeps the value when saving fails", async () => {
    const { user, value } = await setup(true);
    guestProfileStore.setState({
      updateSettings: () => Promise.reject(new Error("disk full")),
    });
    await user.click(screen.getByRole("button", { name: TURN_SOUND_EFFECTS_OFF }));

    expect(await screen.findByRole("alert")).toHaveTextContent(SOUND_EFFECTS_SAVE_ERROR);
    expect(value).toHaveTextContent("On");
  });
});
