import type { ReactNode } from "react";
import { Lumi } from "@/components/ui";

export interface AuthLayoutProps {
  title: string;
  headingId?: string;
  children: ReactNode;
}

/**
 * Shared layout of the auth screens (PLT-010 UX notes): Lumi small at the top, the
 * display heading, one column. The page scrolls normally, so the submit button stays
 * reachable with the on-screen keyboard open.
 */
export function AuthLayout({ title, headingId, children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Lumi pose="happy" size="sm" />
        <h1 id={headingId} className="font-display text-3xl font-extrabold tracking-[-0.02em]">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
