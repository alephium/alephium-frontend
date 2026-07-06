import { AnalyticsEvent } from '@alephium/shared'

import { sendAnalytics } from '~/analytics'
import { addFavoriteDApp, removeFavoriteDApp } from '~/features/ecosystem/favoriteDApps/favoriteDAppsActions'
import { selectIsDAppFavorite } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const useToggleFavoriteDApp = (dAppName: string) => {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((s) => selectIsDAppFavorite(s, dAppName))

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavoriteDApp(dAppName))
      sendAnalytics({ event: AnalyticsEvent.REMOVED_DAPP_TO_FAVORITES, props: { dapp_name: dAppName } })
    } else {
      dispatch(addFavoriteDApp(dAppName))
      sendAnalytics({ event: AnalyticsEvent.ADDED_DAPP_TO_FAVORITES, props: { dapp_name: dAppName } })
    }
  }

  return {
    isFavorite,
    toggleFavorite
  }
}

export default useToggleFavoriteDApp
