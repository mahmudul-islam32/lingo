import type { ReactNode } from "react";
import { Main } from "../_shell/Main";
import { OfflineBanner } from "../_shell/OfflineBanner";

/**
 * Layout of the account screens (`/sign-up`, `/log-in`, `/auth/callback`; PLT-010): no
 * bottom navigation, the offline banner above the one `<main>`. Every page redirects to
 * Learn when accounts are disabled (ADR-020 §1).
 */
export default function AuthRoutesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <OfflineBanner />
      <Main>{children}</Main>
    </>
  );
}
