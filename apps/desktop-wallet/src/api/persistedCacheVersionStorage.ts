export type PersistedQueryCacheVersion = string

class PersistedQueryCacheVersionStorage {
  private static localStorageKey = 'persisted-query-cache-version'

  set(version: string): void {
    window.localStorage.setItem(PersistedQueryCacheVersionStorage.localStorageKey, version)
  }

  load(): PersistedQueryCacheVersion | null {
    const rawData = window.localStorage.getItem(PersistedQueryCacheVersionStorage.localStorageKey)

    return rawData
  }
}

const Storage = new PersistedQueryCacheVersionStorage()

export default Storage
