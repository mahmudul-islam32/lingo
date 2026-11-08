import { Skeleton, VisuallyHidden } from "@/components/ui";
import { LOADING_TEXT } from "./copy";

/** Number of placeholder nodes (Unit 1 has 5 lessons, AC13). */
export const SKELETON_NODE_COUNT = 5;

/** Loading state (GAM-008 AC13): skeleton header + 5 skeleton nodes, `role="status"`. */
export function SkillPathSkeleton() {
  return (
    <div role="status" className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pt-4">
      <VisuallyHidden>{LOADING_TEXT}</VisuallyHidden>
      <Skeleton shape="rect" className="h-20" />
      <div className="flex flex-col items-center gap-10">
        {Array.from({ length: SKELETON_NODE_COUNT }, (_, i) => (
          <Skeleton key={i} shape="circle" className="size-16" />
        ))}
      </div>
    </div>
  );
}
