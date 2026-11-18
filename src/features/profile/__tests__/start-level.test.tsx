import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Course, Settings } from "@/contracts";
import { listAvailableCourses, listBundledCourses } from "@/lib/content";
import { openLocalSession, type LocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import {
  createGuestProfileStore,
  effectiveStartLevel,
  firstLessonOfLevel,
  hasStartLevelChoice,
  isLowerLevel,
  START_LEVEL_DESCRIPTIONS,
  startLevelLabel,
  startLevelOptions,
  useSetStartLevel,
  useUpdateSettings,
} from "..";

let german: Course;
let spanish: Course;

beforeEach(async () => {
  [german] = await listAvailableCourses();
  spanish = (await listBundledCourses()).find((c) => c.id === "en-es")!;
});

describe("start level rules (PLT-025)", () => {
  it("offers only levels with content, in course order, with a description", () => {
    expect(startLevelOptions(german)).toEqual([
      { level: "A1", label: "A1 · Beginner", description: START_LEVEL_DESCRIPTIONS.A1 },
      { level: "A2", label: "A2 · Elementary", description: START_LEVEL_DESCRIPTIONS.A2 },
    ]);
    expect(hasStartLevelChoice(german)).toBe(true);
    expect(startLevelOptions(spanish)).toEqual([]);
    expect(hasStartLevelChoice(spanish)).toBe(false);
  });

  it("prefers a level description declared by the course", () => {
    const course: Course = {
      ...german,
      levels: german.levels!.map((l) => (l.level === "A2" ? { ...l, description: "Own" } : l)),
    };
    expect(startLevelOptions(course)[1]!.description).toBe("Own");
  });

  it("falls back to the first level with content when missing, unknown or contentless", () => {
    expect(effectiveStartLevel(german, undefined)).toBe("A1");
    expect(effectiveStartLevel(german, "A2")).toBe("A2");
    expect(effectiveStartLevel(german, "B1")).toBe("A1");
    expect(effectiveStartLevel(spanish, "A2")).toBeNull();
    expect(startLevelLabel(german, undefined)).toBe("A1 · Beginner");
    expect(startLevelLabel(german, "A2")).toBe("A2 · Elementary");
  });

  it("finds the first lesson of a level; falls back to the course's first lesson", () => {
    expect(firstLessonOfLevel(german, "A2").id).toMatch(/^de-a2-u01-l1-/);
    expect(firstLessonOfLevel(german, "A1").id).toMatch(/^de-a1-u01-l1-/);
    expect(firstLessonOfLevel(german, "C1").id).toBe(german.units[0]!.lessons[0]!.id);
    expect(firstLessonOfLevel(spanish, null).id).toBe(spanish.units[0]!.lessons[0]!.id);
  });

  it("compares levels in CEFR order", () => {
    expect(isLowerLevel("A1", "A2")).toBe(true);
    expect(isLowerLevel("A2", "A2")).toBe(false);
    expect(isLowerLevel("B1", "A2")).toBe(false);
  });
});

describe("useSetStartLevel / useUpdateSettings (PLT-025)", () => {
  let session: LocalSession;
  let store: ReturnType<typeof createGuestProfileStore>;

  beforeEach(async () => {
    const opened = openLocalSession({ forceMemory: true });
    store = createGuestProfileStore({ loadSession: () => opened });
    await store.getState().init();
    session = await opened;
    await session.profile.updateSettings({ courseId: "en-de", dailyGoalXp: 20 });
  });

  it("saves startLevel through the repository and updates the settings cache", async () => {
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.settings(), await session.profile.findSettings());
    const { result } = renderHook(() => useSetStartLevel(store), {
      wrapper: createQueryWrapper(client),
    });
    await act(() => result.current.mutateAsync("A2"));
    expect((await session.profile.getSettings()).startLevel).toBe("A2");
    expect(client.getQueryData<Settings>(queryKeys.settings())?.startLevel).toBe("A2");
    expect(store.getState().settings?.startLevel).toBe("A2");

    // ADR-013: going back to the first level is an explicit "A1".
    await act(() => result.current.mutateAsync("A1"));
    expect((await session.profile.getSettings()).startLevel).toBe("A1");
    expect(client.getQueryData<Settings>(queryKeys.settings())?.dailyGoalXp).toBe(20);
  });

  it("a failed save rejects and leaves the cache unchanged", async () => {
    const client = createTestQueryClient();
    const before = await session.profile.findSettings();
    client.setQueryData(queryKeys.settings(), before);
    store.setState({ updateSettings: () => Promise.reject(new Error("disk full")) });
    const { result } = renderHook(() => useSetStartLevel(store), {
      wrapper: createQueryWrapper(client),
    });
    await expect(act(() => result.current.mutateAsync("A2"))).rejects.toThrow("disk full");
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData(queryKeys.settings())).toEqual(before);
  });

  it("useUpdateSettings drops undefined keys, so a patch never erases a stored value", async () => {
    await session.profile.updateSettings({ startLevel: "A2" });
    const client = createTestQueryClient();
    const { result } = renderHook(() => useUpdateSettings(store), {
      wrapper: createQueryWrapper(client),
    });
    await act(() =>
      result.current.mutateAsync({ soundEffectsEnabled: false, startLevel: undefined }),
    );
    const saved = await session.profile.getSettings();
    expect(saved).toMatchObject({ soundEffectsEnabled: false, startLevel: "A2" });
    expect(client.getQueryData(queryKeys.settings())).toEqual(saved);
  });
});
