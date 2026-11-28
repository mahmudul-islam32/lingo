"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "../session-store";

/**
 * The auth screens are hidden while signed in (ADR-020 §8): a learner who is already
 * signed in when the screen opens goes to Learn. Decided once, when the stored session
 * has been read, so a sign-in on this screen (which navigates on its own) never triggers
 * it. An expired session may log in again.
 */
export function useSignedInRedirect(): void {
  const router = useRouter();
  const { ready, status } = useSession();
  const decided = useRef(false);
  useEffect(() => {
    if (decided.current || !ready) return;
    decided.current = true;
    if (status === "signed-in") router.replace("/");
  }, [ready, status, router]);
}
