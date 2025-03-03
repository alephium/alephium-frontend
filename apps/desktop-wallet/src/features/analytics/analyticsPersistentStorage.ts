import { nanoid } from 'nanoid'

export type AnalyticsId = string

class AnalyticsStorage {
  private static localStorageKey = 'analytics'

  private generateAnalyticsId(): AnalyticsId {
    const analyticsId = nanoid()

    window.localStorage.setItem(AnalyticsStorage.localStorageKey, analyticsId)

    return analyticsId
  }

  load(): AnalyticsId {
    const rawData = window.localStorage.getItem(AnalyticsStorage.localStorageKey)

    return rawData || this.generateAnalyticsId()
  }
}

const Storage = new AnalyticsStorage()

export default Storage
