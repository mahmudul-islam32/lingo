"use client";

import { ErrorState, type ErrorStateProps } from "../_shell/ErrorState";

/** Error boundary for Learn and Profile: rendered inside `<main>`, the nav stays visible. */
export default function TabsError({ error, reset }: ErrorStateProps) {
  return <ErrorState error={error} reset={reset} />;
}
