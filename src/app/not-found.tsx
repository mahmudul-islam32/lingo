import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassNames } from "./_shell/link-styles";
import { Main } from "./_shell/Main";

export const metadata: Metadata = { title: "Page not found" };

/** Custom 404 (criterion 10). Outside the `(tabs)` group, so no bottom navigation. */
export default function NotFound() {
  return (
    <Main className="items-center justify-center gap-4 pb-6 text-center">
      <h1 className="text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="text-fg-muted">The link may be old, or the page has moved.</p>
      <Link href="/" className={buttonClassNames}>
        Back to Learn
      </Link>
    </Main>
  );
}
