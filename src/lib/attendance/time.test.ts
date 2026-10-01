import { describe, expect, it } from 'vitest'
import { formatShortDate, formatTimeOfDay, getWeekday, parseHHMM } from './time'

describe('parseHHMM', () => {
  it('parses valid times', () => {
    expect(parseHHMM('09:10')).toBe(550)
    expect(parseHHMM('0:05')).toBe(5)
  })

  it('rejects invalid times', () => {
    expect(parseHHMM('24:00')).toBeNull()
    expect(parseHHMM('09:60')).toBeNull()
    expect(parseHHMM('nine')).toBeNull()
    expect(parseHHMM('')).toBeNull()
  })
})

describe('formatTimeOfDay', () => {
  it('formats with and without seconds', () => {
    expect(formatTimeOfDay(9 * 3600 + 10 * 60 + 59)).toBe('09:10')
    expect(formatTimeOfDay(9 * 3600 + 10 * 60 + 59, true)).toBe('09:10:59')
  })
})

describe('formatShortDate', () => {
  it('formats ISO dates as dd/mm/yy', () => {
    expect(formatShortDate('2026-09-01')).toBe('01/09/26')
  })
})

describe('getWeekday', () => {
  it('returns the day of the week regardless of the local timezone', () => {
    expect(getWeekday('2026-08-29')).toBe(6) // Saturday
    expect(getWeekday('2026-08-31')).toBe(1) // Monday
  })
})
