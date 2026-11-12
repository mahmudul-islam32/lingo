import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Course, ProgressRepository } from "@/contracts";
import { ContentRepositoryProvider, type BundledContentRepository } from "@/lib/content";
import {
  createFixtureRepository,
  FIXTURE_COURSE,
  FIXTURE_COURSE_ID,
} from "@/lib/content/__fixtures__/fixture-course";
import { ProgressRepositoryProvider } from "@/lib/offline";
import { queryKeys } from "@/lib/query";
import { createQueryWrapper, createTestQueryClient } from "@/lib/query/testing";
import {
  COURSE_ERROR_MESSAGE,
  EMPTY_UNIT_MESSAGE,
  LOADING_LESSONS_LABEL,
  LessonList,
} from "../LessonList";

function progressWith(lessonIds: string[] | Error): ProgressRepository {
  return {
    listLessonResults: vi.fn(async () => {
      if (lessonIds instanceof Error) throw lessonIds;
      return lessonIds.map((lessonId) => ({ lessonId })) as never;
    }),
  } as unknown as ProgressRepository;
}

function renderList({
  repository = createFixtureRepository(),
  progress = progressWith([]),
}: { repository?: BundledContentRepository; progress?: ProgressRepository } = {}) {
  const client = createTestQueryClient();
  const QueryWrapper = createQueryWrapper(client);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryWrapper>
      <ContentRepositoryProvider repository={repository}>
        <ProgressRepositoryProvider load={async () => progress}>
          {children}
        </ProgressRepositoryProvider>
      </ContentRepositoryProvider>
    </QueryWrapper>
  );
  return { client, ...render(<LessonList courseId={FIXTURE_COURSE_ID} />, { wrapper }) };
}

describe("LessonList (PLT-007)", () => {
  it("shows the unit header and an ordered list of lesson links", async () => {
    renderList();
    expect(await screen.findByRole("heading", { level: 2, name: "Fixture Unit" })).toBeVisible();
    expect(screen.getByText("2 lessons")).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    const first = within(items[0]!).getByRole("link", { name: "Lesson 1: Greetings" });
    expect(first).toHaveAttribute("href", "/lesson/fx-l1");
    expect(within(first.closest("li")!).getByText("Start")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lesson 2: Numbers" })).toHaveAttribute(
      "href",
      "/lesson/fx-l2",
    );
  });

  it("lesson links are reachable with the keyboard", async () => {
    renderList();
    await screen.findByRole("list");
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Lesson 1: Greetings" })).toHaveFocus();
  });

  it("shows a loading status first", () => {
    renderList();
    expect(screen.getByRole("status", { name: LOADING_LESSONS_LABEL })).toBeInTheDocument();
  });

  it("shows the error state with a working Try again", async () => {
    const good = createFixtureRepository();
    const getCourse = vi
      .fn<BundledContentRepository["getCourse"]>()
      .mockRejectedValueOnce(new Error("invalid"))
      .mockImplementation((id) => good.getCourse(id));
    renderList({ repository: { ...good, getCourse } });
    expect(await screen.findByText(COURSE_ERROR_MESSAGE)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("link", { name: "Lesson 1: Greetings" })).toBeInTheDocument();
  });

  it("shows the empty state for a unit without lessons", async () => {
    const empty: Course = {
      ...FIXTURE_COURSE,
      units: [{ ...FIXTURE_COURSE.units[0]!, lessons: [] }],
    };
    const repo = createFixtureRepository();
    renderList({ repository: { ...repo, getCourse: async () => empty } });
    expect(await screen.findByText(EMPTY_UNIT_MESSAGE)).toBeInTheDocument();
    expect(document.querySelector('svg[data-pose="idle"]')).not.toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("LessonList completed labels (PLT-008)", () => {
  it("marks lessons with a saved result as Completed, with Start again", async () => {
    renderList({ progress: progressWith(["fx-l2"]) });
    const done = await screen.findByRole("link", { name: "Lesson 2: Numbers" });
    expect(done).toHaveAccessibleDescription("Completed");
    expect(within(done.closest("li")!).getByText("Start again")).toBeInTheDocument();
    const todo = screen.getByRole("link", { name: "Lesson 1: Greetings" });
    expect(within(todo.closest("li")!).queryByText("Completed")).toBeNull();
    expect(within(todo.closest("li")!).getByText("Start")).toBeInTheDocument();
  });

  it('refreshes the labels when ["progress", courseId] is invalidated, without a reload', async () => {
    const ids: string[] = [];
    const progress = {
      listLessonResults: vi.fn(async () => ids.map((lessonId) => ({ lessonId }))),
    } as unknown as ProgressRepository;
    const { client } = renderList({ progress });
    const first = await screen.findByRole("link", { name: "Lesson 1: Greetings" });
    expect(within(first.closest("li")!).queryByText("Completed")).toBeNull();
    ids.push("fx-l1");
    // What the lesson route does after ResultsScreen saved the result.
    await act(() => client.invalidateQueries({ queryKey: queryKeys.progress(FIXTURE_COURSE_ID) }));
    expect(
      await within(
        screen.getByRole("link", { name: "Lesson 1: Greetings" }).closest("li")!,
      ).findByText("Completed"),
    ).toBeInTheDocument();
  });

  it("still lists every lesson with Start when completed ids can't be read", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderList({ progress: progressWith(new Error("storage")) });
    const links = await screen.findAllByRole("link");
    expect(links).toHaveLength(2);
    expect(screen.queryByText("Completed")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
