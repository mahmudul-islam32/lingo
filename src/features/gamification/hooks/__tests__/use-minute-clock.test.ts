import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMinuteClock } from "../use-minute-clock";

const T0 = new Date("2026-11-08T10:00:00.000Z").getTime();

beforeEach(() => {
  vi.useFakeTimers({ now: T0 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useMinuteClock", () => {
  it("refreshes once per minute while enabled", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useMinuteClock(true);
    });
    expect(result.current.getTime()).toBe(T0);
    const before = renders;

    act(() => vi.advanceTimersByTime(59_999));
    expect(result.current.getTime()).toBe(T0);
    expect(renders).toBe(before);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.getTime()).toBe(T0 + 60_000);
    expect(renders).toBe(before + 1);

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.getTime()).toBe(T0 + 120_000);
  });

  it("arms no timer while disabled, and is fresh when enabled again", () => {
    const { result, rerender } = renderHook(({ on }) => useMinuteClock(on), {
      initialProps: { on: false },
    });
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(10 * 60_000));
    expect(result.current.getTime()).toBe(T0);

    rerender({ on: true });
    expect(result.current.getTime()).toBe(T0 + 10 * 60_000);
    expect(vi.getTimerCount()).toBe(1);

    rerender({ on: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("refreshes when the page becomes visible again", () => {
    const { result } = renderHook(() => useMinuteClock(true));
    vi.setSystemTime(T0 + 30_000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.getTime()).toBe(T0 + 30_000);
  });
});
