import { expect, test, type Page } from "@playwright/test";

/** Reads the guest identity straight from IndexedDB (database `polyglow`, PLT-003). */
async function readGuestId(page: Page): Promise<string | null> {
  return page.evaluate(
    () =>
      new Promise<string | null>((resolve, reject) => {
        const request = indexedDB.open("polyglow");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("identity")) {
            db.close();
            resolve(null);
            return;
          }
          const get = db.transaction("identity").objectStore("identity").get("current");
          get.onsuccess = () => {
            db.close();
            const value = get.result as { guestId?: string } | undefined;
            resolve(value?.guestId ?? null);
          };
          get.onerror = () => reject(get.error);
        };
      }),
  );
}

async function waitForGuestId(page: Page): Promise<string> {
  await expect.poll(() => readGuestId(page)).not.toBeNull();
  return (await readGuestId(page))!;
}

test("creates a guest on first visit and keeps its id across reloads", async ({ page }) => {
  await page.goto("/");
  const guestId = await waitForGuestId(page);
  expect(guestId).toMatch(/^[0-9a-f-]{36}$/);

  await page.reload();
  expect(await waitForGuestId(page)).toBe(guestId);
  // IndexedDB works in a normal profile, so the "can't save" notice is not shown.
  await expect(page.getByRole("status").filter({ hasText: "Progress can't be saved" })).toHaveCount(
    0,
  );
});

test("keeps the guest id in a new tab of the same browser profile", async ({ context, page }) => {
  await page.goto("/");
  const guestId = await waitForGuestId(page);
  await page.close();

  const reopened = await context.newPage();
  await reopened.goto("/");
  expect(await waitForGuestId(reopened)).toBe(guestId);
});

test("creating and reading the guest makes no network requests", async ({ page, baseURL }) => {
  const origin = new URL(baseURL ?? "http://localhost:3000").origin;
  // Data requests only: the page's own document and JS chunks are not data traffic, and
  // dev-mode tooling (HMR) and same-origin Next.js route prefetches (RSC payloads requested
  // by `next/link` in the bottom nav, PLT-001) are excluded.
  const dataRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    const type = request.resourceType();
    const isDevTooling = url.includes("/_next/") || url.includes("__nextjs");
    const isRoutePrefetch = url.startsWith(origin) && new URL(url).searchParams.has("_rsc");
    const isData = ["fetch", "xhr", "websocket", "eventsource", "ping"].includes(type);
    const isThirdParty = !url.startsWith(origin) && !url.startsWith("data:");
    if ((isData && !isDevTooling && !isRoutePrefetch) || isThirdParty) {
      dataRequests.push(`${type} ${url}`);
    }
  });

  await page.goto("/");
  const guestId = await waitForGuestId(page);
  await page.reload();
  expect(await waitForGuestId(page)).toBe(guestId);
  expect(dataRequests).toEqual([]);
});
