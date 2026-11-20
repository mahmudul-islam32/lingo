import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HEADER_CLEARANCE,
  IDLE_SETTLE_FRAMES,
  MAX_SETTLE_FRAMES,
  centredScrollTop,
  findScrollContainer,
  scrollToCenter,
  stickyInsets,
  whenScrollSettles,
} from "../scroll-to-center";

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
  Reflect.deleteProperty(document.documentElement, "scrollHeight");
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
    const scroll = scrollToCenter(child, "smooth");
    // 100 + (650 - 50) - (400 - 60) / 2 = 530
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 530, behavior: "smooth" });
    expect(scroll).toEqual({ container, top: 530 });
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
    expect(scrollToCenter(button, "smooth")).toBeNull();
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

describe("centredScrollTop (FIX-009)", () => {
  // Learn at 390 × 844: sticky top bar 0-64, fixed bottom nav from 770.
  const view = { top: 64, bottom: 770 };

  it("centres the target in the band between the bars, not the whole viewport", () => {
    // Centre of the band = 417; target centre 900 at scroll 100 -> 100 + 900 - 417.
    expect(centredScrollTop({ scroll: 100, view, target: { top: 850, bottom: 950 } })).toBe(583);
  });

  it("never goes below 0", () => {
    expect(centredScrollTop({ scroll: 0, view, target: { top: 100, bottom: 200 } })).toBe(0);
  });

  it("ignores headers that stay clear of the top bar or sit below the target", () => {
    const target = { top: 850, bottom: 950 };
    // After scrolling 483 px: 600 -> 117 (clear), the one below the target is ignored.
    const headers = [
      { top: 600, bottom: 670 },
      { top: 1000, bottom: 1070 },
    ];
    expect(centredScrollTop({ scroll: 100, view, target, headers })).toBe(583);
  });

  it("the first node of a level: its header stays fully below the bar (390px review)", () => {
    // Measured on Learn for a new learner, before the fix: centring put the A1 header
    // card at 17-90, under the 64 px bar.
    const top = centredScrollTop({
      scroll: 0,
      view,
      target: { top: 569, bottom: 777 },
      headers: [
        { top: 268, bottom: 341 },
        { top: 389, bottom: 529 },
      ],
    });
    expect(top).toBe(268 - 64 - HEADER_CLEARANCE);
    // Header at 64 + clearance; the node still fully above the bottom nav.
    expect(777 - top).toBeLessThanOrEqual(view.bottom);
  });

  it("settles every header that the first adjustment pushes under the bar", () => {
    const top = centredScrollTop({
      scroll: 0,
      view,
      target: { top: 850, bottom: 950 },
      headers: [
        { top: 400, bottom: 470 },
        { top: 480, bottom: 600 },
      ],
    });
    // Centred: A at -83..-13 (out of view), B at -3..117. B shown (scroll 404) puts A at
    // -4..66, so A is shown too.
    expect(top).toBe(400 - 64 - HEADER_CLEARANCE);
  });

  it("covers a header fully when showing it would push the target off screen", () => {
    // Centred (scroll 1910 - 417 = 1493) the header straddles the bar (-43..107). Shown
    // (scroll 1374), the tall target would end at 836, under the nav (770). So the scroll
    // goes on until the header is fully under the bar.
    const header = { top: 1450, bottom: 1600 };
    const top = centredScrollTop({
      scroll: 0,
      view,
      target: { top: 1610, bottom: 2210 },
      headers: [header],
    });
    expect(top).toBe(1600 - 64);
    expect(header.bottom - top).toBeLessThanOrEqual(view.top);
  });
});

describe("stickyInsets (FIX-009)", () => {
  /** body > [bar?] + page > path > target, plus a fixed bottom nav. */
  function page({ bar = "sticky", top = "0px", height = 64 } = {}) {
    const header = document.createElement("section");
    header.style.position = bar;
    header.style.top = top;
    header.getBoundingClientRect = () => rect(0, height);
    const path = document.createElement("div");
    const target = document.createElement("a");
    path.append(target);
    const main = document.createElement("main");
    main.append(header, path);
    const nav = document.createElement("nav");
    nav.style.position = "fixed";
    nav.style.bottom = "0px";
    nav.getBoundingClientRect = () => rect(770, 74);
    document.body.append(main, nav);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(844);
    return { header, target, nav };
  }

  it("finds a sticky top bar before the path and the fixed bottom nav", () => {
    const { target } = page();
    expect(stickyInsets(target, null)).toEqual({ top: 64, bottom: 74 });
  });

  it("adds the sticky offset, and ignores a bar that isn't sticky", () => {
    expect(stickyInsets(page({ top: "8px" }).target, null).top).toBe(72);
    document.body.innerHTML = "";
    expect(stickyInsets(page({ bar: "static" }).target, null).top).toBe(0);
  });

  it("ignores click-through overlays and empty boxes", () => {
    const { target, nav, header } = page();
    nav.style.pointerEvents = "none";
    header.getBoundingClientRect = () => rect(0, 0);
    expect(stickyInsets(target, null)).toEqual({ top: 0, bottom: 0 });
  });

  it("inside a scroll container, ignores fixed bars outside it", () => {
    const { target } = page();
    const container = target.parentElement!.parentElement!;
    expect(stickyInsets(target, container)).toEqual({ top: 64, bottom: 0 });
  });
});

describe("scrollToCenter below a sticky top bar (FIX-009)", () => {
  it("centres between the bars and keeps the level header out from under the top bar", () => {
    const main = document.createElement("main");
    const bar = document.createElement("section");
    bar.style.position = "sticky";
    bar.style.top = "0px";
    bar.getBoundingClientRect = () => rect(0, 64);
    const path = document.createElement("div");
    const levelHeader = document.createElement("div");
    const target = document.createElement("a");
    path.append(levelHeader, target);
    main.append(bar, path);
    document.body.append(main);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(844);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    target.getBoundingClientRect = () => rect(1000, 100);
    levelHeader.getBoundingClientRect = () => rect(700, 70);

    // Centre of 64..844 = 454: 1050 - 454 = 596 would put the header at 104 (clear).
    expect(scrollToCenter(target, "auto", { headers: [levelHeader] })).toEqual({
      container: null,
      top: 596,
    });
    // Nearer the target, centring would leave it at 64 - 4 (half under the bar).
    levelHeader.getBoundingClientRect = () => rect(600, 70);
    scrollToCenter(target, "smooth", { headers: [levelHeader] });
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: 600 - 64 - HEADER_CLEARANCE,
      behavior: "smooth",
    });
  });
});

describe("whenScrollSettles (FIX-006)", () => {
  /** Manual animation frames: `frame(top)` moves the container, then runs one frame. */
  function frames(container: HTMLElement) {
    let queued: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      queued = cb;
      return 1;
    });
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      queued = null;
    });
    const frame = (top?: number) => {
      if (top !== undefined) container.scrollTop = top;
      const cb = queued;
      queued = null;
      cb?.(0);
    };
    return { frame, cancel, pending: () => queued !== null };
  }

  function setup(scrollTop = 0) {
    const { container } = scroller({ scrollTop });
    const onSettled = vi.fn();
    const raf = frames(container);
    return { container, onSettled, ...raf };
  }

  it("settles once the target is reached and held for two frames", () => {
    const { container, onSettled, frame } = setup();
    whenScrollSettles({ container, top: 530 }, onSettled);
    frame(); // smooth scroll not started yet: not settled
    frame(200);
    frame(450);
    frame(530); // arrived, but still moving this frame
    expect(onSettled).not.toHaveBeenCalled();
    frame();
    expect(onSettled).not.toHaveBeenCalled();
    frame();
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("is not fooled by a scroll that has not started yet", () => {
    const { container, onSettled, frame } = setup();
    whenScrollSettles({ container, top: 530 }, onSettled);
    frame();
    frame();
    frame();
    expect(onSettled).not.toHaveBeenCalled();
  });

  it("settles at once when already at the target (no scroll needed)", () => {
    const { container, onSettled, frame } = setup(530);
    whenScrollSettles({ container, top: 530 }, onSettled);
    frame();
    frame();
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("clamps the target to the scrollable range", () => {
    const { container, onSettled, frame } = setup();
    // scrollHeight 2000 - clientHeight 400: the browser stops at 1600.
    whenScrollSettles({ container, top: 1900 }, onSettled);
    frame(1600);
    frame();
    frame();
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("settles after the scroll stops short (interrupted by the learner)", () => {
    const { container, onSettled, frame } = setup();
    whenScrollSettles({ container, top: 530 }, onSettled);
    frame(300);
    for (let i = 1; i < IDLE_SETTLE_FRAMES; i++) frame();
    expect(onSettled).not.toHaveBeenCalled();
    frame();
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("gives up after the frame cap even if the position keeps moving", () => {
    const { container, onSettled, frame } = setup();
    whenScrollSettles({ container, top: 1500 }, onSettled);
    for (let i = 1; i < MAX_SETTLE_FRAMES; i++) frame(i % 2 === 0 ? 10 : 20);
    expect(onSettled).not.toHaveBeenCalled();
    frame(30);
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("can be cancelled", () => {
    const { container, onSettled, frame, cancel, pending } = setup();
    const stop = whenScrollSettles({ container, top: 530 }, onSettled);
    stop();
    expect(cancel).toHaveBeenCalled();
    expect(pending()).toBe(false);
    frame(530);
    frame();
    frame();
    expect(onSettled).not.toHaveBeenCalled();
  });

  it("watches the window when there is no container", () => {
    const onSettled = vi.fn();
    let y = 0;
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => y);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3000,
    });
    const raf = frames(document.createElement("div"));
    whenScrollSettles({ container: null, top: 640 }, onSettled);
    y = 640;
    raf.frame();
    raf.frame();
    raf.frame();
    expect(onSettled).toHaveBeenCalledOnce();
  });
});
