import type { Metadata } from "next";
import { ReviewScreen } from "./ReviewScreen";

/** `/review` (PLT-029): outside the `(tabs)` group, so there is no bottom navigation. */
export const metadata: Metadata = { title: "Review" };

export default function ReviewPage() {
  return <ReviewScreen />;
}
