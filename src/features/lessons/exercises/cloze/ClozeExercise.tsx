"use client";

import { useEffect, useRef, useState } from "react";
import { Button, CheckIcon, CrossIcon, OptionCard, VisuallyHidden, cn } from "@/components/ui";
import {
  CONTENT_RULES,
  clozeCorrectSentence,
  countClozeGaps,
  splitClozeSentence,
  type AudioClip,
  type ClozeExercise as ClozeExerciseData,
  type LanguageCode,
} from "@/contracts";
import { getDefaultListenAudio, type ListenAudio } from "../../audio/listen-audio";
import { useAudioPlayback } from "../../audio/use-audio-playback";
import { shuffle } from "../shuffle";
import type { ExerciseComponentProps } from "../types";

export interface ClozeExerciseProps extends ExerciseComponentProps<"cloze"> {
  /** Random source for the option shuffle; inject a fixed one in tests. */
  random?: () => number;
  /** Audio + speech adapter for the sentence clip (tests inject mocks). */
  audio?: ListenAudio;
}

type Gap = ClozeExerciseData["gaps"][number];

/** Content is playable when every marker has a gap and every gap can be answered. */
function isPlayable(exercise: ClozeExerciseData): boolean {
  return (
    exercise.gaps.length > 0 &&
    countClozeGaps(exercise.sentence) === exercise.gaps.length &&
    exercise.gaps.every(
      (gap) =>
        gap.options.length >= CONTENT_RULES.clozeMinOptions &&
        gap.options.some((option) => option.id === gap.correctOptionId),
    )
  );
}

/** "blank 1 of 2" (CTO note: the label every gap is announced with). */
export function gapLabel(gapIndex: number, gapCount: number): string {
  return `blank ${gapIndex + 1} of ${gapCount}`;
}

/**
 * Cloze (fill-the-gap) exercise (LES-015, ADR-009). The learning-language sentence is one
 * paragraph with a button per gap; the options of the active gap are buttons below.
 * Tapping an option fills the active gap and moves to the next empty one; tapping a
 * filled gap clears it and makes it active again. Reports `{ type: "cloze", optionIds }`
 * once every gap is filled, else null; never checks the answer itself.
 */
export function ClozeExercise({
  exercise,
  learningLanguage,
  knownLanguage,
  headingId,
  disabled,
  review,
  onAnswerChange,
  onSkip,
  random = Math.random,
  audio,
}: ClozeExerciseProps) {
  const gapCount = exercise.gaps.length;
  // Shuffle once per mount; the player remounts on every presentation (`key`).
  const [gapOptions] = useState(() => exercise.gaps.map((gap) => shuffle(gap.options, random)));
  const [fills, setFills] = useState<(string | null)[]>(() => exercise.gaps.map(() => null));
  const [activeGap, setActiveGap] = useState(0);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusFirstOption = useRef(false);
  const playable = isPlayable(exercise);

  useEffect(() => {
    if (!playable) onSkip("invalid_content");
    // Report once per mount; `onSkip` identity changes must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playable]);

  // After a gap was filled and the next one became active, its options replace the old
  // ones: move focus to the first new option so keyboard users keep their place.
  useEffect(() => {
    if (!focusFirstOption.current) return;
    focusFirstOption.current = false;
    optionRefs.current[0]?.focus();
  }, [activeGap]);

  if (!playable) return null;

  const locked = disabled || review !== null;
  const wrongGaps = new Set(review?.wrongGapIndexes ?? []);
  const segments = splitClozeSentence(exercise.sentence);
  const options = gapOptions[activeGap] ?? [];
  const optionsLabelId = `${headingId}-options`;

  function report(next: (string | null)[]) {
    const complete = next.every((id): id is string => id !== null);
    onAnswerChange(complete ? { type: "cloze", optionIds: next } : null);
  }

  function selectGap(gapIndex: number) {
    if (locked) return;
    setActiveGap(gapIndex);
    if (fills[gapIndex] === null) return;
    const next = fills.map((id, index) => (index === gapIndex ? null : id));
    setFills(next);
    report(next);
  }

  function chooseOption(optionId: string) {
    if (locked) return;
    if (fills[activeGap] === optionId) return;
    const next = fills.map((id, index) => (index === activeGap ? optionId : id));
    setFills(next);
    report(next);
    // Next empty gap after the active one (wrapping); stay here when all are filled, so
    // the choice can still be changed and focus stays on the pressed option.
    for (let step = 1; step < gapCount; step += 1) {
      const candidate = (activeGap + step) % gapCount;
      if (next[candidate] === null) {
        focusFirstOption.current = true;
        setActiveGap(candidate);
        return;
      }
    }
  }

  function optionText(gapIndex: number, optionId: string | null): string | null {
    if (optionId === null) return null;
    return exercise.gaps[gapIndex]?.options.find((o) => o.id === optionId)?.text ?? null;
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-6">
      <h2
        id={headingId}
        tabIndex={-1}
        lang={knownLanguage}
        className="font-display text-[1.625rem] leading-tight font-bold text-fg break-words focus:outline-none"
      >
        {gapCount > 1 ? "Fill in the blanks" : "Fill in the blank"}
      </h2>

      <div className="flex min-w-0 flex-col gap-2">
        <p
          lang={learningLanguage}
          data-testid="cloze-sentence"
          className="min-w-0 text-xl leading-[3rem] font-medium break-words text-fg hyphens-auto"
        >
          {segments.map((segment, index) =>
            segment.kind === "text" ? (
              <span key={`text-${index}`}>{segment.text}</span>
            ) : (
              <GapButton
                key={`gap-${segment.gapIndex}`}
                gapIndex={segment.gapIndex}
                gapCount={gapCount}
                text={optionText(segment.gapIndex, fills[segment.gapIndex] ?? null)}
                active={!locked && segment.gapIndex === activeGap}
                locked={locked}
                reviewState={
                  review === null ? null : wrongGaps.has(segment.gapIndex) ? "incorrect" : "correct"
                }
                knownLanguage={knownLanguage}
                onSelect={() => selectGap(segment.gapIndex)}
              />
            ),
          )}
        </p>
        <p lang={knownLanguage} className="text-fg-muted min-w-0 break-words">
          {exercise.translation}
        </p>
      </div>

      {review !== null && exercise.audio && (
        <SentenceAudio
          clip={exercise.audio}
          sentence={clozeCorrectSentence(exercise)}
          lang={learningLanguage}
          audio={audio}
        />
      )}

      {review === null && (
        <div className="flex min-w-0 flex-col gap-2">
          <p id={optionsLabelId} lang={knownLanguage} className="eyebrow text-fg-muted">
            Options for {gapLabel(activeGap, gapCount)}
          </p>
          <div
            role="group"
            aria-labelledby={optionsLabelId}
            aria-disabled={locked || undefined}
            className="flex w-full min-w-0 flex-wrap gap-3 pb-1"
          >
            {options.map((option, index) => (
              <OptionButton
                key={`${activeGap}-${option.id}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                option={option}
                pressed={fills[activeGap] === option.id}
                locked={locked}
                lang={learningLanguage}
                onChoose={() => chooseOption(option.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface GapButtonProps {
  gapIndex: number;
  gapCount: number;
  /** Chosen option text, or null while empty. */
  text: string | null;
  active: boolean;
  locked: boolean;
  reviewState: "correct" | "incorrect" | null;
  knownLanguage: LanguageCode;
  onSelect: () => void;
}

/**
 * One gap inside the sentence. Its name is built from its content (not `aria-label`) so
 * the English "blank 1 of 2" and the German word each keep their own `lang`.
 */
function GapButton({
  gapIndex,
  gapCount,
  text,
  active,
  locked,
  reviewState,
  knownLanguage,
  onSelect,
}: GapButtonProps) {
  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      aria-disabled={locked || undefined}
      data-gap={gapIndex}
      data-state={reviewState ?? (active ? "active" : text === null ? "empty" : "filled")}
      onClick={onSelect}
      className={cn(
        "mx-0.5 inline-flex min-h-11 max-w-full min-w-20 items-center justify-center gap-1 rounded-t-lg border-b-4 px-2 align-middle",
        "focus-visible:focus-ring motion-safe:transition-colors motion-safe:duration-150",
        text === null ? "bg-primary-tint" : "bg-surface font-bold",
        active && "border-primary bg-primary-soft",
        !active && reviewState === null && "border-border-strong",
        reviewState === "correct" && "border-success bg-success-soft text-success-fg ring-0",
        reviewState === "incorrect" &&
          "border-danger bg-danger-soft text-danger-fg ring-danger ring-2",
        locked && "cursor-default",
      )}
    >
      <VisuallyHidden lang={knownLanguage}>
        {`${gapLabel(gapIndex, gapCount)}${text === null ? ", empty" : ":"}`}
      </VisuallyHidden>
      {text !== null && (
        <>
          {/* Keeps "blank 1 of 2:" and the word apart in the accessible name. */}{" "}
          <span className="min-w-0 break-words hyphens-auto">{text}</span>
        </>
      )}
      {reviewState === "incorrect" && (
        <span className="flex shrink-0 items-center" data-marker="incorrect">
          <CrossIcon size={18} />
          <VisuallyHidden lang={knownLanguage}>, incorrect</VisuallyHidden>
        </span>
      )}
      {reviewState === "correct" && (
        <span className="flex shrink-0 items-center" data-marker="correct">
          <CheckIcon size={18} />
          <VisuallyHidden lang={knownLanguage}>, correct</VisuallyHidden>
        </span>
      )}
    </button>
  );
}

interface OptionButtonProps {
  ref: React.Ref<HTMLButtonElement>;
  option: Gap["options"][number];
  pressed: boolean;
  locked: boolean;
  lang: LanguageCode;
  onChoose: () => void;
}

/** A cloze option as a v2 OptionCard (white 3D card, indigo ring + check when chosen). */
function OptionButton({ ref, option, pressed, locked, lang, onChoose }: OptionButtonProps) {
  return (
    <OptionCard
      ref={ref}
      lang={lang}
      title={option.text}
      selected={pressed}
      showIndicator={false}
      aria-disabled={locked || undefined}
      onClick={onChoose}
      className={cn(
        "min-h-14 w-auto max-w-full min-w-0 gap-2.5 py-2 break-words hyphens-auto",
        locked && "cursor-default",
      )}
    />
  );
}

/** AC 9: plays the full correct sentence after "Check" (it would give the answer away before). */
function SentenceAudio({
  clip,
  sentence,
  lang,
  audio: injectedAudio,
}: {
  clip: AudioClip;
  sentence: string;
  lang: LanguageCode;
  audio?: ListenAudio;
}) {
  const [audio] = useState(() => injectedAudio ?? getDefaultListenAudio());
  const { status, play } = useAudioPlayback({
    clip,
    transcript: sentence,
    lang,
    audio,
    autoplay: false,
  });
  if (status === "unavailable") {
    return (
      <p role="status" className="text-fg-muted">
        Audio isn&apos;t available right now.
      </p>
    );
  }
  return (
    <div>
      <Button
        variant="secondary"
        size="lg"
        loading={status === "loading"}
        onClick={() => play("normal")}
      >
        Play sentence
      </Button>
    </div>
  );
}
