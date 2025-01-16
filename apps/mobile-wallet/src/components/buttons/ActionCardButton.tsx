import Ionicons from '@expo/vector-icons/Feather'
import Animated, { LinearTransition } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button, { ButtonProps } from '~/components/buttons/Button'

interface ActionCardButtonCardButtonProps extends ButtonProps {}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

const ActionCardButton = ({ title, iconProps, color, ...props }: ActionCardButtonCardButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonStyled flex {...props}>
      {iconProps && (
        <AnimatedIonicons layout={LinearTransition} color={color || theme.font.primary} size={22} {...iconProps} />
      )}
      <AppText semiBold size={13} color={color} style={{ textAlign: 'center' }}>
        {title}
      </AppText>
    </ButtonStyled>
  )
}

export default ActionCardButton

const ButtonStyled = styled(Button)`
  flex-direction: column;
  gap: 4px;
  border-radius: 20px;
  height: 60px;
  padding: 0;

  ${({ disabled, theme }) =>
    disabled &&
    css`
      border: 1px solid ${theme.border.primary};
      background-color: transparent;
    `}
`
