"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui";
import { useOnlineStatus } from "@/lib/offline";
import { isLessonRoute } from "./lesson-route";

export const OFFLINE_TEXT = "You're offline. Some features need a connection.";
export const BACK_ONLINE_TEXT = "Back online";
/** How long "Back online" stays before the banner disappears (PLT-006 criterion 3). */
export const BACK_ONLINE_MS = 3000;

/** Lessons work offline, so the banner never shows there (criterion 8). */
export function isBannerSuppressed(pathname: string | null): boolean {
  return isLessonRoute(pathname);
}

/**
 * Connectivity banner (PLT-006). Rendered in the normal document flow above `<main>` so it
 * can never cover the bottom navigation or a page's primary button. The `role="status"`
 * live region is always mounted (empty when there is nothing to say) so screen readers
 * announce changes. The state is conveyed by text and icon, not colour alone. Design v2
 * (PLT-026): a rounded pill with a solid bottom edge, coral tint offline, green when
 * back online.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const pathname = usePathname();
  const [prevOnline, setPrevOnline] = useState(online);
  const [showBackOnline, setShowBackOnline] = useState(false);

  // Adjust state while rendering when connectivity flips (no effect round-trip):
  // offline -> online shows "Back online"; a new offline event cancels it.
  if (online !== prevOnline) {
    setPrevOnline(online);
    setShowBackOnline(online);
  }

  useEffect(() => {
    if (!showBackOnline) return;
    const timer = window.setTimeout(() => setShowBackOnline(false), BACK_ONLINE_MS);
    return () => window.clearTimeout(timer);
  }, [showBackOnline]);

  const mode = !online ? "offline" : showBackOnline ? "back-online" : null;
  const visible = mode !== null && !isBannerSuppressed(pathname);

  return (
    <div role="status" data-testid="offline-banner" data-mode={visible ? mode : undefined}>
      {visible && (
        <div className="mx-auto w-full max-w-md px-4 pt-3 motion-safe:animate-fade-in">
          <p
            className={cn(
              "flex items-center gap-2 rounded-control border-2 px-3.5 py-2 text-sm font-bold",
              mode === "offline"
                ? "border-accent-soft bg-accent-tint text-accent-fg shadow-[0_3px_0_var(--color-accent-soft)]"
                : "border-success-border bg-success-soft text-success-fg shadow-[0_3px_0_var(--color-success-border)]",
            )}
          >
            {mode === "offline" ? <CloudOffIcon /> : <CloudCheckIcon />}
            <span>{mode === "offline" ? OFFLINE_TEXT : BACK_ONLINE_TEXT}</span>
          </p>
        </div>
      )}
    </div>
  );
}

const CLOUD_PATH = "M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5Z";

/** Original cloud with a strike-through. */
function CloudOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      data-testid="icon-cloud-off"
    >
      <path d={CLOUD_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Original cloud with a check mark. */
function CloudCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      data-testid="icon-cloud-check"
    >
      <path d={CLOUD_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M9.25 13.5l2 2 3.5-3.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
