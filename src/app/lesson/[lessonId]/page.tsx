import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  bundledCourseIdOfLesson,
  bundledCourseIds,
  bundledLessonIds,
} from "@/lib/content/static-params";
import { LessonScreen } from "./LessonScreen";

/**
 * `/lesson/<lessonId>` (PLT-007): outside the `(tabs)` group, so there is no bottom
 * navigation. Every lesson of every bundled course is prerendered at build time (and
 * precached by the service worker); any other id is a 404. Lesson ids are unique across
 * courses, so the id alone names the course (CTO-008).
 */
export const dynamicParams = false;

export function generateStaticParams(): { lessonId: string }[] {
  return bundledCourseIds()
    .flatMap(bundledLessonIds)
    .map((lessonId) => ({ lessonId }));
}

export const metadata: Metadata = { title: "Lesson" };

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const courseId = bundledCourseIdOfLesson(lessonId);
  if (courseId === null) notFound();
  return <LessonScreen courseId={courseId} lessonId={lessonId} />;
}
