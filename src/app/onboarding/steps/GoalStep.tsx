import type { Ref } from "react";
import type { DailyGoalXp } from "@/contracts";
import { Button } from "@/components/ui";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { GOAL_OPTIONS } from "../goal-options";
import { StepLayout } from "./StepLayout";

export const GOAL_HEADING = "Choose a daily goal";
export const SAVE_ERROR_TEXT = "We couldn't save your choices. Please try again.";

export interface GoalStepProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  selected: DailyGoalXp | null;
  onSelect: (goal: DailyGoalXp) => void;
  onBack: () => void;
  onFinish: () => void;
  saving: boolean;
  saveFailed: boolean;
}

/** Step 3: the goal options from contracts, none preselected. */
export function GoalStep({
  headingId,
  headingRef,
  selected,
  onSelect,
  onBack,
  onFinish,
  saving,
  saveFailed,
}: GoalStepProps) {
  return (
    <StepLayout
      headingId={headingId}
      headingRef={headingRef}
      title={GOAL_HEADING}
      step={3}
      onBack={onBack}
      footer={
        <>
          {saveFailed && (
            <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-danger-fg">
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
