import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ServiceWorkerRegistration,
  shouldRegisterServiceWorker,
} from "../ServiceWorkerRegistration";

describe("ServiceWorkerRegistration (PLT-002)", () => {
  const register = vi.fn(() => Promise.resolve(undefined));

  beforeEach(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    register.mockClear();
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
    delete window.serwist;
  });

  it("only registers in production builds", () => {
    expect(shouldRegisterServiceWorker("production")).toBe(true);
    expect(shouldRegisterServiceWorker("development")).toBe(false);
    expect(shouldRegisterServiceWorker("test")).toBe(false);
    expect(shouldRegisterServiceWorker(undefined)).toBe(false);
  });

  it("does not register outside production (dev and tests)", () => {
    render(<ServiceWorkerRegistration />);
    expect(register).not.toHaveBeenCalled();
  });

  it("registers /sw.js with scope / in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = render(<ServiceWorkerRegistration />);
    expect(container).toBeEmptyDOMElement();
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/", updateViaCache: "none" });
  });

  it("prefers Serwist's window API when the build injected it", () => {
    vi.stubEnv("NODE_ENV", "production");
    const serwistRegister = vi.fn(() => Promise.resolve(undefined));
    window.serwist = { register: serwistRegister };
    render(<ServiceWorkerRegistration />);
    expect(serwistRegister).toHaveBeenCalledTimes(1);
    expect(register).not.toHaveBeenCalled();
  });
});
