import type { ReactNode } from "react";
import { cn } from "@/components/ui";
import { MAIN_ID } from "./main-landmark";

export interface MainProps {
  children: ReactNode;
  className?: string;
}

/**
 * The page's one `<main>` landmark. `tabIndex={-1}` lets the skip link move focus here
 * without adding it to the Tab order.
 */
export function Main({ children, className }: MainProps) {
  return (
    <main
      id={MAIN_ID}
      tabIndex={-1}
      className={cn(
        "mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 outline-none",
        className,
      )}
    >
      {children}
    </main>
  );
}
