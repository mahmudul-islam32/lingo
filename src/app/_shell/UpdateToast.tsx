"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import { applyUpdate, watchForWaitingWorker } from "../_pwa/sw-update";
import { isLessonRoute } from "./lesson-route";
import { shouldRegisterServiceWorker } from "./ServiceWorkerRegistration";

export const UPDATE_TITLE = "A new version of Polyglow is ready";
export const UPDATE_ACTION = "Refresh";

type Container = Pick<ServiceWorkerContainer, "ready" | "addEventListener" | "removeEventListener">;

/** The browser's container in production builds; `null` in dev, tests and old browsers. */
function defaultContainer(): Container | null {
  if (!shouldRegisterServiceWorker() || !("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker;
}

export interface UpdateToastProps {
  /** Injected in tests; defaults to `navigator.serviceWorker` in production builds. */
  container?: Container | null;
  reload?: () => void;
}

/**
 * Update notice (PLT-005 criteria 7-9): a sticky, polite CTO-004 toast above the bottom
 * navigation when a new service worker is waiting. Never on `/lesson/*`: the waiting flag
 * is kept and the toast appears once the learner leaves the lesson (and is withdrawn if
 * they enter one while it shows). Renders nothing itself.
 */
export function UpdateToast({ container, reload }: UpdateToastProps) {
  const pathname = usePathname();
  const { show, dismiss } = useToast();
  const [target, setTarget] = useState<{ container: Container; worker: ServiceWorker } | null>(
    null,
  );
  const suppressed = isLessonRoute(pathname);

  useEffect(() => {
    const c = container === undefined ? defaultContainer() : container;
    if (!c) return;
    return watchForWaitingWorker(c, (worker) =>
      setTarget((prev) => (prev?.worker === worker ? prev : { container: c, worker })),
    );
  }, [container]);

  useEffect(() => {
    if (!target || suppressed) return;
    const id = show({
      title: UPDATE_TITLE,
      tone: "info",
      duration: null,
      action: {
        label: UPDATE_ACTION,
        onClick: () => applyUpdate(target.container, target.worker, reload),
      },
    });
    return () => dismiss(id);
  }, [target, suppressed, show, dismiss, reload]);

  return null;
}
