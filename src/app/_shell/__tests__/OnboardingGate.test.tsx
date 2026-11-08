import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGuestProfileStore } from "@/features/profile";
import { openLocalSession } from "@/lib/offline";
import { OnboardingGate } from "../OnboardingGate";

const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/" }));

function newStore() {
  return createGuestProfileStore({ loadSession: () => openLocalSession({ forceMemory: true }) });
}

const content = () => <h1>Content</h1>;

describe("OnboardingGate (PLT-004 criterion 9)", () => {
  beforeEach(() => router.replace.mockReset());

  it("shows the loading UI until the profile is ready, without redirecting", () => {
    const store = newStore();
    store.setState({ status: "loading" });
    render(
      <OnboardingGate require="onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Content" })).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("tabs: a learner who hasn't onboarded is replaced to /onboarding", async () => {
    const store = newStore();
    render(
      <OnboardingGate require="onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    // The gate starts init() itself when nothing else has.
    await act(async () => {
      await store.getState().init();
    });
    expect(store.getState().status).toBe("ready");
    expect(router.replace).toHaveBeenCalledWith("/onboarding");
    expect(router.push).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Content" })).not.toBeInTheDocument();
  });

  it("tabs: an onboarded learner sees the content", () => {
    const store = newStore();
    store.setState({ status: "ready", onboardingComplete: true });
    render(
      <OnboardingGate require="onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    expect(screen.getByRole("heading", { name: "Content" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("onboarding: an onboarded learner is replaced to /", () => {
    const store = newStore();
    store.setState({ status: "ready", onboardingComplete: true });
    render(
      <OnboardingGate require="not-onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    expect(router.replace).toHaveBeenCalledWith("/");
    expect(screen.queryByRole("heading", { name: "Content" })).not.toBeInTheDocument();
  });

  it("onboarding: a new learner sees onboarding", () => {
    const store = newStore();
    store.setState({ status: "ready", onboardingComplete: false });
    render(
      <OnboardingGate require="not-onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    expect(screen.getByRole("heading", { name: "Content" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("shows the error UI with a retry when the profile can't be loaded", () => {
    const store = newStore();
    const init = vi.fn(async () => {});
    store.setState({ status: "error", error: new Error("broken"), init });
    render(
      <OnboardingGate require="onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Try again" }).click());
    expect(init).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("onboarding: finishing it in place doesn't redirect to / (the flow goes to Lesson 1)", () => {
    const store = newStore();
    store.setState({ status: "ready", onboardingComplete: false });
    render(
      <OnboardingGate require="not-onboarded" store={store}>
        {content()}
      </OnboardingGate>,
    );
    expect(screen.getByRole("heading", { name: "Content" })).toBeInTheDocument();
    act(() => store.setState({ onboardingComplete: true }));
    expect(screen.getByRole("heading", { name: "Content" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
