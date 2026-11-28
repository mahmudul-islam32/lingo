import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Impacts that fail the build (PLT-001 criterion 16, ARCHITECTURE §12). */
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

export interface A11yCheckOptions {
  /**
   * Rule ids to skip because of a known, filed issue in another lane. Every entry needs
   * a comment at the call site naming the ticket that fixes it; remove it with the fix.
   */
  knownIssues?: readonly string[];
}

/**
 * FIX-016: waits until every finite CSS / Web animation on the page has finished (at most
 * `ANIMATION_SETTLE_MS`), so axe never measures colours mid-fade. A slower CI runner
 * caught entrance animations (e.g. `animate-slide-up`, 200 ms opacity) at 0.4–0.9 opacity
 * and reported color-contrast on text that passes once shown (PLT-028, review.spec).
 * Infinite animations (skeleton pulse, spinners) are ignored; on timeout axe runs anyway.
 */
const ANIMATION_SETTLE_MS = 3_000;

async function animationsSettled(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () =>
        document.getAnimations().every((animation) => {
          const end = animation.effect?.getComputedTiming().endTime;
          return animation.playState !== "running" || end === Infinity;
        }),
      null,
      { timeout: ANIMATION_SETTLE_MS },
    )
    .catch(() => undefined);
}

/** Runs axe on the current page and fails on any serious or critical violation. */
export async function expectNoSeriousA11yViolations(
  page: Page,
  { knownIssues = [] }: A11yCheckOptions = {},
): Promise<void> {
  await animationsSettled(page);
  let builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "best-practice",
  ]);
  if (knownIssues.length > 0) builder = builder.disableRules([...knownIssues]);
  const results = await builder.analyze();
  const blocking = results.violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ""));
  const summary = blocking.map(
    (v) =>
      `${v.impact}: ${v.id} (${v.help}) on ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary, "axe serious/critical violations").toEqual([]);
}
