import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGuestProfileStore } from "@/features/profile";
import { INSTALL_DISMISSED_KEY, openLocalSession } from "@/lib/offline";
import { navigationState } from "./navigation-mock";
import { createInstallPromptStore } from "../../_pwa/install-prompt-store";
import {
  INSTALL_BODY,
  INSTALL_TITLE,
  IOS_STEPS,
  InstallCard,
  InstallPromptCapture,
} from "../InstallCard";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-11-08T10:00:00.000Z");

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  };
}

interface FakeWindowOptions {
  standalone?: boolean;
  ios?: boolean;
}

/** A real EventTarget standing in for `window`, so tests own its listeners. */
function fakeWindow({ standalone = false, ios = false }: FakeWindowOptions = {}) {
  const target = new EventTarget() as EventTarget & {
    matchMedia: (q: string) => { matches: boolean };
    navigator: { userAgent: string; standalone?: boolean };
  };
  target.matchMedia = (q) => ({ matches: standalone && q === "(display-mode: standalone)" });
  target.navigator = {
    userAgent: ios
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari"
      : "Mozilla/5.0 (Linux; Android 14; Pixel 7) Chrome",
  };
  return target as unknown as Window;
}

/** A fake `beforeinstallprompt` event with a controllable outcome. */
function fakePromptEvent(outcome: "accepted" | "dismissed" | "error" = "accepted") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: string }>;
  };
  event.prompt = vi.fn(() =>
    outcome === "error" ? Promise.reject(new Error("not allowed")) : Promise.resolve(),
  );
  event.userChoice = Promise.resolve({ outcome: outcome === "error" ? "dismissed" : outcome });
  return event;
}

async function onboardedProfileStore(onboarded = true) {
  const store = createGuestProfileStore({
    loadSession: () => openLocalSession({ forceMemory: true }),
  });
  store.setState({ onboardingComplete: onboarded, status: "ready" });
  return store;
}

async function setup(
  options: FakeWindowOptions & { dismissedAt?: string; now?: number; onboarded?: boolean } = {},
) {
  const win = fakeWindow(options);
  const storage = memoryStorage();
  if (options.dismissedAt) storage.setItem(INSTALL_DISMISSED_KEY, options.dismissedAt);
  const store = createInstallPromptStore(() => ({ window: win, storage }));
  const profileStore = await onboardedProfileStore(options.onboarded ?? true);
  const clock = { now: options.now ?? NOW };
  const utils = render(
    <>
      <InstallPromptCapture store={store} />
      <InstallCard store={store} profileStore={profileStore} now={() => clock.now} />
    </>,
  );
  return { ...utils, win, storage, store, clock };
}

const card = () => screen.queryByRole("status", { name: INSTALL_TITLE });

describe("InstallCard (PLT-005)", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("captures beforeinstallprompt, prevents the mini-infobar and shows the card", async () => {
    const { win } = await setup();
    expect(card()).not.toBeInTheDocument();

    const event = fakePromptEvent();
    act(() => void win.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);

    const region = card();
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("heading", { level: 2, name: INSTALL_TITLE })).toBeInTheDocument();
    expect(screen.getByText(INSTALL_BODY)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Install" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not now" })).toBeInTheDocument();
  });

  it("Install opens the native prompt; accepting hides the card for good", async () => {
    const user = userEvent.setup();
    const { win, storage } = await setup();
    const event = fakePromptEvent("accepted");
    act(() => void win.dispatchEvent(event));

    // Keyboard: Tab to Install and press Enter.
    await user.tab();
    expect(screen.getByRole("button", { name: "Install" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(card()).not.toBeInTheDocument();
    expect(storage.getItem(INSTALL_DISMISSED_KEY)).toBeNull();

    // Even if the browser fires the event again in this session, the card stays away.
    act(() => void win.dispatchEvent(fakePromptEvent()));
    expect(card()).not.toBeInTheDocument();
  });

  it.each(["dismissed", "error"] as const)(
    "a %s native prompt hides the card for 7 days without an error",
    async (outcome) => {
      const user = userEvent.setup();
      const { win, storage } = await setup();
      act(() => void win.dispatchEvent(fakePromptEvent(outcome)));
      await user.click(screen.getByRole("button", { name: "Install" }));
      expect(card()).not.toBeInTheDocument();
      expect(storage.getItem(INSTALL_DISMISSED_KEY)).toBe(new Date(NOW).toISOString());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("Not now hides the card and stores the dismissal time", async () => {
    const user = userEvent.setup();
    const { win, storage, store } = await setup();
    const event = fakePromptEvent();
    act(() => void win.dispatchEvent(event));

    await user.click(screen.getByRole("button", { name: "Not now" }));
    expect(card()).not.toBeInTheDocument();
    expect(event.prompt).not.toHaveBeenCalled();
    expect(storage.getItem(INSTALL_DISMISSED_KEY)).toBe(new Date(NOW).toISOString());
    // The event is kept for later.
    expect(store.getState().promptEvent).toBe(event);
  });

  it("stays hidden on day 6 after a dismissal and returns on day 8", async () => {
    const dismissedAt = new Date(NOW).toISOString();
    const day6 = await setup({ dismissedAt, now: NOW + 6 * DAY });
    act(() => void day6.win.dispatchEvent(fakePromptEvent()));
    expect(card()).not.toBeInTheDocument();
    day6.unmount();

    const day8 = await setup({ dismissedAt, now: NOW + 8 * DAY });
    act(() => void day8.win.dispatchEvent(fakePromptEvent()));
    expect(card()).toBeInTheDocument();
  });

  it("never shows when the app already runs installed", async () => {
    const { win } = await setup({ standalone: true });
    act(() => void win.dispatchEvent(fakePromptEvent()));
    expect(card()).not.toBeInTheDocument();
  });

  it("never shows off the Learn tab or before onboarding", async () => {
    navigationState.pathname = "/profile";
    const offTab = await setup();
    act(() => void offTab.win.dispatchEvent(fakePromptEvent()));
    expect(card()).not.toBeInTheDocument();
    offTab.unmount();

    navigationState.pathname = "/";
    const notOnboarded = await setup({ onboarded: false });
    act(() => void notOnboarded.win.dispatchEvent(fakePromptEvent()));
    expect(card()).not.toBeInTheDocument();
  });

  it("shows the Share steps with Got it on iOS, with the same 7-day rule", async () => {
    const user = userEvent.setup();
    const { storage, unmount } = await setup({ ios: true });
    expect(card()).toBeInTheDocument();
    expect(screen.getByText(`${IOS_STEPS}.`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Install" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(card()).not.toBeInTheDocument();
    const dismissedAt = storage.getItem(INSTALL_DISMISSED_KEY)!;
    expect(dismissedAt).toBe(new Date(NOW).toISOString());
    unmount();

    await setup({ ios: true, dismissedAt, now: NOW + 6 * DAY });
    expect(card()).not.toBeInTheDocument();
  });

  it("hides once the app gets installed from the browser menu", async () => {
    const { win } = await setup();
    act(() => void win.dispatchEvent(fakePromptEvent()));
    expect(card()).toBeInTheDocument();
    act(() => void win.dispatchEvent(new Event("appinstalled")));
    expect(card()).not.toBeInTheDocument();
  });
});
