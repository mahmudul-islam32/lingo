import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Impacts that fail the build (PLT-001 criterion 16, ARCHITECTURE §12). */
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

/** Runs axe on the current page and fails on any serious or critical violation. */
export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();
  const blocking = results.violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ""));
  const summary = blocking.map(
    (v) =>
      `${v.impact}: ${v.id} (${v.help}) on ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary, "axe serious/critical violations").toEqual([]);
}
