"use client";

import { ErrorState, type ErrorStateProps } from "./_shell/ErrorState";
import { Main } from "./_shell/Main";

/** Error boundary for routes outside the tabs group and for the tabs layout itself. */
export default function RootError({ error, reset }: ErrorStateProps) {
  return (
    <Main>
      <ErrorState error={error} reset={reset} />
    </Main>
  );
}
