import { onlineManager, useQuery } from "@tanstack/react-query";
import { renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQueryClient, queryKeys } from "..";
import { createQueryWrapper, createTestQueryClient, renderWithQueryClient } from "../testing";

describe("queryKeys", () => {
  it("builds the ADR-005 keys", () => {
    expect(queryKeys.progress("es-en")).toEqual(["progress", "es-en"]);
    expect(queryKeys.hearts()).toEqual(["hearts"]);
    expect(queryKeys.settings()).toEqual(["settings"]);
    expect(queryKeys.content("es-en")).toEqual(["content", "es-en"]);
    expect(queryKeys.lesson("es-en", "l1")).toEqual(["lesson", "es-en", "l1"]);
    expect(queryKeys.profile()).toEqual(["profile"]);
    expect(queryKeys.syncStatus()).toEqual(["sync-status"]);
  });

  it("prefix keys match every course", () => {
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.progress("a"), []);
    client.setQueryData(queryKeys.progress("b"), []);
    expect(client.getQueriesData({ queryKey: queryKeys.progressAll() })).toHaveLength(2);
  });
});

describe("createQueryClient", () => {
  it("applies offline-first defaults", () => {
    const q = createQueryClient().getDefaultOptions().queries;
    expect(q).toMatchObject({
      networkMode: "always",
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    });
  });

  it("merges overrides", () => {
    const q = createQueryClient({ queries: { staleTime: 5 } }).getDefaultOptions().queries;
    expect(q?.staleTime).toBe(5);
    expect(q?.networkMode).toBe("always");
  });
});

describe("offline behaviour", () => {
  afterEach(() => onlineManager.setOnline(true));

  it("runs local queries while offline and does not retry failures", async () => {
    onlineManager.setOnline(false);
    const fail = vi.fn().mockRejectedValue(new Error("quota"));
    const { result } = renderHook(() => useQuery({ queryKey: queryKeys.hearts(), queryFn: fail }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fail).toHaveBeenCalledTimes(1);
  });
});

describe("renderWithQueryClient", () => {
  function Settings() {
    const { data } = useQuery({
      queryKey: queryKeys.settings(),
      queryFn: () => Promise.resolve("loaded"),
    });
    return <p>{data ?? "loading"}</p>;
  }

  it("renders inside a provider and returns the client", async () => {
    const { client } = renderWithQueryClient(<Settings />);
    expect(await screen.findByText("loaded")).toBeInTheDocument();
    expect(client.getQueryData(queryKeys.settings())).toBe("loaded");
  });

  it("accepts a pre-filled client", () => {
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.settings(), "cached");
    renderWithQueryClient(<Settings />, { client });
    expect(screen.getByText("cached")).toBeInTheDocument();
  });
});
