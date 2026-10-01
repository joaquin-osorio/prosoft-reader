import { parseHHMM } from '@/lib/attendance/time'

export interface Settings {
  /** Latest on-time arrival, `HH:MM`. Arrivals within that minute are on time. */
  arrivalLimit: string
}

export const DEFAULT_SETTINGS: Settings = { arrivalLimit: '09:10' }

const STORAGE_KEY = 'prosoft-reader:settings'

/** Parses stored settings, falling back to defaults for anything missing or invalid. */
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS
  try {
    const stored: unknown = JSON.parse(raw)
    const arrivalLimit =
      typeof stored === 'object' && stored !== null && 'arrivalLimit' in stored
        ? stored.arrivalLimit
        : undefined
    return typeof arrivalLimit === 'string' && parseHHMM(arrivalLimit) !== null
      ? { arrivalLimit }
      : DEFAULT_SETTINGS
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
