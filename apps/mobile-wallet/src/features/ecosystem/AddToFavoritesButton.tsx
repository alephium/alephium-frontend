import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import { addFavoriteDApp, removeFavoriteDApp } from '~/features/ecosystem/favoriteDAppsActions'
import { selectIsDAppFavorite } from '~/features/ecosystem/favoriteDAppsSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

interface AddToFavoritesButtonProps {
  dAppName: string
}

const AddToFavoritesButton = ({ dAppName }: AddToFavoritesButtonProps) => {
  const isFavorite = useAppSelector((s) => selectIsDAppFavorite(s, dAppName))
  const theme = useTheme()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleFavoriteToggle = () => {
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

  return (
    <Button
      onPress={handleFavoriteToggle}
      iconProps={{ name: 'star' }}
      type="transparent"
      color={isFavorite ? theme.font.highlight : undefined}
    />
  )
}

export default AddToFavoritesButton
