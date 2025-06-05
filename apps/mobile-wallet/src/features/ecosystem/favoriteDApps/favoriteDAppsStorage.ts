import { sendAnalytics } from '~/analytics'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const FAVORITE_DAPPS_KEY = 'alephium_favorite_dapps'

export const getFavoriteDApps = (): Array<string> => {
  let favoriteDApps = null

  try {
    const rawFavoriteDApps = storage.getString(FAVORITE_DAPPS_KEY)
    favoriteDApps = rawFavoriteDApps ? JSON.parse(rawFavoriteDApps) : []
  } catch (error) {
    console.log('error', error)
    sendAnalytics({ type: 'error', error, message: 'Could not parse favorite dApps' })
  }

  return favoriteDApps
}

export const storeFavoriteDApps = (favoriteDApps: string[]) =>
  storeWithReportableError(FAVORITE_DAPPS_KEY, JSON.stringify(favoriteDApps))
