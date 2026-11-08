/** Original inline icons for onboarding (decorative; the button carries the label). */
export function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
