import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountSwitchOverlay } from "../components/AccountSwitchOverlay";
import { SaveProgressDialog } from "../components/SaveProgressDialog";
import { accountSwitchStore } from "../account-switch";
import {
  offerSaveProgress,
  promptThreshold,
  readShownThresholds,
  saveProgressPromptStore,
  type OfferDeps,
} from "../save-progress-prompt";

let onLine: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  window.localStorage.clear();
  saveProgressPromptStore.setState({ open: false });
  onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});
afterEach(() => vi.restoreAllMocks());

function offerDeps(over: Partial<OfferDeps> & { lessonCount?: number; guest?: boolean } = {}) {
  return {
    enabled: () => true,
    online: () => true,
    signedIn: () => false,
    readDevice: async () => ({ guest: over.guest ?? true, lessonCount: over.lessonCount ?? 1 }),
    ...over,
  } satisfies OfferDeps;
}

describe("save-your-progress rules (PLT-013 criteria 1–2)", () => {
  it.each([
    [0, [], null],
    [1, [], 1],
    [2, [1], null],
    [4, [1], null],
    [5, [1], 5],
    [9, [1, 5], null],
    [30, [], 5],
  ])("%i lessons, shown %j → %s", (count, shown, threshold) => {
    expect(promptThreshold(count, shown)).toBe(threshold);
  });

  it("opens after the 1st and the 5th lesson, then never by itself", async () => {
    for (let count = 1; count <= 8; count += 1) {
      const opened = await offerSaveProgress(offerDeps({ lessonCount: count }));
      expect(opened, `lesson ${count}`).toBe(count === 1 || count === 5);
      saveProgressPromptStore.setState({ open: false });
    }
    expect(readShownThresholds()).toEqual([1, 5]);
  });

  it("a long-time guest sees it once", async () => {
    expect(await offerSaveProgress(offerDeps({ lessonCount: 30 }))).toBe(true);
    expect(await offerSaveProgress(offerDeps({ lessonCount: 31 }))).toBe(false);
  });

  it.each([
    ["offline", { online: () => false }],
    ["accounts disabled", { enabled: () => false }],
    ["signed in", { signedIn: () => true }],
    ["an account device", { guest: false }],
  ])("never opens %s", async (_, over) => {
    expect(await offerSaveProgress(offerDeps(over))).toBe(false);
    expect(saveProgressPromptStore.getState().open).toBe(false);
    expect(readShownThresholds()).toEqual([]);
  });
});

describe("SaveProgressDialog (PLT-013 criteria 1, 2, 12)", () => {
  function openDialog() {
    const trigger = document.createElement("button");
    trigger.textContent = "Continue";
    document.body.append(trigger);
    trigger.focus();
    render(<SaveProgressDialog />);
    act(() => saveProgressPromptStore.setState({ open: true }));
    return trigger;
  }

  it("is a labelled dialog with the copy, Create account and Not now", () => {
    openDialog();
    const dialog = screen.getByRole("dialog", { name: "Save your progress" });
    expect(dialog).toHaveAccessibleDescription(
      "Create an account to keep your XP, streak and goal date on every device.",
    );
    const create = screen.getByRole("link", { name: "Create account" });
    expect(create).toHaveAttribute("href", "/sign-up");
    expect(create).toHaveFocus();
    expect(screen.getByRole("button", { name: "Not now" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close" })).toBeVisible();
  });

  it.each([
    [
      "Not now",
      async () => userEvent.setup().click(screen.getByRole("button", { name: "Not now" })),
    ],
    ["Close", async () => userEvent.setup().click(screen.getByRole("button", { name: "Close" }))],
    ["Escape", async () => userEvent.setup().keyboard("{Escape}")],
  ])("%s dismisses it and returns focus", async (_, dismiss) => {
    const trigger = openDialog();
    await dismiss();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("traps focus inside", async () => {
    openDialog();
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("closes when the device goes offline", () => {
    openDialog();
    act(() => {
      onLine.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(saveProgressPromptStore.getState().open).toBe(false);
  });
});

describe("AccountSwitchOverlay (PLT-013 criterion 5)", () => {
  it("shows Saving your progress… only while saving", () => {
    render(<AccountSwitchOverlay />);
    expect(screen.queryByText("Saving your progress…")).toBeNull();
    act(() => accountSwitchStore.setState({ phase: "saving" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saving your progress…");
    act(() => accountSwitchStore.setState({ phase: "saved" }));
    expect(screen.queryByText("Saving your progress…")).toBeNull();
  });
});
