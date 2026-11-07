import { Spinner, VisuallyHidden } from "@/components/ui";

/**
 * Route-level loading UI: centred spinner in a `role="status"` region named "Loading"
 * (criterion 8). `status` doesn't take its name from content, so it is set with
 * `aria-label`; the hidden text is still announced by the live region.
 */
export function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 items-center justify-center py-16 text-primary"
    >
      <Spinner size="lg" />
      <VisuallyHidden>Loading</VisuallyHidden>
    </div>
  );
}
