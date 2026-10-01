import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSettings } from './settings'

describe('parseSettings', () => {
  it('reads a valid arrival limit', () => {
    expect(parseSettings('{"arrivalLimit":"09:30"}')).toEqual({ arrivalLimit: '09:30' })
  })

  it('falls back to defaults for missing, malformed or invalid values', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('not json')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{"arrivalLimit":"25:00"}')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{"arrivalLimit":930}')).toEqual(DEFAULT_SETTINGS)
  })

  it('defaults to 09:10', () => {
    expect(DEFAULT_SETTINGS.arrivalLimit).toBe('09:10')
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

    saveSettings({ arrivalLimit: '08:45' })
    expect(loadSettings()).toEqual({ arrivalLimit: '08:45' })
  })

  it('keeps working when storage throws', () => {
    const fail = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: fail, setItem: fail })

    expect(() => saveSettings({ arrivalLimit: '08:45' })).not.toThrow()
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
