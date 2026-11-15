import type { Page } from "@playwright/test";

/** IndexedDB name of the on-device store (`DB_NAME` in `src/lib/offline/db.ts`). */
const DB_NAME = "polyglow";

/**
 * PLT-009 AC 10: seeds the stored hearts (`hearts` table, key `"current"`) and reloads,
 * so the app reads them on its next start. `current` below the max needs a
 * `refillStartedAt` (HeartsStateSchema); "now" means the next heart is ~30 min away.
 * Call it on a page of the app after onboarding (the database exists then).
 */
export async function seedHearts(page: Page, current: number): Promise<void> {
  await page.evaluate(
    ({ name, current }) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open(name);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const now = new Date().toISOString();
          const tx = db.transaction("hearts", "readwrite");
          tx.objectStore("hearts").put(
            { current, refillStartedAt: current >= 5 ? null : now, updatedAt: now },
            "current",
          );
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { name: DB_NAME, current },
  );
  await page.reload();
}

/**
 * PLT-024 AC 8: sets the stored settings' `courseId` (`settings` table, key `"current"`)
 * and reloads, e.g. `"en-es"` for a guest who chose Spanish before it was hidden
 * (PD-030). Call it after onboarding (the settings record exists then).
 */
export async function seedSettingsCourse(page: Page, courseId: string): Promise<void> {
  await page.evaluate(
    ({ name, courseId }) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open(name);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("settings", "readwrite");
          const store = tx.objectStore("settings");
          const read = store.get("current");
          read.onsuccess = () => {
            if (!read.result) {
              reject(new Error("no settings stored yet: finish onboarding first"));
              return;
            }
            store.put({ ...read.result, courseId }, "current");
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { name: DB_NAME, courseId },
  );
  await page.reload();
}
