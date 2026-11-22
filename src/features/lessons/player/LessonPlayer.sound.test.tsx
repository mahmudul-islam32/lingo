import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnswerCheckResult } from "@/contracts";
import type { SoundEffect, SoundEffects } from "../sound/sound-effects";
import { checkSound, LessonPlayer, type LessonPlayerProps } from "./LessonPlayer";
import { makeClock, mcOnlyLesson, SESSION_ID } from "./testing/fixtures";
import { stubComponents } from "./testing/stubs";

function setup(props: Partial<LessonPlayerProps> = {}) {
  const play = vi.fn<(effect: SoundEffect) => void>();
  const sounds: SoundEffects = { play };
  const onFinish = vi.fn();
  const user = userEvent.setup();
  render(
    <LessonPlayer
      lesson={mcOnlyLesson}
      learningLanguage="es"
      knownLanguage="en"
      onFinish={onFinish}
      onQuit={vi.fn()}
      components={stubComponents}
      now={makeClock()}
      createId={() => SESSION_ID}
      random={() => 0}
      sounds={sounds}
      soundEffectsEnabled
      {...props}
    />,
  );
  return { user, play, onFinish };
}

const check = () => screen.getByRole("button", { name: "Check" });
const continueButton = () => screen.getByRole("button", { name: "Continue" });

describe("LessonPlayer sound effects (LES-012)", () => {
  it("plays the correct chime on a correct Check", async () => {
    const { user, play } = setup();
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    expect(play).not.toHaveBeenCalled();
    await user.click(check());
    expect(play).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenLastCalledWith("correct");
  });

  it("plays the incorrect tone on a wrong Check", async () => {
    const { user, play } = setup();
    await user.click(screen.getByRole("button", { name: "Pick wrong" }));
    await user.click(check());
    expect(play).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenLastCalledWith("incorrect");
  });

  it("plays the complete fanfare once when the lesson ends, not on Continue mid-lesson", async () => {
    const { user, play, onFinish } = setup();
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    await user.click(check());
    await user.click(continueButton());
    expect(play.mock.calls.map(([effect]) => effect)).toEqual(["correct"]);

    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    await user.click(check());
    await user.click(continueButton());
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(play.mock.calls.map(([effect]) => effect)).toEqual(["correct", "correct", "complete"]);
  });

  it("is silent when sound effects are off (and by default)", async () => {
    const { user, play } = setup({ soundEffectsEnabled: false });
    await user.click(screen.getByRole("button", { name: "Pick wrong" }));
    await user.click(check());
    await user.click(continueButton());
    await user.click(screen.getByRole("button", { name: "Pick correct" }));
    await user.click(check());
    expect(play).not.toHaveBeenCalled();
  });
});

describe("checkSound", () => {
  const result = (outcome: AnswerCheckResult["outcome"]) =>
    ({ outcome }) as unknown as AnswerCheckResult;

  it("maps graded outcomes to correct / incorrect", () => {
    expect(checkSound("multiple_choice", result("correct"))).toBe("correct");
    expect(checkSound("multiple_choice", result("incorrect"))).toBe("incorrect");
    expect(checkSound("word_bank_translate", result("incorrect"))).toBe("incorrect");
  });

  it("is silent for skips and ungraded explain / task cards", () => {
    expect(checkSound("multiple_choice", result("skipped"))).toBeNull();
    expect(checkSound("explain", result("correct"))).toBeNull();
    expect(checkSound("task", result("correct"))).toBeNull();
  });

  it("match pairs always chime: the panel always shows them as correct", () => {
    expect(checkSound("match_pairs", result("incorrect"))).toBe("correct");
  });
});
