import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_CONFIG, HeartsStateSchema, HeartsViewSchema, type HeartsState } from "@/contracts";
import { createFullHearts, loseHearts, refillHearts, viewHearts } from "../hearts";

const HOUR = 60 * 60 * 1000;
const INTERVAL = GAME_CONFIG.heartRefillIntervalMs; // 4 h
const T0 = new Date("2026-11-07T10:00:00.000Z");
const at = (ms: number) => new Date(T0.getTime() + ms);
const iso = (ms: number) => at(ms).toISOString();

const state = (current: number, startedOffsetMs: number | null, updatedOffsetMs = 0): HeartsState =>
  HeartsStateSchema.parse({
    current,
    refillStartedAt: startedOffsetMs === null ? null : iso(startedOffsetMs),
    updatedAt: iso(updatedOffsetMs),
  });

beforeEach(() => {
  // Rules must use the `now` argument only; a far-away system clock proves it.
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2040-01-01T00:00:00.000Z"));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("createFullHearts", () => {
  it("starts with max hearts and no clock", () => {
    const full = createFullHearts(T0);
    expect(full).toEqual({ current: 5, refillStartedAt: null, updatedAt: T0.toISOString() });
    expect(() => HeartsStateSchema.parse(full)).not.toThrow();
    expect(createFullHearts(T0, { maxHearts: 3, heartRefillIntervalMs: HOUR }).current).toBe(3);
  });
});

describe("refillHearts", () => {
  it("full hearts stay full and unchanged", () => {
    const full = state(5, null);
    expect(refillHearts(full, at(100 * HOUR))).toBe(full);
  });

  it("nothing refills before one full interval", () => {
    const s = state(3, 0);
    expect(refillHearts(s, at(0))).toBe(s);
    expect(refillHearts(s, at(INTERVAL - 1))).toBe(s);
  });

  it("one heart exactly at the interval, clock moves forward by one interval", () => {
    expect(refillHearts(state(3, 0), at(INTERVAL))).toEqual(state(4, INTERVAL));
  });

  it("keeps partial progress toward the next heart", () => {
    // 9 h after start: 2 hearts, the clock is now at 8 h (1 h toward the next).
    expect(refillHearts(state(1, 0), at(9 * HOUR))).toEqual(state(3, 8 * HOUR));
  });

  it("caps at max and stops the clock", () => {
    expect(refillHearts(state(3, 0), at(2 * INTERVAL))).toEqual(state(5, null));
    expect(refillHearts(state(0, 0), at(100 * INTERVAL))).toEqual(state(5, null));
    expect(refillHearts(state(4, 0), at(INTERVAL + 1))).toEqual(state(5, null));
  });

  it("from 0 hearts refills to full after 5 intervals (20 h)", () => {
    const empty = state(0, 0);
    expect(refillHearts(empty, at(5 * INTERVAL - 1))).toEqual(state(4, 4 * INTERVAL));
    expect(refillHearts(empty, at(5 * INTERVAL))).toEqual(state(5, null));
  });

  it("is idempotent and composable: refilling twice equals refilling once", () => {
    const s = state(0, 0);
    for (const t of [1, INTERVAL, 6 * HOUR, 13 * HOUR, 19 * HOUR, 30 * HOUR]) {
      const once = refillHearts(s, at(t));
      expect(refillHearts(once, at(t))).toEqual(once);
      expect(refillHearts(refillHearts(s, at(t / 2)), at(t))).toEqual(once);
    }
  });

  it("does not change updatedAt (a refill is derived, not a write)", () => {
    expect(refillHearts(state(2, 0, 0), at(INTERVAL)).updatedAt).toBe(iso(0));
  });

  it("clock moved back before refillStartedAt: nothing refills", () => {
    const s = state(2, 0);
    expect(refillHearts(s, at(-3 * INTERVAL))).toBe(s);
  });

  it("repairs a non-full state without a clock by starting the clock at now", () => {
    const broken = { current: 2, refillStartedAt: null, updatedAt: iso(0) };
    expect(refillHearts(broken, at(HOUR))).toEqual({
      current: 2,
      refillStartedAt: iso(HOUR),
      updatedAt: iso(0),
    });
  });

  it("normalises a full state that still has a clock or exceeds max", () => {
    const fullWithClock = { current: 5, refillStartedAt: iso(0), updatedAt: iso(0) };
    expect(refillHearts(fullWithClock, at(HOUR))).toEqual(state(5, null));
    expect(refillHearts({ current: 7, refillStartedAt: null, updatedAt: iso(0) }, at(0))).toEqual(
      state(5, null),
    );
  });

  it("does not depend on DST or the local timezone (instants only)", () => {
    // US fall back happens at 2026-11-01T06:00Z; refill is still exactly 4 h of real time.
    const s = HeartsStateSchema.parse({
      current: 3,
      refillStartedAt: "2026-11-01T04:00:00.000Z",
      updatedAt: "2026-11-01T04:00:00.000Z",
    });
    expect(refillHearts(s, new Date("2026-11-01T07:59:59.999Z")).current).toBe(3);
    expect(refillHearts(s, new Date("2026-11-01T08:00:00.000Z"))).toMatchObject({
      current: 4,
      refillStartedAt: "2026-11-01T08:00:00.000Z",
    });
  });

  it("uses a custom config", () => {
    const config = { maxHearts: 3, heartRefillIntervalMs: HOUR };
    const s = { current: 1, refillStartedAt: iso(0), updatedAt: iso(0) };
    expect(refillHearts(s, at(HOUR), config)).toEqual({
      current: 2,
      refillStartedAt: iso(HOUR),
      updatedAt: iso(0),
    });
    expect(refillHearts(s, at(2 * HOUR), config)).toEqual({
      current: 3,
      refillStartedAt: null,
      updatedAt: iso(0),
    });
  });

  it("always returns a contract-valid state", () => {
    for (let current = 0; current <= 5; current++) {
      const s = state(current, current === 5 ? null : 0);
      for (const t of [-HOUR, 0, 1, INTERVAL, 3 * INTERVAL + 7, 50 * HOUR]) {
        expect(() => HeartsStateSchema.parse(refillHearts(s, at(t)))).not.toThrow();
      }
    }
  });
});

describe("loseHearts", () => {
  it("losing from full starts the refill clock at now", () => {
    expect(loseHearts(state(5, null), 1, at(HOUR))).toEqual(state(4, HOUR, HOUR));
  });

  it("losing while not full keeps the running clock", () => {
    expect(loseHearts(state(4, 0), 1, at(HOUR))).toEqual(state(3, 0, HOUR));
  });

  it("subtracts the configured cost per mistake", () => {
    const s = state(5, null);
    expect(loseHearts(s, GAME_CONFIG.heartsLostPerMistake, at(0)).current).toBe(
      5 - GAME_CONFIG.heartsLostPerMistake,
    );
  });

  it("clamps at 0", () => {
    expect(loseHearts(state(1, 0), 1, at(HOUR))).toEqual(state(0, 0, HOUR));
    expect(loseHearts(state(2, 0), 5, at(HOUR))).toEqual(state(0, 0, HOUR));
  });

  it("at 0 hearts nothing changes (no write)", () => {
    const empty = state(0, 0, 0);
    expect(loseHearts(empty, 1, at(HOUR))).toBe(empty);
  });

  it("cost 0 changes nothing besides the lazy refill", () => {
    const s = state(3, 0, 0);
    expect(loseHearts(s, 0, at(HOUR))).toBe(s);
    expect(loseHearts(s, 0, at(INTERVAL))).toEqual(state(4, INTERVAL, 0));
  });

  it("applies the pending refill first: silently refilled to full -> fresh clock", () => {
    // 4 hearts, clock at 0; at 5 h hearts are full again, so a loss starts a new clock at 5 h.
    expect(loseHearts(state(4, 0), 1, at(5 * HOUR))).toEqual(state(4, 5 * HOUR, 5 * HOUR));
  });

  it("applies the pending refill first: partial refill keeps the advanced clock", () => {
    // 2 hearts, clock at 0; at 5 h one heart came back (3, clock at 4 h); lose 1 -> 2.
    expect(loseHearts(state(2, 0), 1, at(5 * HOUR))).toEqual(state(2, 4 * HOUR, 5 * HOUR));
  });

  it("a whole lesson of mistakes: 5 wrong answers in a row empties hearts", () => {
    let s = state(5, null);
    for (let i = 0; i < 5; i++) s = loseHearts(s, 1, at(i * 1000));
    expect(s).toEqual(state(0, 0, 4000));
    expect(viewHearts(s, at(4000)).canStartLesson).toBe(false);
  });

  it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid cost %d", (cost) => {
    expect(() => loseHearts(state(5, null), cost, at(0))).toThrow(RangeError);
  });

  it("does not mutate the input", () => {
    const s = Object.freeze(state(5, null));
    loseHearts(s, 1, at(0));
    expect(s).toEqual(state(5, null));
  });

  it("uses a custom config", () => {
    const config = { maxHearts: 3, heartRefillIntervalMs: HOUR };
    const full = createFullHearts(at(0), config);
    expect(loseHearts(full, 1, at(0), config)).toEqual({
      current: 2,
      refillStartedAt: iso(0),
      updatedAt: iso(0),
    });
  });
});

describe("viewHearts", () => {
  function view(...args: Parameters<typeof viewHearts>) {
    const v = viewHearts(...args);
    expect(() => HeartsViewSchema.parse(v)).not.toThrow();
    return v;
  }

  it("full hearts: no refill times, can start", () => {
    expect(view(state(5, null), at(0))).toEqual({
      current: 5,
      max: 5,
      nextRefillAt: null,
      fullAt: null,
      canStartLesson: true,
    });
  });

  it("shows next refill and full-at times", () => {
    expect(view(state(3, 0), at(HOUR))).toEqual({
      current: 3,
      max: 5,
      nextRefillAt: iso(INTERVAL),
      fullAt: iso(2 * INTERVAL),
      canStartLesson: true,
    });
  });

  it("0 hearts: cannot start, next heart in 4 h, full in 20 h", () => {
    expect(view(state(0, 0), at(0))).toEqual({
      current: 0,
      max: 5,
      nextRefillAt: iso(INTERVAL),
      fullAt: iso(5 * INTERVAL),
      canStartLesson: false,
    });
  });

  it("applies the lazy refill: 0 hearts becomes playable exactly at the interval", () => {
    const empty = state(0, 0);
    expect(view(empty, at(INTERVAL - 1)).canStartLesson).toBe(false);
    expect(view(empty, at(INTERVAL))).toEqual({
      current: 1,
      max: 5,
      nextRefillAt: iso(2 * INTERVAL),
      fullAt: iso(5 * INTERVAL),
      canStartLesson: true,
    });
  });

  it("fullAt does not move as hearts refill", () => {
    const empty = state(0, 0);
    for (const t of [0, INTERVAL, 2 * INTERVAL + HOUR, 4 * INTERVAL]) {
      expect(view(empty, at(t)).fullAt).toBe(iso(5 * INTERVAL));
    }
    expect(view(empty, at(5 * INTERVAL))).toMatchObject({
      current: 5,
      fullAt: null,
      nextRefillAt: null,
    });
  });

  it("uses a custom config", () => {
    const config = { maxHearts: 3, heartRefillIntervalMs: HOUR };
    expect(
      viewHearts({ current: 1, refillStartedAt: iso(0), updatedAt: iso(0) }, at(0), config),
    ).toEqual({
      current: 1,
      max: 3,
      nextRefillAt: iso(HOUR),
      fullAt: iso(2 * HOUR),
      canStartLesson: true,
    });
  });
});
