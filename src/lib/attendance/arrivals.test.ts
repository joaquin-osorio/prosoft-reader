import { describe, expect, it } from 'vitest'
import { getFirstArrivals, isLate, type Arrival } from './arrivals'
import { parseProsoftTxt } from './parse'
import { parseHHMM } from './time'

const at = (hhmmss: string) => {
  const [h, m, s] = hhmmss.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

const arrival = (time: string): Arrival => ({
  userId: 1,
  name: 'dani',
  date: '2026-09-01',
  seconds: at(time),
})

describe('getFirstArrivals', () => {
  it('keeps only the earliest punch per person and day', () => {
    const { punches } = parseProsoftTxt(
      [
        '000001\t1\t000000001\tdani\t020\t001\t2026/09/08  15:11:51',
        '000002\t1\t000000004\tcamilo\t001\t001\t2026/09/08  09:07:01',
        '000003\t1\t000000001\tdani\t020\t001\t2026/09/08  09:06:16',
        '000004\t1\t000000004\tcamilo\t001\t001\t2026/09/08  09:05:56',
        '000005\t1\t000000001\tdani\t020\t001\t2026/09/09  17:00:00',
      ].join('\r\n'),
    )

    expect(getFirstArrivals(punches)).toEqual([
      { userId: 1, name: 'dani', date: '2026-09-08', seconds: at('09:06:16') },
      { userId: 1, name: 'dani', date: '2026-09-09', seconds: at('17:00:00') },
      { userId: 4, name: 'camilo', date: '2026-09-08', seconds: at('09:05:56') },
    ])
  })
})

describe('isLate', () => {
  const limit = parseHHMM('09:10')!

  it('treats the whole limit minute as on time', () => {
    expect(isLate(arrival('09:10:00'), limit)).toBe(false)
    expect(isLate(arrival('09:10:59'), limit)).toBe(false)
  })

  it('marks arrivals after the limit minute as late', () => {
    expect(isLate(arrival('09:11:00'), limit)).toBe(true)
    expect(isLate(arrival('15:11:51'), limit)).toBe(true)
  })

  it('honors a custom limit', () => {
    expect(isLate(arrival('09:06:00'), parseHHMM('09:05')!)).toBe(true)
    expect(isLate(arrival('09:06:00'), parseHHMM('09:30')!)).toBe(false)
  })
})
