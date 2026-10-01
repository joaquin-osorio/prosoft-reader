import { useState } from 'react'
import { loadSettings, saveSettings, type Settings } from '@/lib/settings'

/** App settings backed by `localStorage`. */
export function useSettings() {
  const [settings, setSettings] = useState(loadSettings)

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    saveSettings(next)
    setSettings(next)
  }

  return [settings, updateSettings] as const
}
