import { readFileSync } from "node:fs";
import { join } from "node:path";
import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LessonResult, Settings } from "@/contracts";
import {
  addDays,
  createFullHearts,
  LEAGUES_SUBTITLE,
  LEAGUES_TITLE,
  LeaguesScreen,
  toLocalDate,
} from "@/features/gamification";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending, type StubSession } from "../../hooks/__tests__/session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "en-de";
const TZ = "UTC";
let session: StubSession;

beforeEach(() => {
  session = createStubSession();
  mocks.session = session;
  session.progress.listLessonResults.mockResolvedValue([]);
  session.progress.getHearts.mockResolvedValue(createFullHearts(new Date()));
  session.profile.findSettings.mockResolvedValue({ courseId: COURSE } as Settings);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function onDay(localDate: string, perfect = true): LessonResult {
  return makeResult({
    courseId: COURSE,
    localDate,
    timeZone: TZ,
    ...(perfect ? {} : { mistakeCount: 1, perfect: false }),
  });
}

function setup() {
  return renderWithQueryClient(<LeaguesScreen timeZone={TZ} />, {
    client: createTestQueryClient(),
  });
}

describe("LeaguesScreen (GAM-012 AC10, AC11)", () => {
  it("honest state: heading, explanation and the shield illustration", async () => {
    setup();
    expect(screen.getByRole("heading", { level: 1, name: LEAGUES_TITLE })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Leagues arrive with accounts",
    );
    expect(screen.getByText(LEAGUES_SUBTITLE)).toBeInTheDocument();
    expect(screen.getByText(/sign-in and sync launch/)).toBeInTheDocument();
    expect(screen.getByTestId("league-shield")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector("svg[data-pose]")).not.toBeNull(); // Lumi
    await screen.findByText(/XP$/);
  });

  it("shows the learner's own XP this week as a single card", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-19T12:00:00Z"), toFake: ["Date"] }); // Thursday
    const today = toLocalDate(new Date(), TZ);
    session.progress.listLessonResults.mockResolvedValue([
      onDay(addDays(today, -4)), // last Sunday: not this week
      onDay(addDays(today, -3)), // Monday: 15
      onDay(today, false), // 10
    ]);
    setup();
    expect(await screen.findByText("25 XP")).toBeInTheDocument();
    expect(screen.getByText("Your XP this week")).toBeInTheDocument();
  });

  it("new learner: 0 XP this week", async () => {
    setup();
    expect(await screen.findByText("0 XP")).toBeInTheDocument();
  });

  it("no list items, names, ranks or controls (AC10, AC11)", async () => {
    session.progress.listLessonResults.mockResolvedValue([onDay(toLocalDate(new Date(), TZ))]);
    setup();
    await screen.findByText("15 XP");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryAllByRole("list")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(document.body.textContent).not.toMatch(/rank|bronze|silver|gold|promotion|#\d/i);
  });

  it("loading: a skeleton with a status", () => {
    session.progress.listLessonResults.mockReturnValue(pending());
    setup();
    expect(screen.getByRole("status")).toHaveTextContent("Loading your XP this week");
  });

  it("results can't be read: the XP card is left out, the screen still shows", async () => {
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    setup();
    await vi.waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.queryByText(/XP$/)).not.toBeInTheDocument();
  });

  it("contains no leaderboard data or colour literals in its code path", () => {
    const dir = join(__dirname, "..");
    for (const file of ["LeaguesScreen.tsx", "LeagueShield.tsx", "copy.ts"]) {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src, file).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
      expect(src, file).not.toMatch(/leaderboard\s*[:=]|rank\s*[:=]|players?\s*[:=]/i);
    }
  });
});
