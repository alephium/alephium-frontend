import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, { LinearTransition } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button, { ButtonProps } from '~/components/buttons/Button'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'

interface ActionCardButtonCardButtonProps extends ButtonProps {}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

const ActionCardButton = ({ title, iconProps, color, ...props }: ActionCardButtonCardButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonStyled flex variant="accent" {...props}>
      {iconProps && (
        <AnimatedIonicons layout={LinearTransition} color={color || theme.global.accent} size={22} {...iconProps} />
      )}
      <AppText semiBold size={13} color={color || theme.global.accent} style={{ textAlign: 'center' }}>
        {title}
      </AppText>
    </ButtonStyled>
  )
}

export default ActionCardButton

const ButtonStyled = styled(Button)`
  flex-direction: column;
  gap: 4px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  height: 60px;
  padding: 0;

  ${({ disabled, theme }) =>
    disabled &&
    css`
      border: 1px solid ${theme.border.primary};
      background-color: transparent;
    `}
`
