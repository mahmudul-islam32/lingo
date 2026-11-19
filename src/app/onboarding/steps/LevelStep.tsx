import type { Ref } from "react";
import type { CefrLevel } from "@/contracts";
import { Button, Lumi } from "@/components/ui";
import type { StartLevelOption } from "@/features/profile";
import { RadioCardGroup } from "../../_shell/RadioCardGroup";
import { StepLayout } from "./StepLayout";

export const LEVEL_HEADING = "Where do you want to start?";
export const LEVEL_EYEBROW = "I want to start at";

export interface LevelStepProps {
  headingId: string;
  headingRef: Ref<HTMLHeadingElement>;
  step: number;
  total: number;
  options: readonly StartLevelOption[];
  selected: CefrLevel;
  onSelect: (level: CefrLevel) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Start level step (PLT-025 AC 1–6): one OptionCard per course level with content (same
 * style as the course step, PLT-026), the first one preselected by the flow, so
 * "Continue" is enabled at once.
 */
export function LevelStep({
  headingId,
  headingRef,
  step,
  total,
  options,
  selected,
  onSelect,
  onBack,
  onContinue,
}: LevelStepProps) {
  return (
    <StepLayout
      headingId={headingId}
      headingRef={headingRef}
      title={LEVEL_HEADING}
      step={step}
      total={total}
      onBack={onBack}
      eyebrow={LEVEL_EYEBROW}
      hero={<Lumi pose="idle" size="sm" />}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
          Continue
        </Button>
      }
    >
      <RadioCardGroup
        labelledBy={headingId}
        options={options.map((option) => ({
          value: option.level,
          label: option.label,
          description: option.description,
        }))}
        value={selected}
        onChange={onSelect}
      />
    </StepLayout>
  );
}
