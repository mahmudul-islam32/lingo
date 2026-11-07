import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { navigationState } from "./navigation-mock";
import { BottomNav } from "../BottomNav";
import { isActivePath, NAV_ITEMS } from "../nav-items";

describe("BottomNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
  });

  it('is a <nav> landmark named "Main" with exactly the Learn and Profile tabs', () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.tagName).toBe("NAV");
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Learn", "Profile"]);
    expect(within(nav).getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(within(nav).queryByRole("link", { name: /leaderboard/i })).not.toBeInTheDocument();
  });

  it("marks Learn active on / with aria-current, a filled icon and the indicator bar", () => {
    render(<BottomNav />);
    const learn = screen.getByRole("link", { name: "Learn" });
    const profile = screen.getByRole("link", { name: "Profile" });
    expect(learn).toHaveAttribute("aria-current", "page");
    expect(profile).not.toHaveAttribute("aria-current");
    expect(within(learn).getByTestId("nav-indicator")).toBeInTheDocument();
    expect(within(profile).queryByTestId("nav-indicator")).not.toBeInTheDocument();
    // Filled icon: the active icon's shapes use fill="currentColor", the inactive ones don't.
    expect(learn.querySelector('svg [fill="currentColor"]')).not.toBeNull();
    expect(profile.querySelector('svg [fill="currentColor"]')).toBeNull();
  });

  it("marks Profile active on /profile and its sub-routes", () => {
    navigationState.pathname = "/profile";
    const { unmount } = render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Learn" })).not.toHaveAttribute("aria-current");
    unmount();

    navigationState.pathname = "/profile/settings";
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("aria-current", "page");
  });

  it("reaches both tabs with Tab, in order, and they have visible focus styles", async () => {
    const user = userEvent.setup();
    render(<BottomNav />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Learn" })).toHaveFocus();
    await user.tab();
    const profile = screen.getByRole("link", { name: "Profile" });
    expect(profile).toHaveFocus();
    expect(profile.className).toContain("focus-visible:focus-ring");
  });

  it("gives every tab at least a 44 px tap target and respects the safe area", () => {
    render(<BottomNav />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("min-h-11");
      expect(link.className).toContain("min-w-11");
    }
    expect(screen.getByRole("navigation").className).toContain("pb-[env(safe-area-inset-bottom)]");
  });
});

describe("isActivePath", () => {
  it("matches / only exactly and other tabs by prefix", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/profile", "/")).toBe(false);
    expect(isActivePath("/profile", "/profile")).toBe(true);
    expect(isActivePath("/profile/x", "/profile")).toBe(true);
    expect(isActivePath("/profiles", "/profile")).toBe(false);
    expect(isActivePath(null, "/")).toBe(false);
  });

  it("has exactly two items (PD-005)", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual(["Learn", "Profile"]);
  });
});
