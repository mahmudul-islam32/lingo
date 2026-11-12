import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ProgressRepository } from "@/contracts";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { useQuery } from "@tanstack/react-query";
import {
  ProgressRepositoryProvider,
  progressQueryOptions,
  useInvalidateProgress,
  useProgressRepositoryLoader,
} from "../hooks";

/** `["progress", courseId]` as a consumer (e.g. GAM-003, the lesson route) reads it. */
function useLessonIds(courseId: string): string[] | undefined {
  const query = useQuery(progressQueryOptions(useProgressRepositoryLoader(), courseId));
  return query.data?.map((r) => r.lessonId);
}

function setup(lessonIds: string[]) {
  const progress = {
    listLessonResults: vi.fn(async () => lessonIds.map((lessonId) => ({ lessonId }))),
  } as unknown as ProgressRepository;
  const QueryWrapper = createQueryWrapper(createTestQueryClient());
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryWrapper>
      <ProgressRepositoryProvider load={async () => progress}>
        {children}
      </ProgressRepositoryProvider>
    </QueryWrapper>
  );
  return { progress, wrapper };
}

describe("progressQueryOptions + useInvalidateProgress (PLT-008)", () => {
  it("reads the course's raw results through the injected repository", async () => {
    const { wrapper, progress } = setup(["a", "b"]);
    const { result } = renderHook(() => useLessonIds("c"), { wrapper });
    await waitFor(() => expect(result.current).toEqual(["a", "b"]));
    expect(progress.listLessonResults).toHaveBeenCalledWith("c");
  });

  it("an invalidation after a save also refreshes a query that is not mounted (Learn)", async () => {
    const ids = ["a"];
    const { wrapper, progress } = setup(ids);
    const learn = renderHook(() => useLessonIds("c"), { wrapper });
    await waitFor(() => expect(learn.result.current).toEqual(["a"]));
    learn.unmount(); // the learner opens a lesson

    ids.push("b");
    const writer = renderHook(() => useInvalidateProgress(), { wrapper });
    await act(() => writer.result.current("c"));

    const again = renderHook(() => useLessonIds("c"), { wrapper });
    await waitFor(() => expect(again.result.current).toEqual(["a", "b"]));
    expect(progress.listLessonResults).toHaveBeenCalledTimes(2);
  });
});
