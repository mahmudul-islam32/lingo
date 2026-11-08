import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { LOCAL_QUERY_DEFAULTS } from "./client";

/**
 * Test-only helpers for components and hooks that use TanStack Query. Import from
 * `@/lib/query/testing` in `*.test.tsx` files only (it pulls in Testing Library).
 */

/**
 * A fresh QueryClient per test: app defaults (ADR-005) plus `gcTime: Infinity` so no
 * garbage-collection timers outlive the test.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { ...LOCAL_QUERY_DEFAULTS.queries, gcTime: Infinity },
      mutations: { ...LOCAL_QUERY_DEFAULTS.mutations, gcTime: Infinity },
    },
  });
}

/** Wrapper for `renderHook(..., { wrapper: createQueryWrapper(client) })`. */
export function createQueryWrapper(client: QueryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

export interface RenderWithQueryClientOptions extends Omit<RenderOptions, "wrapper"> {
  /** Use a specific client (e.g. one pre-filled with `setQueryData`). Default: a new one. */
  client?: QueryClient;
}

export type RenderWithQueryClientResult = RenderResult & { client: QueryClient };

/** RTL `render` inside a `QueryClientProvider`; returns the client for assertions. */
export function renderWithQueryClient(
  ui: ReactElement,
  { client = createTestQueryClient(), ...options }: RenderWithQueryClientOptions = {},
): RenderWithQueryClientResult {
  const result = render(ui, { ...options, wrapper: createQueryWrapper(client) });
  return { ...result, client };
}
