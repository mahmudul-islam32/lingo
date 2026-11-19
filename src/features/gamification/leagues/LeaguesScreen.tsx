"use client";

import { BoltIcon, Card, Lumi, Skeleton, StatTile, VisuallyHidden } from "@/components/ui";
import { useActiveCourseId } from "../hooks/use-active-course-id";
import { useProgressInputs, type UseProgressOptions } from "../hooks/use-user-progress";
import { weeklyXp } from "../rules/weekly-xp";
import {
  LEAGUES_SUBTITLE,
  LEAGUES_TITLE,
  LEAGUES_WHEN_TEXT,
  WEEKLY_XP_LABEL,
  WEEKLY_XP_LOADING_TEXT,
} from "./copy";
import { LeagueShield } from "./LeagueShield";

export type LeaguesScreenProps = UseProgressOptions;

/** The learner's own XP this week, from saved lesson results (no other people, PD-066). */
function WeeklyXpCard(options: UseProgressOptions) {
  const { courseId, pending } = useActiveCourseId();
  const inputs = useProgressInputs(courseId, options);

  if (inputs.status === "error") return null;
  if (pending || inputs.status !== "success") {
    return (
      <div role="status" data-testid="weekly-xp-skeleton">
        <VisuallyHidden>{WEEKLY_XP_LOADING_TEXT}</VisuallyHidden>
        <Skeleton shape="rect" className="h-18 rounded-card" />
      </div>
    );
  }
  const xp = weeklyXp(inputs.results, inputs.today);
  return (
    <StatTile
      layout="inline"
      tone="gold"
      icon={<BoltIcon size={28} />}
      label={WEEKLY_XP_LABEL}
      value={`${xp} XP`}
      className="shadow-3d-card"
    />
  );
}

/**
 * Leagues tab (GAM-012 AC10, AC11; PD-066 §6): leagues need accounts (v0.6.0), so this is
 * an honest "coming" state in the screen 7 style. No names, ranks, tiers or leaderboard;
 * only a shield illustration, Lumi, the explanation and the learner's own weekly XP. No
 * interactive element (navigation is the shell's). Self-contained: reads the active
 * course and its results through the gamification hooks.
 */
export function LeaguesScreen(options: LeaguesScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-6" data-testid="leagues">
      <header className="flex flex-col items-center gap-2.5 rounded-banner border-2 border-border bg-surface px-6 pt-8 pb-6 text-center shadow-3d-card">
        <LeagueShield />
        <h1 className="mt-1 font-display text-[1.625rem] leading-tight font-extrabold text-fg">
          {LEAGUES_TITLE}
        </h1>
        <p className="text-sm text-fg-muted">{LEAGUES_SUBTITLE}</p>
      </header>
      <WeeklyXpCard {...options} />
      <Card tone="flat" className="flex items-center gap-3">
        <Lumi pose="idle" size="sm" />
        <p className="min-w-0 text-fg">{LEAGUES_WHEN_TEXT}</p>
      </Card>
    </div>
  );
}
