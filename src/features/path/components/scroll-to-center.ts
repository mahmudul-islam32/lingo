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

export function scrollToCenter(element: HTMLElement, behavior: ScrollBehavior): void {
  const rect = element.getBoundingClientRect();
  // Not laid out (hidden, or jsdom): nothing to centre on.
  if (rect.width === 0 && rect.height === 0) return;
  const container = findScrollContainer(element);
  if (container) {
    const box = container.getBoundingClientRect();
    const top =
      container.scrollTop + rect.top - box.top - (container.clientHeight - rect.height) / 2;
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top: Math.max(0, top), behavior });
    } else {
      container.scrollTop = Math.max(0, top);
    }
    return;
  }
  if (typeof window.scrollTo !== "function") return;
  const top = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
  window.scrollTo({ top: Math.max(0, top), behavior });
}
