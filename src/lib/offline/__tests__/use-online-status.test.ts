import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useOnlineStatus } from "@/lib/offline";

function stubOnLine(value: boolean) {
  return vi.spyOn(navigator, "onLine", "get").mockReturnValue(value);
}

function goOffline(spy: ReturnType<typeof stubOnLine>) {
  act(() => {
    spy.mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  });
}

function goOnline(spy: ReturnType<typeof stubOnLine>) {
  act(() => {
    spy.mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
  });
}

describe("useOnlineStatus (PLT-006)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts online when the browser is online", () => {
    stubOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("starts offline when the app is opened without a connection", () => {
    stubOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("switches to offline on the `offline` event", () => {
    const spy = stubOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    goOffline(spy);
    expect(result.current).toBe(false);
  });

  it("switches back to online on the `online` event", () => {
    const spy = stubOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    goOnline(spy);
    expect(result.current).toBe(true);
    goOffline(spy);
    goOnline(spy);
    expect(result.current).toBe(true);
  });

  it("removes its listeners on unmount", () => {
    stubOnLine(true);
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(["online", "offline"]));
  });

  it("renders as online on the server", () => {
    stubOnLine(false);
    function Probe() {
      return createElement("span", null, useOnlineStatus() ? "online" : "offline");
    }
    expect(renderToString(createElement(Probe))).toContain("online");
    expect(renderToString(createElement(Probe))).not.toContain("offline");
  });
});
