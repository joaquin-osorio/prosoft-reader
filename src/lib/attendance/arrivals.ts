import type { Punch } from './parse'

/** The first punch of a person on a given day: the only one that counts. */
export type Arrival = Punch

/**
 * Keeps only the earliest punch per person and day, regardless of the order
 * the punches appear in the file. Sorted by `userId`, then date.
 */
export function getFirstArrivals(punches: Punch[]): Arrival[] {
  const firstByKey = new Map<string, Punch>()
  for (const punch of punches) {
    const key = `${punch.userId}|${punch.date}`
    const current = firstByKey.get(key)
    if (!current || punch.seconds < current.seconds) firstByKey.set(key, punch)
  }

  return [...firstByKey.values()].sort(
    (a, b) => a.userId - b.userId || a.date.localeCompare(b.date),
  )
}

/**
 * Seconds are ignored: with a limit of 09:10, 09:10:59 is on time and
 * 09:11:00 is late.
 */
export function isLate(arrival: Arrival, limitMinutes: number): boolean {
  return Math.floor(arrival.seconds / 60) > limitMinutes
}
