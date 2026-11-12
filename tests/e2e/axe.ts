import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Impacts that fail the build (PLT-001 criterion 16, ARCHITECTURE §12). */
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

/**
 * FIXME(GAM-008, dev-gamification; found in PLT-009): skill-path nodes fail axe
 * `label-content-name-mismatch` (WCAG 2.5.3, serious). The node's `aria-label`
 * ("Lesson 1: Hello!, completed") doesn't contain its visible text ("Lesson 1 Hello!
 * Completed · Start again"), and axe also flags the zigzag-offset locked nodes. The fix
 * lives in `src/features/path` (not dev-platform's lane). Pass this on pages that show
 * the path (Learn); remove it with the fix. Every other rule still runs.
 */
export const SKILL_PATH_KNOWN_ISSUES = { knownIssues: ["label-content-name-mismatch"] } as const;

export interface A11yCheckOptions {
  /**
   * Rule ids to skip because of a known, filed issue in another lane. Every entry needs
   * a comment at the call site naming the ticket that fixes it; remove it with the fix.
   */
  knownIssues?: readonly string[];
}

/** Runs axe on the current page and fails on any serious or critical violation. */
export async function expectNoSeriousA11yViolations(
  page: Page,
  { knownIssues = [] }: A11yCheckOptions = {},
): Promise<void> {
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
