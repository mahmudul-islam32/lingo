import type { Ref } from "react";
import type { DailyGoalXp } from "@/contracts";
import { Button } from "@/components/ui";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { GOAL_OPTIONS } from "../goal-options";
import { StepLayout } from "./StepLayout";

export const GOAL_HEADING = "Choose a daily goal";
export const SAVE_ERROR_TEXT = "We couldn't save your choices. Please try again.";
export const GOAL_EYEBROW = "My daily goal";

export interface GoalStepProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  selected: DailyGoalXp | null;
  onSelect: (goal: DailyGoalXp) => void;
  onBack: () => void;
  /** Number of steps in this run (PLT-025: 4 with the start level step). */
  total: number;
  onFinish: () => void;
  saving: boolean;
  saveFailed: boolean;
}

/** Last step: the goal options from contracts as OptionCards (PLT-026), none preselected. */
export function GoalStep({
  headingId,
  headingRef,
  selected,
  onSelect,
  onBack,
  total,
  onFinish,
  saving,
  saveFailed,
}: GoalStepProps) {
  return (
    <StepLayout
      headingId={headingId}
      headingRef={headingRef}
      title={GOAL_HEADING}
      step={total}
      total={total}
      onBack={onBack}
      eyebrow={GOAL_EYEBROW}
      footer={
        <>
          {saveFailed && (
            <p
              role="alert"
              className="rounded-control border-2 border-danger-border bg-danger-tint px-3 py-2 font-medium text-danger-fg"
            >
              {SAVE_ERROR_TEXT}
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={selected === null}
            loading={saving}
            loadingLabel="Saving"
            onClick={onFinish}
          >
            Start learning
          </Button>
        </>
      }
    >
      <RadioCardGroup
        labelledBy={headingId}
        options={GOAL_OPTIONS.map((option) => ({
          value: option.xp,
          label: option.label,
          trailing: `${option.xp} XP`,
          description: option.hint,
        }))}
        value={selected}
        onChange={onSelect}
      />
    </StepLayout>
  );
}
