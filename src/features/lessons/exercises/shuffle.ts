/**
 * Fisher–Yates shuffle. Pure: returns a new array and never mutates `items`.
 * `random` must return a number in [0, 1) like `Math.random`; inject a seeded one in tests.
 * Shared by the exercise components (LES-004, LES-005, LES-006).
 */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}
