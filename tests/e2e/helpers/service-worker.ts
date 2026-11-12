import type { Page } from "@playwright/test";

/**
 * Waits until the service worker is active (precache finished) and controls the page.
 *
 * `clientsClaim` normally takes over the open tab right away, but a navigation that
 * starts while the first worker is still activating can end up uncontrolled and is never
 * claimed (seen as rare 30 s timeouts in the `pwa-prod` project). In that case one
 * reload, which the now-active worker always controls, settles it.
 */
export async function waitForServiceWorker(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  const controlled = await page
    .waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 5_000 })
    .then(
      () => true,
      () => false,
    );
  if (controlled) return;
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}
