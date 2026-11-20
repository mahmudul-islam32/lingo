import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { navigationState } from "./navigation-mock";
import { BottomNav } from "../BottomNav";
import { isActivePath, NAV_ITEMS } from "../nav-items";

const TABS = ["Learn", "Practice", "Leagues", "Profile"] as const;
const HREFS = ["/", "/practice", "/leagues", "/profile"];

describe("BottomNav (PLT-026, PD-066 §4)", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
  });

  it('is a <nav> named "Main" with Learn, Practice, Leagues, Profile in this order', () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.tagName).toBe("NAV");
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([...TABS]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(HREFS);
    // Every tab has a decorative icon next to its label.
    for (const link of links) {
      expect(link.querySelector("svg")).not.toBeNull();
      expect(
        link.querySelector('[aria-hidden="true"] svg, svg[aria-hidden="true"]'),
      ).not.toBeNull();
    }
  });

  it.each([
    ["/", "Learn"],
    ["/practice", "Practice"],
    ["/leagues", "Leagues"],
    ["/profile", "Profile"],
    ["/profile/settings", "Profile"],
  ])("on %s only %s has aria-current, is indigo and has the indicator bar", (path, active) => {
    navigationState.pathname = path;
    render(<BottomNav />);
    for (const name of TABS) {
      const link = screen.getByRole("link", { name });
      if (name === active) {
        expect(link).toHaveAttribute("aria-current", "page");
        expect(link.className).toContain("text-primary");
        expect(link.querySelector("span.bg-primary")).not.toBeNull();
      } else {
        expect(link).not.toHaveAttribute("aria-current");
        expect(link.className).toContain("text-fg-muted");
        expect(link.querySelector("span.bg-primary")).toBeNull();
      }
    }
  });

  it("reaches all four tabs with Tab, in order, with visible focus styles", async () => {
    const user = userEvent.setup();
    render(<BottomNav />);
    for (const name of TABS) {
      await user.tab();
      const link = screen.getByRole("link", { name });
      expect(link).toHaveFocus();
      expect(link.className).toContain("focus-visible:focus-ring");
    }
  });

  it("gives every tab at least a 48 px tall tap target and respects the safe area", () => {
    render(<BottomNav />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toContain("min-h-12");
      expect(link.className).toContain("min-w-16");
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
    expect(isActivePath("/practice", "/practice")).toBe(true);
    expect(isActivePath(null, "/")).toBe(false);
  });

  it("has exactly the four v2 tabs (PD-066 §4)", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([...TABS]);
  });
});
