import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_COURSE_ID } from "@/lib/content/constants";
import { bundledLessonIds } from "@/lib/content/static-params";
import { LessonScreen } from "./LessonScreen";

/**
 * `/lesson/<lessonId>` (PLT-007): outside the `(tabs)` group, so there is no bottom
 * navigation. Every bundled lesson is prerendered at build time (and precached by the
 * service worker); any other id is a 404.
 */
export const dynamicParams = false;

export function generateStaticParams(): { lessonId: string }[] {
  return bundledLessonIds(DEFAULT_COURSE_ID).map((lessonId) => ({ lessonId }));
}

export const metadata: Metadata = { title: "Lesson" };

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  if (!bundledLessonIds(DEFAULT_COURSE_ID).includes(lessonId)) notFound();
  return <LessonScreen courseId={DEFAULT_COURSE_ID} lessonId={lessonId} />;
}
