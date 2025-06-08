import { useTheme } from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'
import useToggleFavoriteDApp from '~/features/ecosystem/favoriteDApps/useToggleFavoriteDApp'

interface AddToFavoritesButtonProps extends ButtonProps {
  dAppName: string
}

const AddToFavoritesButton = ({ dAppName, ...props }: AddToFavoritesButtonProps) => {
  const { isFavorite, toggleFavorite } = useToggleFavoriteDApp(dAppName)
  const theme = useTheme()

  return (
    <Button
      onPress={toggleFavorite}
      iconProps={{ name: isFavorite ? 'heart' : 'heart-outline' }}
      type="transparent"
      color={isFavorite ? theme.global.alert : undefined}
      {...props}
    />
  )
}

export default AddToFavoritesButton
