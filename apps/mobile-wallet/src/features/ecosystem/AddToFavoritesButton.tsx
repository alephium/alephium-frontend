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
      iconProps={{ name: 'star' }}
      type="transparent"
      color={isFavorite ? theme.font.highlight : undefined}
      {...props}
    />
  )
}

export default AddToFavoritesButton
