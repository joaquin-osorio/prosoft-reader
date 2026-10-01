import type { Arrival } from './arrivals'

/** Inclusive range of ISO dates (`YYYY-MM-DD`). */
export interface DateRange {
  from: string
  to: string
}

/** First to last date in the data. Expects at least one arrival. */
export function getFullRange(arrivals: Arrival[]): DateRange {
  const dates = arrivals.map((a) => a.date).sort()
  return { from: dates[0], to: dates[dates.length - 1] }
}

// ISO dates compare correctly as strings.
export function filterByRange(arrivals: Arrival[], range: DateRange): Arrival[] {
  return arrivals.filter((a) => a.date >= range.from && a.date <= range.to)
}

/** ISO date → local midnight `Date`, for date picker widgets. */
export function isoToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Local `Date` → ISO date, ignoring the time of day. */
export function localDateToIso(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
