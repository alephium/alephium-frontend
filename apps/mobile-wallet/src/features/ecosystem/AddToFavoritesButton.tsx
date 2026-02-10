import { useTheme } from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'
import useToggleFavoriteCustomDApp from '~/features/ecosystem/favoriteDApps/useToggleFavoriteCustomDApp'
import useToggleFavoriteDApp from '~/features/ecosystem/favoriteDApps/useToggleFavoriteDApp'

interface AddToFavoritesButtonProps extends ButtonProps {
  dAppName: string
  dAppUrl?: string
}

const AddToFavoritesButton = ({ dAppName, dAppUrl, ...props }: AddToFavoritesButtonProps) => {
  const { isFavorite, toggleFavorite } = useToggleFavoriteDApp(dAppName)
  const { isFavoriteCustom, toggleFavoriteCustom } = useToggleFavoriteCustomDApp(dAppUrl ?? '')
  const theme = useTheme()

  const handlePress = !dAppName && !!dAppUrl ? toggleFavoriteCustom : toggleFavorite
  const isFav = isFavorite || isFavoriteCustom

  return (
    <Button
      onPress={handlePress}
      iconProps={{ name: isFav ? 'heart' : 'heart-outline' }}
      type="transparent"
      color={isFav ? theme.global.alert : undefined}
      {...props}
    />
  )
}

export default AddToFavoritesButton
