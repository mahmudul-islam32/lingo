import { Button, Card, Lumi } from "@/components/ui";
import { COURSE_ERROR_TEXT, RETRY_TEXT } from "./copy";

export interface SkillPathErrorProps {
  onRetry: () => void;
}

/** Course couldn't load (GAM-008 AC14, UX notes: Lumi ember sm + "Try again"). */
export function SkillPathError({ onRetry }: SkillPathErrorProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      {/* GAM-012 UX notes: the error state as a Card with "Try again". */}
      <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
        <Lumi pose="ember" size="sm" />
        <p role="alert" className="font-display text-lg font-bold text-fg">
          {COURSE_ERROR_TEXT}
        </p>
        <Button variant="primary" size="lg" onClick={onRetry}>
          {RETRY_TEXT}
        </Button>
      </Card>
    </div>
  );
}
