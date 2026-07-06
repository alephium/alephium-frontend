import { AnalyticsEvent } from '@alephium/shared'

import { sendAnalytics } from '~/analytics'
import {
  addFavoriteCustomDApp,
  removeFavoriteCustomDApp
} from '~/features/ecosystem/favoriteDApps/favoriteDAppsActions'
import { selectIsCustomDAppFavorite } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const useToggleFavoriteCustomDApp = (dAppUrl: string) => {
  const dispatch = useAppDispatch()
  const isFavoriteCustom = useAppSelector((s) => selectIsCustomDAppFavorite(s, dAppUrl))

  const toggleFavoriteCustom = () => {
    if (isFavoriteCustom) {
      dispatch(removeFavoriteCustomDApp(dAppUrl))
      sendAnalytics({ event: AnalyticsEvent.REMOVED_DAPP_TO_FAVORITES, props: { dapp_url: dAppUrl } })
    } else {
      dispatch(addFavoriteCustomDApp(dAppUrl))
      sendAnalytics({ event: AnalyticsEvent.ADDED_DAPP_TO_FAVORITES, props: { dapp_url: dAppUrl } })
    }
  }

  return {
    isFavoriteCustom,
    toggleFavoriteCustom
  }
}

export default useToggleFavoriteCustomDApp
