import { Button, Lumi } from "@/components/ui";
import { COURSE_ERROR_TEXT, RETRY_TEXT } from "./copy";

export interface SkillPathErrorProps {
  onRetry: () => void;
}

/** Course couldn't load (GAM-008 AC14, UX notes: Lumi ember sm + "Try again"). */
export function SkillPathError({ onRetry }: SkillPathErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-10 text-center">
      <Lumi pose="ember" size="sm" />
      <p role="alert" className="text-lg font-bold text-fg">
        {COURSE_ERROR_TEXT}
      </p>
      <Button variant="primary" size="lg" onClick={onRetry}>
        {RETRY_TEXT}
      </Button>
    </div>
  );
}
