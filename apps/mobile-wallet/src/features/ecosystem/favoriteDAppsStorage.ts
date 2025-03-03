import { sendAnalytics } from '~/analytics'
import { getWithReportableError, storeWithReportableError } from '~/persistent-storage/utils'

const FAVORITE_DAPPS_KEY = 'alephium_favorite_dapps'

export const getFavoriteDApps = async (): Promise<string[]> => {
  let favoriteDApps = null

  try {
    const rawFavoriteDApps = await getWithReportableError(FAVORITE_DAPPS_KEY)
    favoriteDApps = rawFavoriteDApps ? JSON.parse(rawFavoriteDApps) : []
  } catch (error) {
    console.log('error', error)
    sendAnalytics({ type: 'error', error, message: 'Could not parse favorite dApps' })
  }

  return favoriteDApps
}

export const storeFavoriteDApps = (favoriteDApps: string[]) =>
  storeWithReportableError(FAVORITE_DAPPS_KEY, JSON.stringify(favoriteDApps))
