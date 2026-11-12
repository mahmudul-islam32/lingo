import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui";
import { FLASH_TOAST_KEY, queueFlashToast, useFlashToast } from "../flash-toast";

afterEach(() => {
  vi.restoreAllMocks();
  window.sessionStorage.clear();
});

describe("flash toast (PLT-009)", () => {
  it("queues the title in sessionStorage", () => {
    const show = vi.fn();
    queueFlashToast("Hi", show);
    expect(window.sessionStorage.getItem(FLASH_TOAST_KEY)).toBe("Hi");
    expect(show).not.toHaveBeenCalled();
  });

  it("shows the toast right away when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const show = vi.fn();
    queueFlashToast("Hi", show);
    expect(show).toHaveBeenCalledWith("Hi");
  });

  it("useFlashToast consumes the queued title once and ignores storage errors", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );
    window.sessionStorage.setItem(FLASH_TOAST_KEY, "Hi");
    renderHook(() => useFlashToast(), { wrapper });
    expect(window.sessionStorage.getItem(FLASH_TOAST_KEY)).toBeNull();

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => renderHook(() => useFlashToast(), { wrapper })).not.toThrow();
  });
});
