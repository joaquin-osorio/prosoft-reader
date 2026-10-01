import { describe, expect, it } from 'vitest'
import type { Arrival } from './arrivals'
import { buildAttendance } from './summary'

const arrival = (userId: number, date: string, hhmm: string): Arrival => {
  const [h, m] = hhmm.split(':').map(Number)
  return { userId, name: `user${userId}`, date, seconds: h * 3600 + m * 60 }
}

describe('buildAttendance', () => {
  const limit = 9 * 60 + 10

  it('builds the period from the dates present in the data', () => {
    const { days } = buildAttendance(
      [
        arrival(2, '2026-09-02', '09:00'),
        arrival(1, '2026-08-29', '09:00'),
        arrival(1, '2026-09-02', '09:00'),
      ],
      limit,
    )
    expect(days).toEqual(['2026-08-29', '2026-09-02'])
  })

  it('counts present, late and missing days per person', () => {
    const { people } = buildAttendance(
      [
        arrival(1, '2026-09-01', '09:05'),
        arrival(1, '2026-09-02', '09:11'),
        arrival(1, '2026-09-03', '09:10'),
        arrival(2, '2026-09-02', '09:30'),
      ],
      limit,
    )

    const counts = people.map(({ userId, presentDays, lateDays, missingDays }) => ({
      userId,
      presentDays,
      lateDays,
      missingDays,
    }))
    expect(counts).toEqual([
      { userId: 1, presentDays: 3, lateDays: 1, missingDays: 0 },
      { userId: 2, presentDays: 1, lateDays: 1, missingDays: 2 },
    ])
    expect(people[0].byDay['2026-09-02'].late).toBe(true)
    expect(people[0].byDay['2026-09-03'].late).toBe(false)
    expect(people[1].byDay['2026-09-01']).toBeUndefined()
  })
})
