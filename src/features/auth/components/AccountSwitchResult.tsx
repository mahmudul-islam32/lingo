"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button, Lumi } from "@/components/ui";
import type { AccountSwitchOutcome } from "../account-switch";
import { AUTH_COPY } from "../messages";
import { LINK_CLASSES } from "./EmailAuthForm";

export const PRIMARY_LINK_CLASSES =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-control bg-primary px-6 " +
  "text-[1.0625rem] font-bold text-on-primary shadow-3d-primary select-none hover:bg-primary-hover " +
  "active:translate-y-0.5 active:shadow-3d-primary-pressed focus-visible:focus-ring";

export interface AccountSwitchResultProps {
  outcome: Extract<AccountSwitchOutcome, { kind: "saved" | "failed" | "other-account" }>;
  /** Where "Continue" goes (a same-origin path). */
  next: string;
  onRetry: () => void;
  retrying?: boolean;
}

/**
 * The end of a sign-in that had progress to save (PLT-013 criteria 6 and 8): "Your
 * progress is saved." with Continue, a calm moment with Lumi and no confetti; or the
 * failure copy with "Try again" (the guest keeps everything and the app retries by itself).
 */
export function AccountSwitchResult({
  outcome,
  next,
  onRetry,
  retrying,
}: AccountSwitchResultProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [outcome.kind]);
  const saved = outcome.kind === "saved";
  const text = saved
    ? AUTH_COPY.progressSaved
    : outcome.kind === "failed"
      ? AUTH_COPY.saveFailed
      : AUTH_COPY.otherAccount;
  return (
    <div className="flex flex-col items-center gap-5 pb-10 text-center">
      <Lumi pose={saved ? "celebrating" : "idle"} size="md" />
      <div role={saved ? "status" : "alert"}>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-extrabold tracking-[-0.02em] outline-none"
        >
          {text}
        </h1>
      </div>
      {saved ? (
        <Link href={next} className={PRIMARY_LINK_CLASSES}>
          {AUTH_COPY.continue}
        </Link>
      ) : (
        <>
          {outcome.kind === "failed" && (
            <Button variant="primary" size="lg" fullWidth onClick={onRetry} loading={retrying}>
              {AUTH_COPY.tryAgain}
            </Button>
          )}
          <Link href="/" className={LINK_CLASSES}>
            {AUTH_COPY.backToLearn}
          </Link>
        </>
      )}
    </div>
  );
}
