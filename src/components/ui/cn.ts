import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge<"focus-ring">({
  extend: {
    classGroups: {
      "focus-ring": ["focus-ring"],
    },
  },
});

/**
 * Joins class names (clsx syntax: strings, arrays, `{ cls: condition }`) and resolves
 * Tailwind conflicts so the last class wins: `cn("px-2", isWide && "px-6")`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
