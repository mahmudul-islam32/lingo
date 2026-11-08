import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HeartsState } from "@/contracts";
import { getLocalSession } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import {
  createQueryWrapper,
  createTestQueryClient,
  renderWithQueryClient,
} from "@/lib/query/testing";
import { HeartsMeter } from "../../components/HeartsMeter";
import { useHearts } from "../use-hearts";
import { useLoseHearts, type LoseHeartsFn } from "../use-lose-hearts";
import { createHeartsSessionStub, deferred } from "./session-stub";

vi.mock("@/lib/offline", () => ({ getLocalSession: vi.fn() }));

const NOW = new Date("2026-11-08T10:00:00.000Z");
const full = (): HeartsState => ({
  current: 5,
  refillStartedAt: null,
  updatedAt: "2026-11-01T00:00:00.000Z",
});

function setup(stored: HeartsState | undefined = full(), options: { seed?: boolean } = {}) {
  const stub = createHeartsSessionStub(stored);
  vi.mocked(getLocalSession).mockResolvedValue(stub.session);
  const client = createTestQueryClient();
  if (stored && options.seed !== false) client.setQueryData(queryKeys.hearts(), stored);
  const { result } = renderHook(() => useLoseHearts(), {
    wrapper: createQueryWrapper(client),
  });
  const cached = () => client.getQueryData<HeartsState>(queryKeys.hearts());
  return { ...stub, client, lose: (cost: number) => result.current(cost), cached };
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useLoseHearts", () => {
  it("updates the cache synchronously, then saves the result", async () => {
    const { lose, cached, saveHearts } = setup();
    const done = lose(1);
    // Before the save resolves (AC 5).
    expect(cached()).toEqual({
      current: 4,
      refillStartedAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    await done;
    expect(saveHearts).toHaveBeenCalledTimes(1);
    expect(saveHearts).toHaveBeenCalledWith(cached());
  });

  it("applies two rapid calls (5 -> 3) and saves in order, one at a time", async () => {
    const { lose, cached, saveHearts } = setup();
    const first = deferred();
    saveHearts.mockImplementationOnce(() => first.promise);

    const a = lose(1);
    const b = lose(1);
    expect(cached()?.current).toBe(3);

    await waitFor(() => expect(saveHearts).toHaveBeenCalledTimes(1));
    // The second save waits for the first one.
    await Promise.resolve();
    expect(saveHearts).toHaveBeenCalledTimes(1);

    first.resolve();
    await Promise.all([a, b]);
    expect(saveHearts).toHaveBeenCalledTimes(2);
    expect(saveHearts.mock.calls.at(-1)?.[0].current).toBe(3);
  });

  it("does not write anything for a cost of 0", async () => {
    const { lose, cached, saveHearts } = setup();
    const before = cached();
    await lose(0);
    expect(cached()).toBe(before);
    expect(saveHearts).not.toHaveBeenCalled();
  });

  it("never goes below 0", async () => {
    const { lose, cached } = setup({
      current: 1,
      refillStartedAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    });
    await lose(3);
    expect(cached()?.current).toBe(0);
    await lose(1);
    expect(cached()?.current).toBe(0);
  });

  it("rejects a negative or fractional cost without changing anything", async () => {
    const { lose, cached, saveHearts } = setup();
    await expect(lose(-1)).rejects.toThrow(RangeError);
    await expect(lose(0.5)).rejects.toThrow(RangeError);
    expect(cached()?.current).toBe(5);
    expect(saveHearts).not.toHaveBeenCalled();
  });

  it("keeps the loss in memory and rejects when the save fails", async () => {
    const { lose, cached, saveHearts } = setup();
    const failure = new Error("quota exceeded");
    saveHearts.mockRejectedValueOnce(failure);

    await expect(lose(1)).rejects.toBe(failure);
    expect(cached()?.current).toBe(4);

    // The write queue is not stuck after a failure.
    await lose(1);
    expect(cached()?.current).toBe(3);
    expect(saveHearts).toHaveBeenCalledTimes(2);
  });

  it("reads stored hearts first when the cache is empty, so the loss builds on them", async () => {
    const stored: HeartsState = {
      current: 2,
      refillStartedAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };
    const { lose, cached, saveHearts, getHearts } = setup(stored, { seed: false });
    await lose(1);
    expect(getHearts).toHaveBeenCalledTimes(1);
    expect(cached()?.current).toBe(1);
    expect(saveHearts).toHaveBeenCalledWith(expect.objectContaining({ current: 1 }));
  });

  it("assumes full hearts when the read fails and the cache is empty", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { lose, cached, getHearts } = setup(full(), { seed: false });
    getHearts.mockRejectedValueOnce(new Error("read failed"));
    await lose(1);
    expect(getHearts).toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    expect(cached()?.current).toBe(4);
  });
});

describe("useHearts + useLoseHearts + HeartsMeter", () => {
  it("a mounted meter shows the loss before the save finishes", async () => {
    const stub = createHeartsSessionStub(full());
    const pending = deferred();
    stub.saveHearts.mockImplementation(() => pending.promise);
    vi.mocked(getLocalSession).mockResolvedValue(stub.session);

    let lose: LoseHeartsFn = async () => undefined;
    function Harness() {
      const { view } = useHearts();
      lose = useLoseHearts();
      return view ? <HeartsMeter current={view.current} max={view.max} /> : null;
    }
    const client = createTestQueryClient();
    renderWithQueryClient(<Harness />, { client });
    expect(await screen.findByRole("img", { name: "Hearts: 5 of 5" })).toBeInTheDocument();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = lose(1);
    });
    expect(await screen.findByRole("img", { name: "Hearts: 4 of 5" })).toBeInTheDocument();
    expect(stub.saveHearts).toHaveBeenCalledTimes(1);
    pending.resolve();
    await done;
  });
});
