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

/** Scrolls `element` to the centre; returns what it scrolled, or `null` if it didn't. */
export function scrollToCenter(
  element: HTMLElement,
  behavior: ScrollBehavior,
): CenterScroll | null {
  const rect = element.getBoundingClientRect();
  // Not laid out (hidden, or jsdom): nothing to centre on.
  if (rect.width === 0 && rect.height === 0) return null;
  const container = findScrollContainer(element);
  if (container) {
    const box = container.getBoundingClientRect();
    const top = Math.max(
      0,
      container.scrollTop + rect.top - box.top - (container.clientHeight - rect.height) / 2,
    );
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top, behavior });
    } else {
      container.scrollTop = top;
    }
    return { container, top };
  }
  if (typeof window.scrollTo !== "function") return null;
  const top = Math.max(0, window.scrollY + rect.top - (window.innerHeight - rect.height) / 2);
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
