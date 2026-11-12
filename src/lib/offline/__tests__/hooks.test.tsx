import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ProgressRepository } from "@/contracts";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { ProgressRepositoryProvider, useCompletedLessonIds, useInvalidateProgress } from "../hooks";

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

describe("useCompletedLessonIds (PLT-008)", () => {
  it("is the distinct lesson ids of the course's results", async () => {
    const { wrapper } = setup(["a", "b", "a"]);
    const { result } = renderHook(() => useCompletedLessonIds("c"), { wrapper });
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect([...result.current.ids]).toEqual(["a", "b"]);
  });

  it("an invalidation after a save also refreshes a list that is not mounted (Learn)", async () => {
    const ids = ["a"];
    const { wrapper, progress } = setup(ids);
    const learn = renderHook(() => useCompletedLessonIds("c"), { wrapper });
    await waitFor(() => expect(learn.result.current.status).toBe("ready"));
    learn.unmount(); // the learner opens a lesson

    ids.push("b");
    const writer = renderHook(() => useInvalidateProgress(), { wrapper });
    await act(() => writer.result.current("c"));

    const again = renderHook(() => useCompletedLessonIds("c"), { wrapper });
    await waitFor(() => expect([...again.result.current.ids]).toEqual(["a", "b"]));
    expect(progress.listLessonResults).toHaveBeenCalledTimes(2);
  });
});
