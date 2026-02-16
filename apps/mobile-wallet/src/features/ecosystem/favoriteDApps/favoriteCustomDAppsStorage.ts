import { sendAnalytics } from '~/analytics'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const FAVORITE_DAPPS_KEY = 'alephium_favorite_custom_dapps'

export const getFavoriteCustomDApps = (): Array<string> => {
  let favoriteDApps = null

  try {
    const rawFavoriteDApps = storage.getString(FAVORITE_DAPPS_KEY)
    favoriteDApps = rawFavoriteDApps ? JSON.parse(rawFavoriteDApps) : []
  } catch (error) {
    console.log('error', error)
    sendAnalytics({ type: 'error', error, message: 'Could not parse favorite custom dApps' })
  }

  return favoriteDApps
}

export const storeFavoriteCustomDApps = (favoriteDApps: string[]) =>
  storeWithReportableError(FAVORITE_DAPPS_KEY, JSON.stringify(favoriteDApps))
