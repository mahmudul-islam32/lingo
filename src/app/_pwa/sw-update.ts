/**
 * App-update flow (PLT-005 criterion 7, ARCHITECTURE §10) on the plain Service Worker API.
 * The worker is built with `skipWaiting: false` (PLT-002), so a new version installs and
 * then waits. We tell the learner, and only on "Refresh" send `SKIP_WAITING` (Serwist's
 * worker listens for it) and reload once when the new worker takes control
 * (`clientsClaim: true` fires `controllerchange`).
 */

export const SKIP_WAITING_MESSAGE = { type: "SKIP_WAITING" } as const;

type Container = Pick<ServiceWorkerContainer, "ready" | "addEventListener" | "removeEventListener">;

/**
 * Calls `onWaiting` with the waiting worker whenever an update is installed and waiting:
 * one already waiting at start-up, or one found later (`updatefound` -> `installed`).
 * A first install never waits (no active worker yet), so it is never reported.
 * Returns an unsubscribe function.
 */
export function watchForWaitingWorker(
  container: Pick<ServiceWorkerContainer, "ready">,
  onWaiting: (worker: ServiceWorker) => void,
): () => void {
  let disposed = false;
  const cleanups: (() => void)[] = [];

  const track = (registration: ServiceWorkerRegistration) => {
    if (disposed) return;
    const check = () => {
      if (!disposed && registration.waiting && registration.active) onWaiting(registration.waiting);
    };
    const onUpdateFound = () => {
      const installing = registration.installing;
      if (!installing) return;
      const onStateChange = () => {
        if (installing.state === "installed") check();
      };
      installing.addEventListener("statechange", onStateChange);
      cleanups.push(() => installing.removeEventListener("statechange", onStateChange));
    };
    registration.addEventListener("updatefound", onUpdateFound);
    cleanups.push(() => registration.removeEventListener("updatefound", onUpdateFound));
    check();
  };

  container.ready.then(track).catch(() => {
    // No usable registration: nothing to update.
  });

  return () => {
    disposed = true;
    for (const cleanup of cleanups) cleanup();
    cleanups.length = 0;
  };
}

let reloading = false;

/** Test hook: forget that a reload was already triggered. */
export function resetUpdateReloadGuard() {
  reloading = false;
}

/**
 * Activates `worker` and reloads the page exactly once when it controls the page. If the
 * worker is no longer waiting (another tab already activated it), reload right away.
 */
export function applyUpdate(
  container: Pick<Container, "addEventListener" | "removeEventListener">,
  worker: ServiceWorker,
  reload: () => void = () => window.location.reload(),
) {
  const reloadOnce = () => {
    if (reloading) return;
    reloading = true;
    reload();
  };

  if (worker.state !== "installed") {
    reloadOnce();
    return;
  }
  container.addEventListener("controllerchange", reloadOnce, { once: true });
  worker.postMessage(SKIP_WAITING_MESSAGE);
}
