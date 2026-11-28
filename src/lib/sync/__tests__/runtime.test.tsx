import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SyncStatus } from "@/contracts";
import { onSyncQueueChanged } from "@/lib/offline";
import type { LocalSyncEngine, SyncSnapshot } from "../engine";
import { startSyncTriggers, useSyncStatus } from "../runtime";

vi.mock("@/lib/offline", async (orig) => {
  const actual = await orig<typeof import("@/lib/offline")>();
  const listeners = new Set<() => void>();
  return {
    ...actual,
    onSyncQueueChanged: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    __emitQueue: () => listeners.forEach((l) => l()),
  };
});

function fakeEngine() {
  let status: SyncStatus = "idle";
  const statusListeners = new Set<(s: SyncStatus) => void>();
  const snapListeners = new Set<(s: SyncSnapshot) => void>();
  let snap: SyncSnapshot = {
    status: "idle",
    pendingResults: 0,
    pendingTotal: 0,
    rejected: 0,
    lastPushAt: null,
    paused: null,
  };
  const engine: LocalSyncEngine & { set(p: Partial<SyncSnapshot>): void } = {
    status: () => status,
    subscribe: (l) => {
      statusListeners.add(l);
      return () => statusListeners.delete(l);
    },
    snapshot: () => snap,
    subscribeSnapshot: (l) => {
      snapListeners.add(l);
      return () => snapListeners.delete(l);
    },
    syncNow: vi.fn(async () => ({ acceptedIds: [], duplicateIds: [], rejected: [] })),
    pending: vi.fn(async () => []),
    refreshCounts: vi.fn(async () => {}),
    resume: vi.fn(),
    setOffline: vi.fn(),
    set(p) {
      snap = { ...snap, ...p };
      status = snap.status;
      snapListeners.forEach((l) => l(snap));
      statusListeners.forEach((l) => l(status));
    },
  };
  return engine;
}

const emitQueue = async () =>
  ((await import("@/lib/offline")) as unknown as { __emitQueue: () => void }).__emitQueue();

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("sync triggers (PLT-014 criterion 2)", () => {
  it("syncs at start, 2 s after the last enqueue, every 60 s while visible, and online", async () => {
    expect(onSyncQueueChanged).toBeDefined();
    const engine = fakeEngine();
    const stop = startSyncTriggers(engine);
    expect(engine.syncNow).toHaveBeenCalledTimes(1);

    await emitQueue();
    await vi.advanceTimersByTimeAsync(1500);
    await emitQueue();
    await vi.advanceTimersByTimeAsync(1999);
    expect(engine.syncNow).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(engine.syncNow).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(engine.syncNow).toHaveBeenCalledTimes(3);
    const hidden = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(engine.syncNow).toHaveBeenCalledTimes(3);
    hidden.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(engine.syncNow).toHaveBeenCalledTimes(4);

    window.dispatchEvent(new Event("offline"));
    expect(engine.setOffline).toHaveBeenCalledWith(true);
    window.dispatchEvent(new Event("online"));
    expect(engine.setOffline).toHaveBeenCalledWith(false);
    expect(engine.syncNow).toHaveBeenCalledTimes(5);

    stop();
    await emitQueue();
    await vi.advanceTimersByTimeAsync(120_000);
    expect(engine.syncNow).toHaveBeenCalledTimes(5);
    hidden.mockRestore();
  });

  it("the engine's own queue writes during a round don't schedule another", async () => {
    const engine = fakeEngine();
    const stop = startSyncTriggers(engine);
    engine.set({ status: "syncing" });
    await emitQueue();
    engine.set({ status: "idle" });
    await vi.advanceTimersByTimeAsync(5_000);
    expect(engine.syncNow).toHaveBeenCalledTimes(1);
    stop();
  });
});

function Probe({ engine }: { engine: LocalSyncEngine | null }) {
  const view = useSyncStatus(engine);
  return (
    <p data-testid="probe">
      {view.status} {view.pendingCount} {view.lastPushAt ?? "never"}
    </p>
  );
}

describe("useSyncStatus (criterion 9)", () => {
  it("follows the engine snapshot", () => {
    const engine = fakeEngine();
    render(<Probe engine={engine} />);
    expect(screen.getByTestId("probe")).toHaveTextContent("idle 0 never");
    act(() => engine.set({ status: "offline", pendingResults: 3 }));
    expect(screen.getByTestId("probe")).toHaveTextContent("offline 3 never");
    act(() =>
      engine.set({ status: "idle", pendingResults: 0, lastPushAt: "2026-11-28T10:00:00.000Z" }),
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("idle 0 2026-11-28T10:00:00.000Z");
  });

  it("is idle with nothing pending when accounts are disabled", () => {
    render(<Probe engine={null} />);
    expect(screen.getByTestId("probe")).toHaveTextContent("idle 0 never");
  });
});
