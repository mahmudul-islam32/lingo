import { GearIcon, Lumi } from "@/components/ui";

export interface ProfileHeaderProps {
  /** The chosen name, or "Guest". */
  name: string;
  /** Up to two initials; `null` for a guest without a name (Lumi is shown instead). */
  initials: string | null;
  /** "Learning German · Joined November 2026" (parts omitted when unknown). */
  subtitle: string;
  /** Target of the settings gear (the Settings section on this page). */
  settingsHref: string;
}

/**
 * Profile header (design v2 screen 8, PLT-026 AC 10): indigo avatar circle with white
 * initials (Lumi for a guest without a name), the name in the display font, the course
 * and join date, and a settings gear that jumps to the Settings rows.
 */
export function ProfileHeader({ name, initials, subtitle, settingsHref }: ProfileHeaderProps) {
  return (
    <header className="flex items-center gap-4" data-testid="profile-header">
      <span
        aria-hidden="true"
        data-testid="profile-avatar"
        className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-display text-[1.75rem] font-extrabold text-on-primary"
      >
        {initials ?? <Lumi pose="happy" size="sm" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p
          className="font-display text-2xl leading-tight font-extrabold break-words"
          data-testid="profile-name"
        >
          {name}
        </p>
        {subtitle && (
          <p className="text-sm text-fg-muted" data-testid="profile-subtitle">
            {subtitle}
          </p>
        )}
      </div>
      <a
        href={settingsHref}
        aria-label="Settings"
        className="flex size-12 shrink-0 items-center justify-center rounded-chip border-2 border-border bg-surface text-fg-muted shadow-3d-card hover:text-fg focus-visible:focus-ring"
      >
        <GearIcon size={22} strokeWidth={2} />
      </a>
    </header>
  );
}
