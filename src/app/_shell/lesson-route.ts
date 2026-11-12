/**
 * Lessons are never interrupted: no offline banner (PLT-006 criterion 8), no install card
 * and no update toast (PLT-005 criterion 8) on `/lesson` or `/lesson/*`.
 */
export function isLessonRoute(pathname: string | null): boolean {
  return pathname === "/lesson" || (pathname?.startsWith("/lesson/") ?? false);
}
