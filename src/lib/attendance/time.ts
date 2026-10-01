/** Parses a `HH:MM` string into minutes since midnight, or `null` if invalid. */
export function parseHHMM(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Formats seconds since midnight as `HH:MM`, or `HH:MM:SS` when `withSeconds` is set. */
export function formatTimeOfDay(seconds: number, withSeconds = false): string {
  const hhmm = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}`
  return withSeconds ? `${hhmm}:${pad(seconds % 60)}` : hhmm
}

/** Formats an ISO date (`YYYY-MM-DD`) as `dd/mm/yy`. */
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

/** Day of the week of an ISO date (`YYYY-MM-DD`), 0 = Sunday. */
export function getWeekday(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}
