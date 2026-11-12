import { afterEach, describe, expect, it, vi } from "vitest";
import { findScrollContainer, scrollToCenter } from "../scroll-to-center";

function rect(top: number, height: number): DOMRect {
  return {
    top,
    height,
    width: 100,
    left: 0,
    right: 100,
    bottom: top + height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

/** A scrolling `<div>` with a laid-out child. */
function scroller({ scrollTop = 0, clientHeight = 400, overflowY = "auto" } = {}) {
  const container = document.createElement("div");
  container.style.overflowY = overflowY;
  const child = document.createElement("button");
  container.append(child);
  document.body.append(container);
  Object.defineProperty(container, "scrollHeight", { configurable: true, value: 2000 });
  Object.defineProperty(container, "clientHeight", { configurable: true, value: clientHeight });
  container.scrollTop = scrollTop;
  container.getBoundingClientRect = () => rect(50, clientHeight);
  child.getBoundingClientRect = () => rect(650, 60);
  return { container, child };
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("findScrollContainer (FIX-002)", () => {
  it("finds the nearest vertically scrolling ancestor", () => {
    const { container, child } = scroller();
    expect(findScrollContainer(child)).toBe(container);
  });

  it.each(["visible", "hidden"])("skips overflow-y: %s ancestors (uses the window)", (o) => {
    const { child } = scroller({ overflowY: o });
    expect(findScrollContainer(child)).toBeNull();
  });

  it("skips scrollable-styled ancestors without overflowing content", () => {
    const { container, child } = scroller();
    Object.defineProperty(container, "scrollHeight", { configurable: true, value: 400 });
    expect(findScrollContainer(child)).toBeNull();
  });

  it("a detached element has no container", () => {
    expect(findScrollContainer(document.createElement("a"))).toBeNull();
  });
});

describe("scrollToCenter (FIX-002)", () => {
  it("centres the element in its scroll container", () => {
    const { container, child } = scroller({ scrollTop: 100 });
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo as typeof container.scrollTo;
    scrollToCenter(child, "smooth");
    // 100 + (650 - 50) - (400 - 60) / 2 = 530
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 530, behavior: "smooth" });
  });

  it("sets scrollTop when the container has no scrollTo", () => {
    const { container, child } = scroller({ scrollTop: 100 });
    (container as Partial<HTMLElement>).scrollTo = undefined;
    scrollToCenter(child, "auto");
    expect(container.scrollTop).toBe(530);
  });

  it("never scrolls a container above the top", () => {
    const { container, child } = scroller();
    child.getBoundingClientRect = () => rect(60, 60);
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo as typeof container.scrollTo;
    scrollToCenter(child, "auto");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("falls back to the window, clamped at 0", () => {
    const button = document.createElement("button");
    document.body.append(button);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    button.getBoundingClientRect = () => rect(1000, 80);
    scrollToCenter(button, "smooth");
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 640, behavior: "smooth" });
    button.getBoundingClientRect = () => rect(100, 80);
    scrollToCenter(button, "auto");
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "auto" });
  });

  it("does nothing for an element without layout", () => {
    const button = document.createElement("button");
    document.body.append(button);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    scrollToCenter(button, "smooth");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("does nothing without window.scrollTo", () => {
    const button = document.createElement("button");
    document.body.append(button);
    button.getBoundingClientRect = () => rect(1000, 80);
    const original = window.scrollTo;
    (window as Partial<Window>).scrollTo = undefined;
    try {
      expect(() => scrollToCenter(button, "auto")).not.toThrow();
    } finally {
      window.scrollTo = original;
    }
  });
});
