/** Test doubles for exercise components (LES-004..007 are built separately). */
import type { ExerciseComponentMap, ExerciseComponentProps } from "../../exercises/types";

function StubMultipleChoice({
  exercise,
  headingId,
  disabled,
  review,
  presentationKey,
  onAnswerChange,
  onSkip,
}: ExerciseComponentProps<"multiple_choice">) {
  const wrong = exercise.options.find((o) => o.id !== exercise.correctOptionId)!;
  return (
    <div data-testid="stub-exercise" data-presentation={presentationKey}>
      <h2 id={headingId} tabIndex={-1}>
        {exercise.prompt}
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onAnswerChange({ type: "multiple_choice", optionId: exercise.correctOptionId })
        }
      >
        Pick correct
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswerChange({ type: "multiple_choice", optionId: wrong.id })}
      >
        Pick wrong
      </button>
      <button type="button" disabled={disabled} onClick={() => onAnswerChange(null)}>
        Clear
      </button>
      <button type="button" disabled={disabled} onClick={() => onSkip("invalid_content")}>
        Cannot play
      </button>
      {review && <p data-testid="stub-review">{review.outcome}</p>}
    </div>
  );
}

function StubMatchPairs({
  exercise,
  headingId,
  disabled,
  review,
  onComplete,
}: ExerciseComponentProps<"match_pairs">) {
  const matches = exercise.pairs.map((p) => ({ learningPairId: p.id, knownPairId: p.id }));
  return (
    <div data-testid="stub-exercise">
      <h2 id={headingId} tabIndex={-1}>
        Match the pairs
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onComplete({ type: "match_pairs", matches, mismatchCount: 0 })}
      >
        Finish pairs
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onComplete({ type: "match_pairs", matches, mismatchCount: 2 })}
      >
        Finish with mismatches
      </button>
      <p data-testid="stub-review">{review === null ? "no review" : "review"}</p>
    </div>
  );
}

function StubListen({
  exercise,
  headingId,
  disabled,
  onAnswerChange,
  onSkip,
}: ExerciseComponentProps<"listen">) {
  return (
    <div data-testid="stub-exercise">
      <h2 id={headingId} tabIndex={-1}>
        Type what you hear
      </h2>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswerChange({ type: "listen", tiles: ["Hola", "qué", "tal"] })}
      >
        Build answer
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswerChange({ type: "listen", tiles: exercise.tiles.slice(-1) })}
      >
        Build wrong answer
      </button>
      <button type="button" disabled={disabled} onClick={() => onSkip("audio_unavailable")}>
        Audio unavailable
      </button>
    </div>
  );
}

/** No speak stub: `speak` is unsupported (criterion 9). */
export const stubComponents: ExerciseComponentMap = {
  multiple_choice: StubMultipleChoice,
  match_pairs: StubMatchPairs,
  listen: StubListen,
};
