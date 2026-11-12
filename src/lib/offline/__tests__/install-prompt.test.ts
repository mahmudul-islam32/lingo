import { describe, expect, it } from "vitest";
import {
  INSTALL_DISMISS_MS,
  INSTALL_DISMISSED_KEY,
  isDismissalActive,
  isIosDevice,
  isStandaloneDisplay,
  readInstallDismissedAt,
  shouldShowInstallCard,
  writeInstallDismissedAt,
  type InstallCardInput,
} from "../install-prompt";

const DAY = 24 * 60 * 60 * 1000;
const DISMISSED = Date.parse("2026-11-01T09:00:00.000Z");

const base: InstallCardInput = {
  now: DISMISSED,
  dismissedAt: null,
  isStandalone: false,
  onboarded: true,
  onLearnTab: true,
  hasPromptEvent: true,
  isIos: false,
};

describe("shouldShowInstallCard (PLT-005)", () => {
  it("uses seven days in ms", () => {
    expect(INSTALL_DISMISS_MS).toBe(7 * DAY);
  });

  it.each<[string, Partial<InstallCardInput>, ReturnType<typeof shouldShowInstallCard>]>([
    ["shown when the prompt event is available", {}, "prompt"],
    [
      "hidden right after a dismissal",
      { dismissedAt: new Date(DISMISSED).toISOString() },
      "hidden",
    ],
    [
      "still hidden on day 6",
      { dismissedAt: new Date(DISMISSED).toISOString(), now: DISMISSED + 6 * DAY },
      "hidden",
    ],
    [
      "still hidden 1 ms before seven days",
      { dismissedAt: new Date(DISMISSED).toISOString(), now: DISMISSED + 7 * DAY - 1 },
      "hidden",
    ],
    [
      "shown again exactly seven days later",
      { dismissedAt: new Date(DISMISSED).toISOString(), now: DISMISSED + 7 * DAY },
      "prompt",
    ],
    [
      "shown again on day 8",
      { dismissedAt: new Date(DISMISSED).toISOString(), now: DISMISSED + 8 * DAY },
      "prompt",
    ],
    ["hidden when already installed (standalone)", { isStandalone: true }, "hidden"],
    [
      "hidden when installed even on iOS",
      { isStandalone: true, isIos: true, hasPromptEvent: false },
      "hidden",
    ],
    ["hidden before onboarding is complete", { onboarded: false }, "hidden"],
    ["hidden off the Learn tab", { onLearnTab: false }, "hidden"],
    ["hidden without an event outside iOS", { hasPromptEvent: false }, "hidden"],
    [
      "iOS steps when there is no event on iOS",
      { hasPromptEvent: false, isIos: true },
      "ios-steps",
    ],
    [
      "iOS steps follow the same 7-day rule (day 6)",
      {
        hasPromptEvent: false,
        isIos: true,
        dismissedAt: new Date(DISMISSED).toISOString(),
        now: DISMISSED + 6 * DAY,
      },
      "hidden",
    ],
    [
      "iOS steps follow the same 7-day rule (day 8)",
      {
        hasPromptEvent: false,
        isIos: true,
        dismissedAt: new Date(DISMISSED).toISOString(),
        now: DISMISSED + 8 * DAY,
      },
      "ios-steps",
    ],
    ["an unreadable dismissal value does not hide the card", { dismissedAt: "garbage" }, "prompt"],
  ])("%s", (_name, patch, expected) => {
    expect(shouldShowInstallCard({ ...base, ...patch })).toBe(expected);
  });

  it("isDismissalActive is false when never dismissed", () => {
    expect(isDismissalActive(null, DISMISSED)).toBe(false);
  });
});

describe("isStandaloneDisplay (PLT-005 criterion 5)", () => {
  const media = (standalone: boolean) => (query: string) => ({
    matches: standalone && query === "(display-mode: standalone)",
  });

  it.each([
    ["display-mode standalone", media(true), {}, true],
    ["iOS navigator.standalone", media(false), { standalone: true }, true],
    ["a browser tab", media(false), { standalone: false }, false],
    ["no matchMedia and no flag", undefined, {}, false],
  ])("%s", (_name, matchMedia, nav, expected) => {
    expect(isStandaloneDisplay(matchMedia, nav)).toBe(expected);
  });

  it("treats a throwing matchMedia as not installed", () => {
    const throwing = () => {
      throw new Error("nope");
    };
    expect(isStandaloneDisplay(throwing, {})).toBe(false);
  });
});

describe("isIosDevice", () => {
  it.each([
    ["iPhone", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" }, true],
    [
      "iPadOS desktop UA",
      { userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 },
      true,
    ],
    ["Mac", { userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 0 }, false],
    ["Android", { userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7)" }, false],
  ])("%s", (_name, nav, expected) => {
    expect(isIosDevice(nav)).toBe(expected);
  });
});

describe("dismissal storage", () => {
  it("writes and reads an ISO string under the agreed key", () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
    };
    expect(readInstallDismissedAt(storage)).toBeNull();
    const iso = writeInstallDismissedAt(storage, DISMISSED);
    expect(iso).toBe("2026-11-01T09:00:00.000Z");
    expect(map.get(INSTALL_DISMISSED_KEY)).toBe(iso);
    expect(readInstallDismissedAt(storage)).toBe(iso);
  });

  it("survives storage that throws (private mode)", () => {
    const storage = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(readInstallDismissedAt(storage)).toBeNull();
    expect(writeInstallDismissedAt(storage, DISMISSED)).toBe("2026-11-01T09:00:00.000Z");
    expect(readInstallDismissedAt(undefined)).toBeNull();
  });
});
