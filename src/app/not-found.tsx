import type { Metadata } from "next";
import Link from "next/link";
import { Card, Lumi } from "@/components/ui";
import { buttonClassNames } from "./_shell/link-styles";
import { Main } from "./_shell/Main";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Custom 404 (criterion 10; design v2 PLT-026). Outside the `(tabs)` group, so no bottom
 * navigation.
 */
export default function NotFound() {
  return (
    <Main className="justify-center pb-6">
      <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
        <Lumi pose="idle" size="md" />
        <h1 className="font-display text-2xl leading-tight font-extrabold text-balance">
          We couldn&apos;t find that page
        </h1>
        <p className="text-fg-muted">The link may be old, or the page has moved.</p>
        <Link href="/" className={`${buttonClassNames} w-full`}>
          Back to Learn
        </Link>
      </Card>
    </Main>
  );
}
