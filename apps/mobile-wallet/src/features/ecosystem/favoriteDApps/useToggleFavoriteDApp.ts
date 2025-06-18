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
      sendAnalytics({ event: 'Removed dApp to favorites', props: { dAppName } })
    } else {
      dispatch(addFavoriteDApp(dAppName))
      sendAnalytics({ event: 'Added dApp to favorites', props: { dAppName } })
    }
  }

  return {
    isFavorite,
    toggleFavorite
  }
}

export default useToggleFavoriteDApp
