import { describe, expect, it } from 'vitest'
import type { Arrival } from './arrivals'
import { filterByRange, getFullRange, isoToLocalDate, localDateToIso } from './range'

const arrival = (date: string): Arrival => ({ userId: 1, name: 'dani', date, seconds: 9 * 3600 })

const arrivals = ['2026-09-01', '2026-08-26', '2026-09-25', '2026-09-11'].map(arrival)

describe('getFullRange', () => {
  it('spans the first to the last date in the data', () => {
    expect(getFullRange(arrivals)).toEqual({ from: '2026-08-26', to: '2026-09-25' })
  })
})

describe('filterByRange', () => {
  it('includes both ends of the range', () => {
    const dates = filterByRange(arrivals, { from: '2026-09-01', to: '2026-09-11' }).map((a) => a.date)
    expect(dates).toEqual(['2026-09-01', '2026-09-11'])
  })

  it('supports single-day ranges', () => {
    const dates = filterByRange(arrivals, { from: '2026-09-11', to: '2026-09-11' }).map((a) => a.date)
    expect(dates).toEqual(['2026-09-11'])
  })

  it('keeps everything for the full range', () => {
    expect(filterByRange(arrivals, getFullRange(arrivals))).toHaveLength(arrivals.length)
  })
})

describe('isoToLocalDate / localDateToIso', () => {
  it('round-trips without timezone shifts', () => {
    const date = isoToLocalDate('2026-08-31')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 7, 31])
    expect(localDateToIso(date)).toBe('2026-08-31')
  })
})
