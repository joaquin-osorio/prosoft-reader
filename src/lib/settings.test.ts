import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSettings } from './settings'

describe('parseSettings', () => {
  it('reads valid values', () => {
    expect(parseSettings('{"arrivalLimit":"09:30","maxLateDays":5}')).toEqual({
      arrivalLimit: '09:30',
      maxLateDays: 5,
    })
    expect(parseSettings('{"arrivalLimit":"09:30","maxLateDays":0}').maxLateDays).toBe(0)
  })

  it('falls back to defaults for missing, malformed or invalid values', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('not json')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('null')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{"arrivalLimit":"25:00"}')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{"arrivalLimit":930}')).toEqual(DEFAULT_SETTINGS)
  })

  it('falls back per field, keeping the valid ones', () => {
    // Settings saved before maxLateDays existed.
    expect(parseSettings('{"arrivalLimit":"09:30"}')).toEqual({
      arrivalLimit: '09:30',
      maxLateDays: 3,
    })
    for (const maxLateDays of ['-1', '2.5', '"3"', 'null']) {
      expect(parseSettings(`{"arrivalLimit":"09:30","maxLateDays":${maxLateDays}}`)).toEqual({
        arrivalLimit: '09:30',
        maxLateDays: 3,
      })
    }
    expect(parseSettings('{"arrivalLimit":"bad","maxLateDays":5}')).toEqual({
      arrivalLimit: '09:10',
      maxLateDays: 5,
    })
  })

  it('defaults to 09:10 and 3 allowed late arrivals', () => {
    expect(DEFAULT_SETTINGS).toEqual({ arrivalLimit: '09:10', maxLateDays: 3 })
  })
})

describe('loadSettings / saveSettings', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('round-trips through localStorage', () => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    })

    saveSettings({ arrivalLimit: '08:45', maxLateDays: 4 })
    expect(loadSettings()).toEqual({ arrivalLimit: '08:45', maxLateDays: 4 })
  })

  it('keeps working when storage throws', () => {
    const fail = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: fail, setItem: fail })

    expect(() => saveSettings({ arrivalLimit: '08:45', maxLateDays: 4 })).not.toThrow()
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
