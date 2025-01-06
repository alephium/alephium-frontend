import { merge } from 'lodash'
import posthog from 'posthog-js'

import { defaultSettings } from '@/features/settings/settingsConstants'
import { Settings } from '@/features/settings/settingsTypes'

type SettingsKey = keyof Settings

class SettingsStorage {
  private static localStorageKey = 'settings'

  loadAll(): Settings {
    const rawSettings = window.localStorage.getItem(SettingsStorage.localStorageKey)

    if (!rawSettings) return defaultSettings

    try {
      // Merge default settings with rawSettings in case of new key(s) being added
      const parsedSettings = JSON.parse(rawSettings) as Settings

      return merge({}, defaultSettings, parsedSettings)
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Parsing stored settings' })
      return defaultSettings // Fallback to default settings if something went wrong
    }
  }

  load(key: SettingsKey): Settings[SettingsKey] {
    const settings = this.loadAll()

    return settings[key]
  }

  storeAll(settings: Settings) {
    window.localStorage.setItem(SettingsStorage.localStorageKey, JSON.stringify(settings))
  }

  store<K extends SettingsKey, S extends Settings[K]>(key: K, settings: S) {
    const previousSettings = this.loadAll()

    const newSettings = {
      ...previousSettings,
      [key]: {
        ...previousSettings[key],
        ...settings
      }
    }

    this.storeAll(newSettings)

    return newSettings
  }
}

const Storage = new SettingsStorage()

export default Storage
