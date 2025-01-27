import { useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'
import useToggleFavoriteDApp from '~/features/ecosystem/favoriteDApps/useToggleFavoriteDApp'

interface AddToFavoritesButtonProps {
  dAppName: string
}

const AddToFavoritesButton = ({ dAppName }: AddToFavoritesButtonProps) => {
  const { isFavorite, toggleFavorite } = useToggleFavoriteDApp(dAppName)
  const theme = useTheme()

  return (
    <Button
      onPress={toggleFavorite}
      iconProps={{ name: 'star' }}
      type="transparent"
      color={isFavorite ? theme.font.highlight : undefined}
    />
  )
}

export default AddToFavoritesButton
