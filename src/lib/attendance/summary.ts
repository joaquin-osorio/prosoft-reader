import { isLate, type Arrival } from './arrivals'

export interface DayEntry {
  arrival: Arrival
  late: boolean
}

export interface PersonAttendance {
  userId: number
  name: string
  /** Keyed by `YYYY-MM-DD`; days without a punch are absent. */
  byDay: Record<string, DayEntry>
  presentDays: number
  lateDays: number
  /** Days of the period on which this person has no punch. */
  missingDays: number
}

export interface Attendance {
  /** Every date with at least one punch from anyone, ascending. */
  days: string[]
  /** Sorted by `userId`. */
  people: PersonAttendance[]
}

/**
 * Groups first arrivals by person. The period's days are the dates that
 * appear in the data, so a day nobody punched (weekend, holiday) is not
 * counted as missing.
 */
export function buildAttendance(arrivals: Arrival[], limitMinutes: number): Attendance {
  const days = [...new Set(arrivals.map((a) => a.date))].sort()
  const byUser = new Map<number, PersonAttendance>()

  for (const arrival of arrivals) {
    let person = byUser.get(arrival.userId)
    if (!person) {
      person = {
        userId: arrival.userId,
        name: arrival.name,
        byDay: {},
        presentDays: 0,
        lateDays: 0,
        missingDays: 0,
      }
      byUser.set(arrival.userId, person)
    }
    const late = isLate(arrival, limitMinutes)
    person.byDay[arrival.date] = { arrival, late }
    person.presentDays++
    if (late) person.lateDays++
  }

  const people = [...byUser.values()].sort((a, b) => a.userId - b.userId)
  for (const person of people) person.missingDays = days.length - person.presentDays

  return { days, people }
}
