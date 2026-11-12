import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ContentRepositoryProvider } from "@/lib/content";
import {
  createFixtureRepository,
  FIXTURE_COURSE_ID,
} from "@/lib/content/__fixtures__/fixture-course";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import { usePreloadCourseLessons } from "./use-preload-course-lessons";

describe("usePreloadCourseLessons (PLT-007 criterion 7, kept by PLT-009)", () => {
  it("loads every lesson of the course into the cache in the background", async () => {
    const fixture = createFixtureRepository();
    const repository = { ...fixture, getLesson: vi.fn(fixture.getLesson) };
    const client = createTestQueryClient();
    const QueryWrapper = createQueryWrapper(client);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryWrapper>
        <ContentRepositoryProvider repository={repository}>{children}</ContentRepositoryProvider>
      </QueryWrapper>
    );

    renderHook(() => usePreloadCourseLessons(FIXTURE_COURSE_ID), { wrapper });

    await waitFor(() => expect(repository.getLesson).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(client.getQueryData(queryKeys.lesson(FIXTURE_COURSE_ID, "fx-l2"))).toMatchObject({
        id: "fx-l2",
      }),
    );
    expect(client.getQueryData(queryKeys.lesson(FIXTURE_COURSE_ID, "fx-l1"))).toMatchObject({
      id: "fx-l1",
    });
  });
});
