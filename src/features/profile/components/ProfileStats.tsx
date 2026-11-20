import { BoltIcon, CheckIcon, FlameIcon, Skeleton, StarIcon, StatTile } from "@/components/ui";

export interface ProfileStatsValues {
  streakDays: number;
  totalXp: number;
  lessonsDone: number;
  /** E.g. "A1"; `null` for a course without levels. */
  startLevel: string | null;
}

export interface ProfileStatsProps {
  status: "loading" | "error" | "success";
  values: ProfileStatsValues | null;
}

export const STATS_ERROR = "Couldn't load your stats.";

const number = (n: number) => n.toLocaleString("en");

/**
 * The 2 × 2 stat tiles of screen 8 with real data only (PD-066 §7, PLT-026 AC 11): day
 * streak, total XP, lessons done and start level. No league, words or achievements.
 */
export function ProfileStats({ status, values }: ProfileStatsProps) {
  if (status === "loading" || (status === "success" && !values)) {
    return (
      <div role="status" aria-label="Loading stats" className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} shape="rect" className="h-[4.75rem] rounded-card" />
        ))}
      </div>
    );
  }
  if (status === "error" || !values) {
    return (
      <p role="alert" className="text-fg-muted">
        {STATS_ERROR}
      </p>
    );
  }
  return (
    <section aria-label="Statistics">
      <ul className="grid grid-cols-2 gap-2.5" data-testid="profile-stats">
        <StatTile
          as="li"
          layout="inline"
          tone="coral"
          icon={<FlameIcon size={26} />}
          label="Day streak"
          value={number(values.streakDays)}
        />
        <StatTile
          as="li"
          layout="inline"
          tone="gold"
          icon={<BoltIcon size={26} />}
          label="Total XP"
          value={number(values.totalXp)}
        />
        <StatTile
          as="li"
          layout="inline"
          tone="green"
          icon={<CheckIcon size={26} />}
          label="Lessons done"
          value={number(values.lessonsDone)}
        />
        <StatTile
          as="li"
          layout="inline"
          tone="indigo"
          icon={<StarIcon size={26} />}
          label="Start level"
          value={values.startLevel ?? "–"}
        />
      </ul>
    </section>
  );
}
