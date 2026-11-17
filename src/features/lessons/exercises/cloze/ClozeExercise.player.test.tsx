/**
 * LES-015 AC 11 (integration): the registered cloze component plays in the real lesson
 * player with the real registry and answer check, keyboard only. Stands in for the e2e
 * test: course content is bundled at build time and the `/lesson/<id>` route only serves
 * the pm's `content/` lessons, none of which has a cloze yet (ADR-009 §5), so a browser
 * test can't load a fixture lesson without a test route outside this feature.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { exerciseComponents } from "../registry";
import { LessonPlayer } from "../../player/LessonPlayer";
import type { LessonSessionSummary } from "../../player/summary";
import { clozeLesson, makeClock, SESSION_ID } from "../../player/testing/fixtures";

function setup() {
  const onFinish = vi.fn<(summary: LessonSessionSummary) => void>();
  render(
    <LessonPlayer
      lesson={clozeLesson}
      learningLanguage="de"
      knownLanguage="en"
      onFinish={onFinish}
      onQuit={vi.fn()}
      now={makeClock()}
      createId={() => SESSION_ID}
      random={() => 0.999}
    />,
  );
  return { onFinish, user: userEvent.setup() };
}

/** Presses Tab (real keyboard navigation) until `target` has focus. */
async function tabTo(user: ReturnType<typeof userEvent.setup>, target: HTMLElement) {
  for (let i = 0; i < 12 && document.activeElement !== target; i += 1) await user.tab();
  expect(target).toHaveFocus();
}

const heading = () => screen.getByRole("heading", { level: 2 });
const checkButton = () => screen.getByRole("button", { name: "Check" });
const option = (name: string) =>
  within(screen.getByRole("group", { name: /^Options for blank/ })).getByRole("button", { name });

describe("cloze in the lesson player (LES-015 AC 3, 5, 6, 11)", () => {
  it("is registered", () => {
    expect(exerciseComponents.cloze).toBeDefined();
  });

  it("plays a lesson with cloze exercises by keyboard; a wrong cloze is re-queued", async () => {
    const { user, onFinish } = setup();
    const progress = screen.getByRole("progressbar", { name: "Lesson progress" });
    expect(progress).toHaveAttribute("aria-valuemax", "3");
    expect(heading()).toHaveTextContent("Fill in the blank");
    expect(heading()).toHaveFocus();
    expect(checkButton()).toBeDisabled();

    // cz-1 wrong: Tab to the gap, on to the options (shuffled), Enter on "dem".
    await user.tab();
    expect(screen.getByRole("button", { name: /^blank 1 of 1/ })).toHaveFocus();
    await tabTo(user, option("dem"));
    await user.keyboard("{Enter}");
    expect(checkButton()).toBeEnabled();
    // Tab reaches Check; Enter on it checks (FIX-001).
    await tabTo(user, checkButton());
    await user.keyboard("{Enter}");
    const panel = screen.getByTestId("feedback-panel");
    expect(panel).toHaveAttribute("data-outcome", "incorrect");
    expect(within(panel).getByText("Ich lege das Buch auf den Tisch.")).toHaveAttribute(
      "lang",
      "de",
    );
    const gap = screen.getByRole("button", { name: /^blank 1 of 1/ });
    expect(gap).toHaveAttribute("data-state", "incorrect");
    expect(gap).toHaveAccessibleName("blank 1 of 1: dem, incorrect");
    // AC 9: the clip of the full sentence can be played after Check.
    expect(screen.getByRole("button", { name: "Play sentence" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Continue" })).toHaveFocus();
    await user.keyboard("{Enter}");

    // cz-2 right: both gaps by Space; focus moves on to the second gap's options.
    expect(heading()).toHaveTextContent("Fill in the blanks");
    await tabTo(user, option("Das"));
    await user.keyboard(" ");
    expect(screen.getByRole("group", { name: "Options for blank 2 of 2" })).toContainElement(
      document.activeElement as HTMLElement,
    );
    await tabTo(user, option("der"));
    await user.keyboard(" ");
    await tabTo(user, checkButton());
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("feedback-panel")).toHaveAttribute("data-outcome", "correct");
    expect(
      within(screen.getByTestId("feedback-panel")).getByText(
        "Das blaue Kleid ist schön, aber der Rock nicht.",
      ),
    ).toHaveAttribute("lang", "de");
    await user.keyboard("{Enter}");

    // mc-de right.
    await user.click(screen.getByRole("radio", { name: "Danke" }));
    await user.click(checkButton());
    await user.keyboard("{Enter}");

    // cz-1 comes back at the end (PD-012) and is answered right.
    expect(heading()).toHaveTextContent("Fill in the blank");
    await user.click(option("den"));
    await user.click(checkButton());
    expect(screen.getByTestId("feedback-panel")).toHaveAttribute("data-outcome", "correct");
    await user.keyboard("{Enter}");

    expect(onFinish).toHaveBeenCalledTimes(1);
    const summary = onFinish.mock.calls[0]![0];
    expect(summary.session.status).toBe("completed");
    expect(summary.session.attempts.map((a) => [a.exerciseId, a.outcome])).toEqual([
      ["cz-1", "incorrect"],
      ["cz-2", "correct"],
      ["mc-de", "correct"],
      ["cz-1", "correct"],
    ]);
  });
});
