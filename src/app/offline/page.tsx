import type { Metadata } from "next";
import { Lumi } from "@/components/ui";
import { Main } from "../_shell/Main";
import { RetryButton } from "./RetryButton";

export const metadata: Metadata = { title: "Offline" };

/** Prerendered at build time so the service worker can precache it. */
export const dynamic = "force-static";

/**
 * Offline fallback (PLT-002 criterion 7). The service worker serves this page for any
 * navigation that isn't cached while the network is down. Outside the `(tabs)` group, so
 * no bottom navigation (its links might not be cached either).
 */
export default function OfflinePage() {
  return (
    <Main className="items-center justify-center gap-4 pb-6 text-center">
      <Lumi pose="ember" size="md" />
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="text-fg-muted">Check your connection and try again.</p>
      <RetryButton />
    </Main>
  );
}
