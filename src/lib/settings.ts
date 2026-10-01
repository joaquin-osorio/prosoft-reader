import { parseHHMM } from '@/lib/attendance/time'

export interface Settings {
  /** Latest on-time arrival, `HH:MM`. Arrivals within that minute are on time. */
  arrivalLimit: string
  /** Late arrivals allowed in the period; one more loses presentismo. */
  maxLateDays: number
}

export const DEFAULT_SETTINGS: Settings = { arrivalLimit: '09:10', maxLateDays: 3 }

const STORAGE_KEY = 'prosoft-reader:settings'

const isValidArrivalLimit = (value: unknown): value is string =>
  typeof value === 'string' && parseHHMM(value) !== null

export const isValidMaxLateDays = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0

/**
 * Parses stored settings. Each field falls back to its default on its own when
 * missing or invalid, so settings saved by older versions keep their values.
 */
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS
  try {
    const stored: unknown = JSON.parse(raw)
    if (typeof stored !== 'object' || stored === null) return DEFAULT_SETTINGS
    const { arrivalLimit, maxLateDays } = stored as Record<string, unknown>
    return {
      arrivalLimit: isValidArrivalLimit(arrivalLimit)
        ? arrivalLimit
        : DEFAULT_SETTINGS.arrivalLimit,
      maxLateDays: isValidMaxLateDays(maxLateDays) ? maxLateDays : DEFAULT_SETTINGS.maxLateDays,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

// Storage can be missing or throw (private mode, blocked site data), so
// settings must keep working in memory without it.
export function loadSettings(): Settings {
  try {
    return parseSettings(localStorage.getItem(STORAGE_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Not persisted; the in-memory value still applies for this session.
  }
}
