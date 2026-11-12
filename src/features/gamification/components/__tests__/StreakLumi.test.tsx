import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LessonResult } from "@/contracts";
import { addDays, createFullHearts, StreakLumi, toLocalDate } from "@/features/gamification";
import { queryKeys } from "@/lib/query";
import { createTestQueryClient, renderWithQueryClient } from "@/lib/query/testing";
import { makeResult } from "../../rules/__tests__/fixtures";
import { createStubSession, pending, type StubSession } from "../../hooks/__tests__/session-stub";

const mocks = vi.hoisted(() => ({ session: null as unknown }));
vi.mock("@/lib/offline", () => ({ getLocalSession: async () => mocks.session }));

const COURSE = "es-en";
const TZ = "UTC";
let session: StubSession;

beforeEach(() => {
  session = createStubSession();
  mocks.session = session;
  session.profile.findSettings.mockResolvedValue(null);
  session.progress.getHearts.mockResolvedValue(createFullHearts(new Date()));
});

afterEach(() => vi.restoreAllMocks());

const today = () => toLocalDate(new Date(), TZ);
const onDay = (localDate: string): LessonResult =>
  makeResult({ courseId: COURSE, localDate, timeZone: TZ });

function seeded(results: LessonResult[]) {
  const client = createTestQueryClient();
  client.setQueryData(queryKeys.progress(COURSE), results);
  client.setQueryData(queryKeys.hearts(), createFullHearts(new Date()));
  client.setQueryData(queryKeys.settings(), null);
  return client;
}

function renderLumi(client = createTestQueryClient()) {
  const view = renderWithQueryClient(<StreakLumi courseId={COURSE} timeZone={TZ} />, { client });
  const lumi = () => screen.getByTestId("streak-lumi").querySelector("svg")!;
  return { ...view, lumi };
}

describe("StreakLumi (GAM-009)", () => {
  it("new learner (none): idle Lumi and the first-streak message (AC2)", () => {
    const { lumi } = renderLumi(seeded([]));
    expect(lumi()).toHaveAttribute("data-pose", "idle");
    expect(screen.getByText("Finish a lesson to light your first streak.")).toBeInTheDocument();
  });

  it("extended: happy Lumi (AC1, AC2)", () => {
    const { lumi } = renderLumi(seeded([onDay(today())]));
    expect(lumi()).toHaveAttribute("data-pose", "happy");
    expect(screen.getByText("You're glowing! Your streak is safe today.")).toBeInTheDocument();
  });

  it("at risk: idle Lumi and '1-day streak' / '3-day streak' (AC2)", () => {
    const t = today();
    const { lumi, unmount } = renderLumi(seeded([onDay(addDays(t, -1))]));
    expect(lumi()).toHaveAttribute("data-pose", "idle");
    expect(screen.getByText("Do a lesson today to keep your 1-day streak.")).toBeInTheDocument();
    unmount();
    renderLumi(seeded([onDay(addDays(t, -3)), onDay(addDays(t, -2)), onDay(addDays(t, -1))]));
    expect(screen.getByText("Do a lesson today to keep your 3-day streak.")).toBeInTheDocument();
  });

  it("broken: ember Lumi (AC2)", () => {
    const { lumi } = renderLumi(seeded([onDay(addDays(today(), -5))]));
    expect(lumi()).toHaveAttribute("data-pose", "ember");
    expect(screen.getByText("Your streak went out. Start a new one today.")).toBeInTheDocument();
  });

  it("Lumi is decorative; the message is plain text, not a live region (AC3)", () => {
    const { lumi } = renderLumi(seeded([]));
    expect(lumi()).toHaveAttribute("aria-hidden", "true");
    const message = screen.getByText(/first streak/);
    expect(message.tagName).toBe("P");
    expect(message).not.toHaveAttribute("aria-live");
    expect(message).toHaveClass("text-fg", "line-clamp-2");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("status change re-renders pose and message without a reload (AC4)", async () => {
    const client = seeded([onDay(addDays(today(), -1))]);
    const { lumi } = renderLumi(client);
    expect(lumi()).toHaveAttribute("data-pose", "idle");
    session.progress.listLessonResults.mockResolvedValue([
      onDay(addDays(today(), -1)),
      onDay(today()),
    ]);
    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(COURSE) }));
    expect(await screen.findByText("You're glowing! Your streak is safe today.")).toBeVisible();
    expect(lumi()).toHaveAttribute("data-pose", "happy");
  });

  it("loading: idle Lumi plus a text skeleton (AC6)", () => {
    session.progress.listLessonResults.mockReturnValue(pending());
    const { lumi } = renderLumi();
    expect(lumi()).toHaveAttribute("data-pose", "idle");
    expect(screen.getByTestId("streak-lumi").querySelector("[data-skeleton]")).not.toBeNull();
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("error: idle Lumi and no message line (AC7)", async () => {
    session.progress.listLessonResults.mockRejectedValue(new Error("quota"));
    const { lumi } = renderLumi();
    await vi.waitFor(() =>
      expect(screen.getByTestId("streak-lumi").querySelector("[data-skeleton]")).toBeNull(),
    );
    expect(lumi()).toHaveAttribute("data-pose", "idle");
    expect(screen.getByTestId("streak-lumi").querySelector("p")).toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
