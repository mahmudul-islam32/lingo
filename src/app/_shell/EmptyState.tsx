import { Card } from "@/components/ui";

export interface EmptyStateProps {
  message: string;
}

/**
 * Placeholder content for a tab until its real feature lands. The round slot is reserved
 * for a neutral illustration (Lumi, GAM-001) and is decorative.
 */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card as="section" padding="lg" className="flex flex-col items-center gap-4 text-center">
      <div
        aria-hidden="true"
        data-testid="illustration-slot"
        className="size-20 rounded-full border-2 border-dashed border-border-strong"
      />
      <p className="text-fg-muted">{message}</p>
    </Card>
  );
}
