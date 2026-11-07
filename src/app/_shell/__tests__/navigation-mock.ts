import { vi } from "vitest";

/** Shared mutable pathname for the `next/navigation` mock used by shell tests. */
export const navigationState = { pathname: "/" as string | null };

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));
