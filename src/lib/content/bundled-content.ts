/**
 * The course content shipped with the app (ARCHITECTURE §9). The manifest is a static
 * import; each lesson is a separate dynamic `import()`, so the bundler emits one chunk
 * per lesson that the service worker can precache.
 *
 * Adding a lesson to `content/courses/<courseId>/course.json` needs one line here: the
 * test `bundled-content.test.ts` fails until the map matches the manifest and the files.
 * Adding a course needs its manifest import plus an entry in each map below (CTO-008).
 * Keep the key order of the maps equal to `COURSE_REGISTRY`.
 *
 * Lesson ids are unique across ALL bundled courses (the route is `/lesson/<lessonId>`);
 * the test enforces it. en-de ids follow PD-037 (`de-a1-u01-l1-…`, ADR-008).
 */
import enDeCourse from "../../../content/courses/en-de/course.json";
import enEsCourse from "../../../content/courses/en-es/course.json";

export type JsonLoader = () => Promise<unknown>;

/**
 * `available` courses are offered in onboarding; `hidden` ones are not shown or named
 * but still load by id, so learners whose settings already say so keep playing (PD-030).
 */
export type CourseVisibility = "available" | "hidden";

export interface CourseRegistryEntry {
  id: string;
  visibility: CourseVisibility;
}

/**
 * The course registry (CTO-008): every bundled course, in display order (default course
 * first). The loader maps below must have exactly these ids (tested).
 */
export const COURSE_REGISTRY: readonly CourseRegistryEntry[] = [
  { id: "en-de", visibility: "available" },
  { id: "en-es", visibility: "hidden" },
];

export interface ContentLoaders {
  /** Course manifests by course id. */
  courses: Readonly<Record<string, JsonLoader>>;
  /** Lesson files by course id, then lesson id. */
  lessons: Readonly<Record<string, Readonly<Record<string, JsonLoader>>>>;
}

const json =
  (load: () => Promise<{ default: unknown }>): JsonLoader =>
  () =>
    load().then((module) => module.default);

export const BUNDLED_CONTENT: ContentLoaders = {
  courses: {
    "en-de": async () => enDeCourse,
    "en-es": async () => enEsCourse,
  },
  lessons: {
    "en-de": {
      "de-a1-u01-l1-hello": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u01-l1-hello.json"),
      ),
      "de-a1-u01-l2-whats-your-name": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u01-l2-whats-your-name.json"),
      ),
      "de-a1-u01-l3-formal-or-informal": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u01-l3-formal-or-informal.json"),
      ),
      "de-a1-u01-l4-how-are-you": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u01-l4-how-are-you.json"),
      ),
      "de-a1-u01-l5-language-school": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u01-l5-language-school.json"),
      ),
      "de-a1-u02-l1-countries": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u02-l1-countries.json"),
      ),
      "de-a1-u02-l2-where-do-you-live": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u02-l2-where-do-you-live.json"),
      ),
      "de-a1-u02-l3-languages": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u02-l3-languages.json"),
      ),
      "de-a1-u02-l4-he-she-we": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u02-l4-he-she-we.json"),
      ),
      "de-a1-u02-l5-welcome-cafe": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u02-l5-welcome-cafe.json"),
      ),
      "de-a1-u03-l1-count-to-six": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u03-l1-count-to-six.json"),
      ),
      "de-a1-u03-l2-count-to-twelve": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u03-l2-count-to-twelve.json"),
      ),
      "de-a1-u03-l3-how-old-are-you": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u03-l3-how-old-are-you.json"),
      ),
      "de-a1-u03-l4-big-numbers": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u03-l4-big-numbers.json"),
      ),
      "de-a1-u03-l5-spell-it": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u03-l5-spell-it.json"),
      ),
      "de-a1-u04-l1-bread-and-rolls": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u04-l1-bread-and-rolls.json"),
      ),
      "de-a1-u04-l2-der-die-das": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u04-l2-der-die-das.json"),
      ),
      "de-a1-u04-l3-id-like": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u04-l3-id-like.json"),
      ),
      "de-a1-u04-l4-what-does-it-cost": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u04-l4-what-does-it-cost.json"),
      ),
      "de-a1-u04-l5-saturday-bakery": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u04-l5-saturday-bakery.json"),
      ),
      "de-a1-u05-l1-fruit-and-vegetables": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a1-u05-l1-fruit-and-vegetables.json"),
      ),
      "de-a1-u05-l2-i-need": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u05-l2-i-need.json"),
      ),
      "de-a1-u05-l3-more-than-one": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u05-l3-more-than-one.json"),
      ),
      "de-a1-u05-l4-no-milk-today": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u05-l4-no-milk-today.json"),
      ),
      "de-a1-u05-l5-checkout": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u05-l5-checkout.json"),
      ),
      "de-a1-u06-l1-my-family": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u06-l1-my-family.json"),
      ),
      "de-a1-u06-l2-brothers-and-sisters": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a1-u06-l2-brothers-and-sisters.json"),
      ),
      "de-a1-u06-l3-your-family": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u06-l3-your-family.json"),
      ),
      "de-a1-u06-l4-grandparents-and-pets": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a1-u06-l4-grandparents-and-pets.json"),
      ),
      "de-a1-u06-l5-photos": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u06-l5-photos.json"),
      ),
      "de-a1-u07-l1-what-time-is-it": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u07-l1-what-time-is-it.json"),
      ),
      "de-a1-u07-l2-days-of-the-week": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u07-l2-days-of-the-week.json"),
      ),
      "de-a1-u07-l3-morning-routine": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u07-l3-morning-routine.json"),
      ),
      "de-a1-u07-l4-separable-verbs": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u07-l4-separable-verbs.json"),
      ),
      "de-a1-u07-l5-making-a-plan": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u07-l5-making-a-plan.json"),
      ),
      "de-a1-u08-l1-hobbies": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u08-l1-hobbies.json"),
      ),
      "de-a1-u08-l2-i-like": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u08-l2-i-like.json"),
      ),
      "de-a1-u08-l3-on-the-move": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u08-l3-on-the-move.json"),
      ),
      "de-a1-u08-l4-i-can-swim": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u08-l4-i-can-swim.json"),
      ),
      "de-a1-u08-l5-weekend-plans": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u08-l5-weekend-plans.json"),
      ),
      "de-a1-u09-l1-getting-around": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u09-l1-getting-around.json"),
      ),
      "de-a1-u09-l2-buying-a-ticket": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u09-l2-buying-a-ticket.json"),
      ),
      "de-a1-u09-l3-departures": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u09-l3-departures.json"),
      ),
      "de-a1-u09-l4-changing-trains": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u09-l4-changing-trains.json"),
      ),
      "de-a1-u09-l5-which-way": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u09-l5-which-way.json"),
      ),
      "de-a1-u10-l1-rooms": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u10-l1-rooms.json"),
      ),
      "de-a1-u10-l2-furniture": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u10-l2-furniture.json"),
      ),
      "de-a1-u10-l3-there-is": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u10-l3-there-is.json"),
      ),
      "de-a1-u10-l4-big-small-bright": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u10-l4-big-small-bright.json"),
      ),
      "de-a1-u10-l5-the-viewing": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u10-l5-the-viewing.json"),
      ),
      "de-a1-u11-l1-the-body": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u11-l1-the-body.json"),
      ),
      "de-a1-u11-l2-what-hurts": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u11-l2-what-hurts.json"),
      ),
      "de-a1-u11-l3-appointment": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u11-l3-appointment.json"),
      ),
      "de-a1-u11-l4-reception": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u11-l4-reception.json"),
      ),
      "de-a1-u11-l5-pharmacy": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u11-l5-pharmacy.json"),
      ),
      "de-a1-u12-l1-months": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u12-l1-months.json"),
      ),
      "de-a1-u12-l2-dates": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u12-l2-dates.json"),
      ),
      "de-a1-u12-l3-registration-office": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a1-u12-l3-registration-office.json"),
      ),
      "de-a1-u12-l4-jobs": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u12-l4-jobs.json"),
      ),
      "de-a1-u12-l5-a1-checkpoint": json(
        () => import("../../../content/courses/en-de/lessons/de-a1-u12-l5-a1-checkpoint.json"),
      ),
      "de-a2-u01-l1-weather": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u01-l1-weather.json"),
      ),
      "de-a2-u01-l2-seasons": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u01-l2-seasons.json"),
      ),
      "de-a2-u01-l3-birthdays": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u01-l3-birthdays.json"),
      ),
      "de-a2-u01-l4-but-or-because": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u01-l4-but-or-because.json"),
      ),
      "de-a2-u01-l5-forecast": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u01-l5-forecast.json"),
      ),
      "de-a2-u02-l1-how-was-it": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u02-l1-how-was-it.json"),
      ),
      "de-a2-u02-l2-what-did-you-do": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u02-l2-what-did-you-do.json"),
      ),
      "de-a2-u02-l3-eaten-and-seen": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u02-l3-eaten-and-seen.json"),
      ),
      "de-a2-u02-l4-phoned-and-visited": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u02-l4-phoned-and-visited.json"),
      ),
      "de-a2-u02-l5-monday-at-work": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u02-l5-monday-at-work.json"),
      ),
      "de-a2-u03-l1-on-holiday": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u03-l1-on-holiday.json"),
      ),
      "de-a2-u03-l2-we-travelled": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u03-l2-we-travelled.json"),
      ),
      "de-a2-u03-l3-how-long": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u03-l3-how-long.json"),
      ),
      "de-a2-u03-l4-for-you": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u03-l4-for-you.json"),
      ),
      "de-a2-u03-l5-postcard": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u03-l5-postcard.json"),
      ),
      "de-a2-u04-l1-invitations": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u04-l1-invitations.json"),
      ),
      "de-a2-u04-l2-happy-birthday": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u04-l2-happy-birthday.json"),
      ),
      "de-a2-u04-l3-who-gets-what": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u04-l3-who-gets-what.json"),
      ),
      "de-a2-u04-l4-i-like-it": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u04-l4-i-like-it.json"),
      ),
      "de-a2-u04-l5-office-birthday": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u04-l5-office-birthday.json"),
      ),
      "de-a2-u05-l1-going-to": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u05-l1-going-to.json"),
      ),
      "de-a2-u05-l2-where-are-you": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u05-l2-where-are-you.json"),
      ),
      "de-a2-u05-l3-hundreds": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u05-l3-hundreds.json"),
      ),
      "de-a2-u05-l4-since-when": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u05-l4-since-when.json"),
      ),
      "de-a2-u05-l5-post-office": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u05-l5-post-office.json"),
      ),
      "de-a2-u06-l1-clothes": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u06-l1-clothes.json"),
      ),
      "de-a2-u06-l2-colours": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u06-l2-colours.json"),
      ),
      "de-a2-u06-l3-the-blue-jumper": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u06-l3-the-blue-jumper.json"),
      ),
      "de-a2-u06-l4-a-red-dress": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u06-l4-a-red-dress.json"),
      ),
      "de-a2-u06-l5-exchange": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u06-l5-exchange.json"),
      ),
      "de-a2-u07-l1-sport": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u07-l1-sport.json"),
      ),
      "de-a2-u07-l2-how-do-you-feel": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u07-l2-how-do-you-feel.json"),
      ),
      "de-a2-u07-l3-drink-water": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u07-l3-drink-water.json"),
      ),
      "de-a2-u07-l4-the-doctor-says": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u07-l4-the-doctor-says.json"),
      ),
      "de-a2-u07-l5-back-in-training": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u07-l5-back-in-training.json"),
      ),
      "de-a2-u08-l1-on-the-phone": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u08-l1-on-the-phone.json"),
      ),
      "de-a2-u08-l2-minutes-and-hours": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u08-l2-minutes-and-hours.json"),
      ),
      "de-a2-u08-l3-moving-an-appointment": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a2-u08-l3-moving-an-appointment.json"),
      ),
      "de-a2-u08-l4-because": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u08-l4-because.json"),
      ),
      "de-a2-u08-l5-voicemail": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u08-l5-voicemail.json"),
      ),
      "de-a2-u09-l1-where-is-it": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u09-l1-where-is-it.json"),
      ),
      "de-a2-u09-l2-between": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u09-l2-between.json"),
      ),
      "de-a2-u09-l3-where-does-it-go": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u09-l3-where-does-it-go.json"),
      ),
      "de-a2-u09-l4-neighbours": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u09-l4-neighbours.json"),
      ),
      "de-a2-u09-l5-repairs": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u09-l5-repairs.json"),
      ),
      "de-a2-u10-l1-which-platform": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u10-l1-which-platform.json"),
      ),
      "de-a2-u10-l2-ten-minutes-late": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u10-l2-ten-minutes-late.json"),
      ),
      "de-a2-u10-l3-booking-a-room": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u10-l3-booking-a-room.json"),
      ),
      "de-a2-u10-l4-reception": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u10-l4-reception.json"),
      ),
      "de-a2-u10-l5-missed-connection": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u10-l5-missed-connection.json"),
      ),
      "de-a2-u11-l1-job-ads": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u11-l1-job-ads.json"),
      ),
      "de-a2-u11-l2-applying": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u11-l2-applying.json"),
      ),
      "de-a2-u11-l3-i-think-that": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u11-l3-i-think-that.json"),
      ),
      "de-a2-u11-l4-interview": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u11-l4-interview.json"),
      ),
      "de-a2-u11-l5-job-offer": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u11-l5-job-offer.json"),
      ),
      "de-a2-u12-l1-letters-and-emails": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u12-l1-letters-and-emails.json"),
      ),
      "de-a2-u12-l2-documents": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u12-l2-documents.json"),
      ),
      "de-a2-u12-l3-if-you-have-questions": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a2-u12-l3-if-you-have-questions.json"),
      ),
      "de-a2-u12-l4-school-and-daycare": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u12-l4-school-and-daycare.json"),
      ),
      "de-a2-u12-l5-letter-from-the-landlord": json(
        () =>
          import("../../../content/courses/en-de/lessons/de-a2-u12-l5-letter-from-the-landlord.json"),
      ),
      "de-a2-u13-l1-phone-and-internet": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u13-l1-phone-and-internet.json"),
      ),
      "de-a2-u13-l2-faster-and-cheaper": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u13-l2-faster-and-cheaper.json"),
      ),
      "de-a2-u13-l3-best-of-all": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u13-l3-best-of-all.json"),
      ),
      "de-a2-u13-l4-news-and-opinions": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u13-l4-news-and-opinions.json"),
      ),
      "de-a2-u13-l5-screen-time": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u13-l5-screen-time.json"),
      ),
      "de-a2-u14-l1-i-will": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u14-l1-i-will.json"),
      ),
      "de-a2-u14-l2-predictions": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u14-l2-predictions.json"),
      ),
      "de-a2-u14-l3-goals": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u14-l3-goals.json"),
      ),
      "de-a2-u14-l4-about-me": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u14-l4-about-me.json"),
      ),
      "de-a2-u14-l5-a2-checkpoint": json(
        () => import("../../../content/courses/en-de/lessons/de-a2-u14-l5-a2-checkpoint.json"),
      ),
      "de-b1-u01-l1-could-you": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u01-l1-could-you.json"),
      ),
      "de-b1-u01-l2-id-like": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u01-l2-id-like.json"),
      ),
      "de-b1-u01-l3-do-you-know-where": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u01-l3-do-you-know-where.json"),
      ),
      "de-b1-u01-l4-sorry": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u01-l4-sorry.json"),
      ),
      "de-b1-u01-l5-hotline": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u01-l5-hotline.json"),
      ),
      "de-b1-u02-l1-back-then": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u02-l1-back-then.json"),
      ),
      "de-b1-u02-l2-went-came-saw": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u02-l2-went-came-saw.json"),
      ),
      "de-b1-u02-l3-first-then": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u02-l3-first-then.json"),
      ),
      "de-b1-u02-l4-when-i-was-a-child": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u02-l4-when-i-was-a-child.json"),
      ),
      "de-b1-u02-l5-how-we-met": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u02-l5-how-we-met.json"),
      ),
      "de-b1-u03-l1-what-are-they-like": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u03-l1-what-are-they-like.json"),
      ),
      "de-b1-u03-l2-the-man-who": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u03-l2-the-man-who.json"),
      ),
      "de-b1-u03-l3-the-friend-i-met": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u03-l3-the-friend-i-met.json"),
      ),
      "de-b1-u03-l4-shared-hobbies": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u03-l4-shared-hobbies.json"),
      ),
      "de-b1-u03-l5-moving-help": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u03-l5-moving-help.json"),
      ),
      "de-b1-u04-l1-tasks": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u04-l1-tasks.json"),
      ),
      "de-b1-u04-l2-waiting-for": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u04-l2-waiting-for.json"),
      ),
      "de-b1-u04-l3-what-about": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u04-l3-what-about.json"),
      ),
      "de-b1-u04-l4-printer-problem": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u04-l4-printer-problem.json"),
      ),
      "de-b1-u04-l5-coffee-machine": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u04-l5-coffee-machine.json"),
      ),
      "de-b1-u05-l1-courses": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u05-l1-courses.json"),
      ),
      "de-b1-u05-l2-i-plan-to": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u05-l2-i-plan-to.json"),
      ),
      "de-b1-u05-l3-its-important-to": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u05-l3-its-important-to.json"),
      ),
      "de-b1-u05-l4-in-order-to": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u05-l4-in-order-to.json"),
      ),
      "de-b1-u05-l5-learning-tips": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u05-l5-learning-tips.json"),
      ),
      "de-b1-u06-l1-flat-ads": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u06-l1-flat-ads.json"),
      ),
      "de-b1-u06-l2-the-landlord": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u06-l2-the-landlord.json"),
      ),
      "de-b1-u06-l3-big-balcony": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u06-l3-big-balcony.json"),
      ),
      "de-b1-u06-l4-the-room-where": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u06-l4-the-room-where.json"),
      ),
      "de-b1-u06-l5-complaint-letter": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u06-l5-complaint-letter.json"),
      ),
      "de-b1-u07-l1-symptoms": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u07-l1-symptoms.json"),
      ),
      "de-b1-u07-l2-the-patient": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u07-l2-the-patient.json"),
      ),
      "de-b1-u07-l3-wash-your-hands": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u07-l3-wash-your-hands.json"),
      ),
      "de-b1-u07-l4-hospital": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u07-l4-hospital.json"),
      ),
      "de-b1-u07-l5-insurance-call": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u07-l5-insurance-call.json"),
      ),
      "de-b1-u08-l1-ordering-online": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u08-l1-ordering-online.json"),
      ),
      "de-b1-u08-l2-although": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u08-l2-although.json"),
      ),
      "de-b1-u08-l3-complaint": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u08-l3-complaint.json"),
      ),
      "de-b1-u08-l4-so-that": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u08-l4-so-that.json"),
      ),
      "de-b1-u08-l5-cancelling": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u08-l5-cancelling.json"),
      ),
      "de-b1-u09-l1-environment": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u09-l1-environment.json"),
      ),
      "de-b1-u09-l2-is-sorted": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u09-l2-is-sorted.json"),
      ),
      "de-b1-u09-l3-built-by": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u09-l3-built-by.json"),
      ),
      "de-b1-u09-l4-by-bike": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u09-l4-by-bike.json"),
      ),
      "de-b1-u09-l5-clean-up": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u09-l5-clean-up.json"),
      ),
      "de-b1-u10-l1-culture": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u10-l1-culture.json"),
      ),
      "de-b1-u10-l2-i-would-love-to": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u10-l2-i-would-love-to.json"),
      ),
      "de-b1-u10-l3-if-i-had": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u10-l3-if-i-had.json"),
      ),
      "de-b1-u10-l4-if-i-were-you": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u10-l4-if-i-were-you.json"),
      ),
      "de-b1-u10-l5-concert": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u10-l5-concert.json"),
      ),
      "de-b1-u11-l1-official-letters": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u11-l1-official-letters.json"),
      ),
      "de-b1-u11-l2-whose": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u11-l2-whose.json"),
      ),
      "de-b1-u11-l3-because-of": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u11-l3-because-of.json"),
      ),
      "de-b1-u11-l4-reminder": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u11-l4-reminder.json"),
      ),
      "de-b1-u11-l5-calling-the-office": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u11-l5-calling-the-office.json"),
      ),
      "de-b1-u12-l1-local-news": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u12-l1-local-news.json"),
      ),
      "de-b1-u12-l2-was-opened": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u12-l2-was-opened.json"),
      ),
      "de-b1-u12-l3-after-we-had": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u12-l3-after-we-had.json"),
      ),
      "de-b1-u12-l4-what-happened": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u12-l4-what-happened.json"),
      ),
      "de-b1-u12-l5-club-newsletter": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u12-l5-club-newsletter.json"),
      ),
      "de-b1-u13-l1-market": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u13-l1-market.json"),
      ),
      "de-b1-u13-l2-fresh-bread": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u13-l2-fresh-bread.json"),
      ),
      "de-b1-u13-l3-fresh-vegetables": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u13-l3-fresh-vegetables.json"),
      ),
      "de-b1-u13-l4-the-cheaper-one": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u13-l4-the-cheaper-one.json"),
      ),
      "de-b1-u13-l5-team-lunch": json(
        () => import("../../../content/courses/en-de/lessons/de-b1-u13-l5-team-lunch.json"),
      ),
    },
    "en-es": {
      "u1-l1-hello": json(() => import("../../../content/courses/en-es/lessons/u1-l1-hello.json")),
      "u1-l2-nice-to-meet-you": json(
        () => import("../../../content/courses/en-es/lessons/u1-l2-nice-to-meet-you.json"),
      ),
      "u1-l3-at-the-cafe": json(
        () => import("../../../content/courses/en-es/lessons/u1-l3-at-the-cafe.json"),
      ),
      "u1-l4-count-it": json(
        () => import("../../../content/courses/en-es/lessons/u1-l4-count-it.json"),
      ),
      "u1-l5-around-town": json(
        () => import("../../../content/courses/en-es/lessons/u1-l5-around-town.json"),
      ),
    },
  },
};

/** Raw bundled manifest, for build-time use (`generateStaticParams`). */
export const BUNDLED_COURSE_MANIFESTS: Readonly<Record<string, unknown>> = {
  "en-de": enDeCourse,
  "en-es": enEsCourse,
};
