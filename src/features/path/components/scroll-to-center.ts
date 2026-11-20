/**
 * Scrolls `element` to the vertical centre of its scroll container (FIX-002).
 *
 * Not `element.scrollIntoView()`: Chromium moves the sequential focus navigation
 * starting point to the scrolled-to element, so the first Tab after load would skip the
 * skip link and the top bar. Setting the scroll position of the container (or the
 * window) leaves that starting point alone.
 */

function isScrollable(element: Element): boolean {
  const { overflowY } = window.getComputedStyle(element);
  return (
    (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
    element.scrollHeight > element.clientHeight
  );
}

/** Nearest ancestor that scrolls vertically, or `null` for the document (window). */
export function findScrollContainer(element: Element): Element | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) return null;
    if (isScrollable(node)) return node;
  }
  return null;
}

/** Where `scrollToCenter` sent the scroll: the container (`null` = window) and its target. */
export interface CenterScroll {
  container: Element | null;
  top: number;
}

/** Space covered at the top and bottom of the scrollport by sticky or fixed bars (px). */
export interface ViewInsets {
  top: number;
  bottom: number;
}

/** Free space between a header card and the bottom edge of a sticky top bar (FIX-009). */
export const HEADER_CLEARANCE = 12;

/**
 * How much of the scrollport sticky or fixed bars cover (FIX-009), e.g. Learn's sticky
 * top bar and the fixed bottom navigation. Looks at the siblings of `element` and of its
 * ancestors up to `container` (or the body): sticky-top bars before it, sticky-bottom
 * bars after it, and (window scrolling only) fixed bars, counted at the top or bottom
 * by where they sit on screen.
 */
export function stickyInsets(element: Element, container: Element | null): ViewInsets {
  const insets: ViewInsets = { top: 0, bottom: 0 };
  const stop = container ?? document.body;
  for (let node: Element | null = element; node && node !== stop; node = node.parentElement) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    let before = true;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node) {
        before = false;
        continue;
      }
      const style = window.getComputedStyle(sibling);
      // Click-through overlays (e.g. an empty toast region) are not bars.
      if (style.pointerEvents === "none") continue;
      const box = sibling.getBoundingClientRect();
      if (!box.height) continue;
      if (style.position === "fixed" && container === null) {
        // A fixed box's computed `top` and `bottom` are both resolved: go by where it is.
        if (box.top < window.innerHeight / 2) insets.top = Math.max(insets.top, box.bottom);
        else insets.bottom = Math.max(insets.bottom, window.innerHeight - box.top);
      } else if (style.position === "sticky") {
        // Sticky offsets stay `auto` unless set; only the side it sticks to covers content.
        if (before && style.top !== "auto" && style.top !== "") {
          insets.top = Math.max(insets.top, (parseFloat(style.top) || 0) + box.height);
        } else if (!before && style.bottom !== "auto" && style.bottom !== "") {
          insets.bottom = Math.max(insets.bottom, (parseFloat(style.bottom) || 0) + box.height);
        }
      }
    }
  }
  return insets;
}

/** A vertical extent in viewport coordinates. */
export interface Span {
  top: number;
  bottom: number;
}

/**
 * The scroll position that centres `target` in the visible band (`view`, the scrollport
 * minus sticky bars), without leaving a header card half under the top bar (FIX-009).
 * All spans are viewport coordinates at the current scroll position `scroll`. A header
 * above the target that would straddle the band's top edge is brought fully below it
 * (scrolling less), as long as the target stays fully visible; otherwise the scroll
 * goes on until that header is fully covered. Never below 0.
 */
export function centredScrollTop({
  scroll,
  view,
  target,
  headers = [],
  clearance = HEADER_CLEARANCE,
}: {
  scroll: number;
  view: Span;
  target: Span;
  headers?: readonly Span[];
  clearance?: number;
}): number {
  const centre = (view.top + view.bottom) / 2;
  const centred = Math.max(0, scroll + (target.top + target.bottom) / 2 - centre);
  const above = headers.filter((h) => h.bottom <= target.top).sort((a, b) => a.top - b.top);
  // `delta` = how far content moves up from where it is now.
  const straddles = (h: Span, delta: number) =>
    h.top - delta < view.top + clearance && h.bottom - delta > view.top;
  const settle = (start: number, fix: (h: Span) => number, limit: (t: number) => number) => {
    let top = start;
    for (let pass = 0; pass <= above.length; pass += 1) {
      const header = above.find((h) => straddles(h, top - scroll));
      if (!header) return top;
      top = limit(fix(header));
    }
    return top;
  };
  const shown = settle(
    centred,
    (h) => scroll + h.top - view.top - clearance,
    (t) => Math.max(0, Math.min(t, centred)),
  );
  // Header fully in view and the target still above the band's bottom edge: done.
  const fits = target.bottom - (shown - scroll) <= view.bottom;
  if (fits && !above.some((h) => straddles(h, shown - scroll))) return shown;
  return settle(
    centred,
    (h) => scroll + h.bottom - view.top,
    (t) => Math.max(t, centred),
  );
}

function span(element: Element): Span {
  const { top, bottom } = element.getBoundingClientRect();
  return { top, bottom };
}

export interface ScrollToCenterOptions {
  /** Header cards that must not end up half under a sticky top bar (FIX-009). */
  headers?: readonly Element[];
}

/**
 * Scrolls `element` to the centre of the visible part of its scroll container (FIX-009:
 * below sticky top bars, above fixed bottom bars); returns what it scrolled, or `null`
 * if it didn't.
 */
export function scrollToCenter(
  element: HTMLElement,
  behavior: ScrollBehavior,
  { headers = [] }: ScrollToCenterOptions = {},
): CenterScroll | null {
  const rect = element.getBoundingClientRect();
  // Not laid out (hidden, or jsdom): nothing to centre on.
  if (rect.width === 0 && rect.height === 0) return null;
  const container = findScrollContainer(element);
  const insets = stickyInsets(element, container);
  const target = { top: rect.top, bottom: rect.top + rect.height };
  const spans = headers.map(span);
  if (container) {
    const box = container.getBoundingClientRect();
    const top = centredScrollTop({
      scroll: container.scrollTop,
      view: { top: box.top + insets.top, bottom: box.top + container.clientHeight - insets.bottom },
      target,
      headers: spans,
    });
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top, behavior });
    } else {
      container.scrollTop = top;
    }
    return { container, top };
  }
  if (typeof window.scrollTo !== "function") return null;
  const top = centredScrollTop({
    scroll: window.scrollY,
    view: { top: insets.top, bottom: window.innerHeight - insets.bottom },
    target,
    headers: spans,
  });
  window.scrollTo({ top, behavior });
  return { container: null, top };
}

/** Frames without movement after which a scroll that missed its target counts as over. */
export const IDLE_SETTLE_FRAMES = 10;
/** Hard cap (about 3 s at 60 Hz): settle even if something keeps scrolling. */
export const MAX_SETTLE_FRAMES = 180;

function scrollPosition(container: Element | null): { top: number; max: number } {
  if (container) {
    return { top: container.scrollTop, max: container.scrollHeight - container.clientHeight };
  }
  const root = document.documentElement;
  return { top: window.scrollY, max: root.scrollHeight - window.innerHeight };
}

/**
 * Calls `onSettled` once the scroll started by `scrollToCenter` is over (FIX-006): the
 * position has reached its target (clamped to the scrollable range) and held for two
 * animation frames, or has not moved for `IDLE_SETTLE_FRAMES` (the learner interrupted
 * it), or `MAX_SETTLE_FRAMES` passed. Returns a cancel function.
 */
export function whenScrollSettles(scroll: CenterScroll, onSettled: () => void): () => void {
  if (typeof window.requestAnimationFrame !== "function") {
    onSettled();
    return () => {};
  }
  let id = 0;
  let frames = 0;
  let still = 0;
  let previous = scrollPosition(scroll.container).top;
  const tick = () => {
    frames += 1;
    const { top, max } = scrollPosition(scroll.container);
    const target = Math.min(scroll.top, Math.max(0, max));
    still = Math.abs(top - previous) < 0.5 ? still + 1 : 0;
    previous = top;
    const arrived = Math.abs(top - target) <= 1 && still >= 2;
    if (arrived || still >= IDLE_SETTLE_FRAMES || frames >= MAX_SETTLE_FRAMES) {
      onSettled();
      return;
    }
    id = window.requestAnimationFrame(tick);
  };
  id = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(id);
}
