import { AnalyticsEvent } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { sendAnalytics } from '~/analytics'
import { dAppQuery } from '~/api/queries/dAppQueries'
import { addFavoriteDApp, removeFavoriteDApp } from '~/features/ecosystem/favoriteDApps/favoriteDAppsActions'
import { selectIsDAppFavorite } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const useToggleFavoriteDApp = (dAppName: string) => {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((s) => selectIsDAppFavorite(s, dAppName))

  const { data: dApp } = useQuery(dAppQuery(dAppName))

  const toggleFavorite = () => {
    const props = { dapp_name: dAppName, dapp_host: dApp?.links?.website }

    if (isFavorite) {
      dispatch(removeFavoriteDApp(dAppName))
      sendAnalytics({ event: AnalyticsEvent.REMOVED_DAPP_TO_FAVORITES, props })
    } else {
      dispatch(addFavoriteDApp(dAppName))
      sendAnalytics({ event: AnalyticsEvent.ADDED_DAPP_TO_FAVORITES, props })
    }
  }

  return {
    isFavorite,
    toggleFavorite
  }
}

export default useToggleFavoriteDApp
