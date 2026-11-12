import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HeartsState } from "@/contracts";
import { getLocalSession } from "@/lib/offline";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { useHearts } from "../use-hearts";
import { createHeartsSessionStub, HOUR } from "./session-stub";

vi.mock("@/lib/offline", () => ({ getLocalSession: vi.fn() }));

const T0 = new Date("2026-11-08T10:00:00.000Z");
const iso = (ms: number) => new Date(ms).toISOString();

function stubStored(state: HeartsState | Error) {
  const stub = createHeartsSessionStub();
  if (state instanceof Error) stub.getHearts.mockRejectedValue(state);
  else stub.getHearts.mockResolvedValue(state);
  vi.mocked(getLocalSession).mockResolvedValue(stub.session);
  return stub;
}

/** Lets the query resolve (TanStack notifies observers via a 0 ms timer). */
async function flush() {
  await act(() => vi.advanceTimersByTimeAsync(0));
}

function mountHearts() {
  let renders = 0;
  const client = createTestQueryClient();
  const hook = renderHook(
    () => {
      renders += 1;
      return useHearts();
    },
    { wrapper: createQueryWrapper(client) },
  );
  return { ...hook, client, renders: () => renders };
}

beforeEach(() => {
  vi.useFakeTimers({ now: T0 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useHearts", () => {
  it("is pending (view null) until the stored hearts are read", async () => {
    stubStored({ current: 5, refillStartedAt: null, updatedAt: T0.toISOString() });
    const { result } = mountHearts();
    expect(result.current).toEqual({ status: "pending", view: null, error: null });
    await flush();
    expect(result.current.status).toBe("success");
  });

  it("shows full hearts with no countdown and arms no refill timer", async () => {
    stubStored({ current: 5, refillStartedAt: null, updatedAt: T0.toISOString() });
    const { result, renders } = mountHearts();
    await flush();
    expect(result.current.view).toEqual({
      current: 5,
      max: 5,
      nextRefillAt: null,
      fullAt: null,
      canStartLesson: true,
    });
    const before = renders();
    await act(() => vi.advanceTimersByTimeAsync(24 * HOUR));
    expect(renders()).toBe(before);
  });

  it("after losing 1, the refill clock runs: next heart and full in 4 h", async () => {
    stubStored({ current: 4, refillStartedAt: T0.toISOString(), updatedAt: T0.toISOString() });
    const { result } = mountHearts();
    await flush();
    expect(result.current.view).toMatchObject({
      current: 4,
      nextRefillAt: iso(T0.getTime() + 4 * HOUR),
      fullAt: iso(T0.getTime() + 4 * HOUR),
      canStartLesson: true,
    });
  });

  it("applies refills that happened while the app was closed", async () => {
    stubStored({
      current: 2,
      refillStartedAt: iso(T0.getTime() - 9 * HOUR),
      updatedAt: iso(T0.getTime() - 9 * HOUR),
    });
    const { result } = mountHearts();
    await flush();
    expect(result.current.view).toMatchObject({
      current: 4,
      nextRefillAt: iso(T0.getTime() + 3 * HOUR),
    });
  });

  it("raises current at nextRefillAt while mounted, with exactly one re-render", async () => {
    stubStored({
      current: 4,
      refillStartedAt: iso(T0.getTime() - HOUR),
      updatedAt: iso(T0.getTime() - HOUR),
    });
    const { result, renders } = mountHearts();
    await flush();
    expect(result.current.view?.current).toBe(4);
    const before = renders();

    await act(() => vi.advanceTimersByTimeAsync(3 * HOUR - 1));
    expect(result.current.view?.current).toBe(4);
    expect(renders()).toBe(before); // no per-second or per-minute polling

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(result.current.view).toMatchObject({ current: 5, nextRefillAt: null });
    expect(renders()).toBe(before + 1);
  });

  it("re-arms the timer after each refill (3 -> 4 -> 5)", async () => {
    stubStored({ current: 3, refillStartedAt: T0.toISOString(), updatedAt: T0.toISOString() });
    const { result } = mountHearts();
    await flush();
    await act(() => vi.advanceTimersByTimeAsync(4 * HOUR));
    expect(result.current.view).toMatchObject({
      current: 4,
      nextRefillAt: iso(T0.getTime() + 8 * HOUR),
    });
    await act(() => vi.advanceTimersByTimeAsync(4 * HOUR));
    expect(result.current.view).toMatchObject({ current: 5, nextRefillAt: null });
  });

  it("recomputes at the current time when the page becomes visible again", async () => {
    stubStored({ current: 3, refillStartedAt: T0.toISOString(), updatedAt: T0.toISOString() });
    const { result } = mountHearts();
    await flush();
    // The tab slept: the clock moved 8 h but no timers ran.
    vi.setSystemTime(T0.getTime() + 8 * HOUR + 1000);
    expect(result.current.view?.current).toBe(3);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.view?.current).toBe(5);
  });

  it("falls back to full hearts (status error) and warns when the read fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const failure = new Error("IndexedDB is broken");
    stubStored(failure);
    const { result } = mountHearts();
    await flush();
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe(failure);
    expect(result.current.view).toMatchObject({ current: 5, max: 5, canStartLesson: true });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("hearts"), failure);
  });

  it("uses the cached value once a loss has been written over a failed read", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    stubStored(new Error("read failed"));
    const { result, client } = mountHearts();
    await flush();
    act(() => {
      client.setQueryData<HeartsState>(["hearts"], {
        current: 4,
        refillStartedAt: T0.toISOString(),
        updatedAt: T0.toISOString(),
      });
    });
    await flush();
    expect(result.current.status).toBe("success");
    expect(result.current.view?.current).toBe(4);
  });
});
