import { CourseSchema, type Course } from "@/contracts";

/** Unit 1 of the real course shape: 5 lessons (ids mirror content/courses/en-es). */
export const L = ["u1-l1", "u1-l2", "u1-l3", "u1-l4", "u1-l5"] as const;

export const unitOneCourse: Course = CourseSchema.parse({
  id: "en-es",
  title: "Spanish",
  learningLanguage: "es",
  knownLanguage: "en",
  version: 1,
  units: [
    {
      id: "unit-1",
      title: "First Steps",
      lessons: [
        { id: L[0], title: "Hello!" },
        { id: L[1], title: "Nice to Meet You" },
        { id: L[2], title: "At the Café" },
        { id: L[3], title: "Count It" },
        { id: L[4], title: "Around Town" },
      ],
    },
  ],
});

/** Two units, to check that order and unlocking run across units. */
export const twoUnitCourse: Course = CourseSchema.parse({
  ...unitOneCourse,
  units: [
    {
      id: "unit-1",
      title: "First Steps",
      lessons: [
        { id: "a1", title: "A1" },
        { id: "a2", title: "A2" },
      ],
    },
    {
      id: "unit-2",
      title: "Next Steps",
      lessons: [
        { id: "b1", title: "B1" },
        { id: "b2", title: "B2" },
      ],
    },
  ],
});
