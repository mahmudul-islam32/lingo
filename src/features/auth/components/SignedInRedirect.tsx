"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "../session-store";

/**
 * The auth screens are hidden while signed in (ADR-020 §8): a signed-in learner who opens
 * `/sign-up` or `/log-in` goes to Learn. `active` is false while this screen itself is
 * signing in (it navigates on its own). An expired session may log in again.
 */
export function useSignedInRedirect(active: boolean): void {
  const router = useRouter();
  const { ready, status } = useSession();
  const done = useRef(false);
  useEffect(() => {
    if (!active || done.current || !ready || status !== "signed-in") return;
    done.current = true;
    router.replace("/");
  }, [active, ready, status, router]);
}
