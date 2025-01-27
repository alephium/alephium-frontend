import { GestureResponderEvent } from 'react-native'
import styled from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'

interface QuickActionButtonProps extends ButtonProps {
  onActionCompleted?: () => void
}

const QuickActionButton = ({ onActionCompleted, ...props }: QuickActionButtonProps) => {
  const handlePress = (e: GestureResponderEvent) => {
    onActionCompleted?.()
    props.onPress?.(e)
  }

  return <QuickActionButtonStyled {...props} onPress={handlePress} />
}

export default QuickActionButton

const QuickActionButtonStyled = styled(Button)`
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.button.secondary};
`
