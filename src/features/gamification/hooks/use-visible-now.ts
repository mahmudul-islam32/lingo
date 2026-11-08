import { useEffect } from "react";

/** Calls `onVisible` whenever the page becomes visible again (`visibilitychange`). */
export function useOnPageVisible(onVisible: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const handler = () => {
      if (document.visibilityState === "visible") onVisible();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onVisible, enabled]);
}
