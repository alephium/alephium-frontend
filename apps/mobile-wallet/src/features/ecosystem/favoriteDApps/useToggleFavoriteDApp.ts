import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { addFavoriteDApp, removeFavoriteDApp } from '~/features/ecosystem/favoriteDApps/favoriteDAppsActions'
import { selectIsDAppFavorite } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

const useToggleFavoriteDApp = (dAppName: string) => {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((s) => selectIsDAppFavorite(s, dAppName))
  const { t } = useTranslation()

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavoriteDApp(dAppName))
      showToast({
        text1: t('Removed from favorites')
      })
      sendAnalytics({ event: 'Removed dApp to favorites', props: { dAppName } })
    } else {
      dispatch(addFavoriteDApp(dAppName))
      showToast({
        text1: t('Added to favorites'),
        type: 'success'
      })
      sendAnalytics({ event: 'Added dApp to favorites', props: { dAppName } })
    }
  }

  return {
    isFavorite,
    toggleFavorite
  }
}

export default useToggleFavoriteDApp
