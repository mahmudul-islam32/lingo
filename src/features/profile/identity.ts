import type { Profile } from "@/contracts";
import { DEFAULT_GUEST_DISPLAY_NAME } from "@/lib/offline";

/** Shown instead of a name for a guest who hasn't picked one (PLT-026 AC 10). */
export const GUEST_NAME = "Guest";

/** True when the learner chose a name (the placeholder "Learner" doesn't count). */
export function hasChosenName(profile: Pick<Profile, "displayName"> | null): boolean {
  const name = profile?.displayName.trim() ?? "";
  return name !== "" && name !== DEFAULT_GUEST_DISPLAY_NAME;
}

/** The name on the Profile header: the chosen name, else "Guest". */
export function profileDisplayName(profile: Pick<Profile, "displayName"> | null): string {
  return hasChosenName(profile) ? profile!.displayName.trim() : GUEST_NAME;
}

/** Up to two initials, e.g. "Alex Lindqvist" → "AL", "mia" → "M". `null` without a name. */
export function profileInitials(profile: Pick<Profile, "displayName"> | null): string | null {
  if (!hasChosenName(profile)) return null;
  const words = profile!.displayName.trim().split(/\s+/u);
  const letters = [words[0], words.length > 1 ? words.at(-1) : undefined]
    .filter((w): w is string => Boolean(w))
    .map((w) => Array.from(w)[0]!.toLocaleUpperCase("en"));
  return letters.join("");
}

/**
 * "Joined November 2026" from `joinedAt` (falls back to `onboardedAt`); `null` when no
 * valid date is stored, so the caller leaves the joined part out.
 */
export function joinedLabel(
  profile: Pick<Profile, "joinedAt" | "onboardedAt"> | null,
  timeZone?: string,
): string | null {
  const iso = profile?.joinedAt || profile?.onboardedAt;
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const month = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
  return `Joined ${month}`;
}

/** "Learning German · Joined November 2026" (joined part omitted when unknown). */
export function profileSubtitle(language: string | null, joined: string | null): string {
  return [language ? `Learning ${language}` : null, joined].filter(Boolean).join(" · ");
}
