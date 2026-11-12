import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deviceTimeZone, useLocalToday } from "@/features/gamification";
import { becomeVisible } from "./session-stub";

const HOUR = 60 * 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useLocalToday (GAM-003 AC8, AC13)", () => {
  it("defaults to the device timezone", () => {
    vi.setSystemTime(new Date("2026-11-07T12:00:00.000Z"));
    const { result } = renderHook(() => useLocalToday());
    expect(result.current.timeZone).toBe(deviceTimeZone());
    expect(result.current.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("changes at a simulated local midnight while open", async () => {
    vi.setSystemTime(new Date("2026-11-07T22:59:00.000Z")); // 23:59 in Berlin
    const { result } = renderHook(() => useLocalToday({ timeZone: "Europe/Berlin" }));
    expect(result.current.today).toBe("2026-11-07");

    await act(async () => vi.advanceTimersByTime(59_999));
    expect(result.current.today).toBe("2026-11-07");

    await act(async () => vi.advanceTimersByTime(1));
    expect(result.current.today).toBe("2026-11-08");
    expect(result.current.now.toISOString()).toBe("2026-11-07T23:00:00.000Z");

    // Re-armed: the next midnight is picked up too.
    await act(async () => vi.advanceTimersByTime(24 * HOUR));
    expect(result.current.today).toBe("2026-11-09");
  });

  it("re-checks after a capped 24 h timer on a 25 h DST day", async () => {
    vi.setSystemTime(new Date("2026-11-01T07:30:00.000Z")); // 00:30 PDT, day has 25 h
    const { result } = renderHook(() => useLocalToday({ timeZone: "America/Los_Angeles" }));
    await act(async () => vi.advanceTimersByTime(24 * HOUR));
    expect(result.current.today).toBe("2026-11-01");
    await act(async () => vi.advanceTimersByTime(HOUR / 2));
    expect(result.current.today).toBe("2026-11-02");
  });

  it("updates on visibilitychange after the device slept past midnight", async () => {
    vi.setSystemTime(new Date("2026-11-07T20:00:00.000Z"));
    const { result } = renderHook(() => useLocalToday({ timeZone: "Europe/Berlin" }));
    expect(result.current.today).toBe("2026-11-07");

    // Timers don't run while the phone sleeps: move the clock without firing them.
    vi.setSystemTime(new Date("2026-11-08T07:00:00.000Z"));
    await act(async () => becomeVisible("hidden"));
    expect(result.current.today).toBe("2026-11-07");
    await act(async () => becomeVisible("visible"));
    expect(result.current.today).toBe("2026-11-08");
    expect(result.current.now.toISOString()).toBe("2026-11-08T07:00:00.000Z");
  });

  it("follows a timezone change", () => {
    vi.setSystemTime(new Date("2026-11-08T03:00:00.000Z"));
    const { result, rerender } = renderHook(({ tz }) => useLocalToday({ timeZone: tz }), {
      initialProps: { tz: "Europe/Berlin" },
    });
    expect(result.current.today).toBe("2026-11-08");
    rerender({ tz: "America/Los_Angeles" });
    expect(result.current).toMatchObject({ today: "2026-11-07", timeZone: "America/Los_Angeles" });
  });

  it("removes its timer and listener on unmount", () => {
    vi.setSystemTime(new Date("2026-11-07T12:00:00.000Z"));
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useLocalToday({ timeZone: "UTC" }));
    unmount();
    expect(remove).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
