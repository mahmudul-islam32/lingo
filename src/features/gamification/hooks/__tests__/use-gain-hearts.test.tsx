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
import { useGainHearts, type GainHeartsFn } from "../use-gain-hearts";
import { useHearts } from "../use-hearts";
import { useLoseHearts } from "../use-lose-hearts";
import { HOUR, createHeartsSessionStub, deferred } from "./session-stub";

vi.mock("@/lib/offline", () => ({ getLocalSession: vi.fn() }));

const NOW = new Date("2026-11-18T10:00:00.000Z");
const STARTED = new Date(NOW.getTime() - HOUR).toISOString();
const hearts = (current: number): HeartsState => ({
  current,
  refillStartedAt: current === 5 ? null : STARTED,
  updatedAt: "2026-11-18T09:00:00.000Z",
});

function setup(stored: HeartsState | undefined = hearts(2), options: { seed?: boolean } = {}) {
  const stub = createHeartsSessionStub(stored);
  vi.mocked(getLocalSession).mockResolvedValue(stub.session);
  const client = createTestQueryClient();
  if (stored && options.seed !== false) client.setQueryData(queryKeys.hearts(), stored);
  const { result } = renderHook(() => ({ gain: useGainHearts(), lose: useLoseHearts() }), {
    wrapper: createQueryWrapper(client),
  });
  const cached = () => client.getQueryData<HeartsState>(queryKeys.hearts());
  return {
    ...stub,
    client,
    gain: (amount?: number) => result.current.gain(amount),
    lose: (cost: number) => result.current.lose(cost),
    cached,
  };
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useGainHearts (GAM-011 AC12, AC14)", () => {
  it("0 -> 1: updates the cache synchronously, keeps the clock, then saves", async () => {
    const { gain, cached, saveHearts } = setup(hearts(0));
    const done = gain();
    expect(cached()).toEqual({
      current: 1,
      refillStartedAt: STARTED,
      updatedAt: NOW.toISOString(),
    });
    await done;
    expect(saveHearts).toHaveBeenCalledWith(cached());
  });

  it("4 -> 5 stops the refill clock", async () => {
    const { gain, cached } = setup(hearts(4));
    await gain();
    expect(cached()).toMatchObject({ current: 5, refillStartedAt: null });
  });

  it("5 -> 5 keeps the stored state", async () => {
    const { gain, cached } = setup(hearts(5));
    const before = cached();
    await gain();
    expect(cached()).toEqual(before);
  });

  it("amount 0 writes nothing", async () => {
    const { gain, saveHearts } = setup();
    await gain(0);
    expect(saveHearts).not.toHaveBeenCalled();
  });

  it("rejects a negative or fractional amount without changing anything", async () => {
    const { gain, cached, saveHearts } = setup();
    await expect(gain(-1)).rejects.toThrow(RangeError);
    await expect(gain(0.5)).rejects.toThrow(RangeError);
    expect(cached()?.current).toBe(2);
    expect(saveHearts).not.toHaveBeenCalled();
  });

  it("gain then loss share one ordered queue: 2 -> 3 -> 2, saved in call order", async () => {
    const { gain, lose, cached, saveHearts } = setup();
    const first = deferred();
    saveHearts.mockImplementationOnce(() => first.promise);
    const a = gain();
    const b = lose(1);
    expect(cached()?.current).toBe(2);
    await waitFor(() => expect(saveHearts).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(saveHearts).toHaveBeenCalledTimes(1);
    first.resolve();
    await Promise.all([a, b]);
    expect(saveHearts).toHaveBeenCalledTimes(2);
    expect(saveHearts.mock.calls.at(-1)?.[0].current).toBe(2);
  });

  it("logs a failed save without rejecting and keeps the gain in memory", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { gain, cached, saveHearts } = setup();
    saveHearts.mockRejectedValueOnce(new Error("quota exceeded"));
    await expect(gain()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    expect(cached()?.current).toBe(3);
    await gain();
    expect(cached()?.current).toBe(4);
    expect(saveHearts).toHaveBeenCalledTimes(2);
  });

  it("reads stored hearts first when the cache is empty", async () => {
    const { gain, cached, getHearts, saveHearts } = setup(hearts(1), { seed: false });
    await gain();
    expect(getHearts).toHaveBeenCalledTimes(1);
    expect(cached()?.current).toBe(2);
    expect(saveHearts).toHaveBeenCalledWith(expect.objectContaining({ current: 2 }));
  });
});

describe("useHearts + useGainHearts + HeartsMeter", () => {
  it("a mounted meter shows the earned heart before the save finishes", async () => {
    const stub = createHeartsSessionStub(hearts(3));
    const pending = deferred();
    stub.saveHearts.mockImplementation(() => pending.promise);
    vi.mocked(getLocalSession).mockResolvedValue(stub.session);

    let gain: GainHeartsFn = async () => undefined;
    function Harness() {
      const { view } = useHearts();
      gain = useGainHearts();
      return view ? <HeartsMeter current={view.current} max={view.max} /> : null;
    }
    renderWithQueryClient(<Harness />, { client: createTestQueryClient() });
    expect(await screen.findByRole("img", { name: "Hearts: 3 of 5" })).toBeInTheDocument();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = gain();
    });
    expect(await screen.findByRole("img", { name: "Hearts: 4 of 5" })).toBeInTheDocument();
    pending.resolve();
    await done;
  });
});
