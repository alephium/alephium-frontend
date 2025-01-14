import Ionicons from '@expo/vector-icons/Feather'
import { colord } from 'colord'
import Animated, { LinearTransition } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button, { ButtonProps } from '~/components/buttons/Button'

interface ActionCardButtonCardButtonProps extends ButtonProps {}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

const ActionCardButton = ({ title, iconProps, color, variant, ...props }: ActionCardButtonCardButtonProps) => {
  const theme = useTheme()
  const usedColor = variant === 'alert' ? theme.global.alert : color || theme.global.accent

  return (
    <ButtonStyled
      flex
      {...props}
      style={{
        backgroundColor: !props.disabled ? colord(usedColor).alpha(0.1).toHex() : undefined
      }}
    >
      {iconProps && <AnimatedIonicons layout={LinearTransition} color={usedColor} size={22} {...iconProps} />}
      <AppText semiBold size={13} color={usedColor} style={{ textAlign: 'center' }}>
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
  background-color: ${({ theme }) => theme.bg.accent};

  ${({ disabled, theme }) =>
    disabled &&
    css`
      border: 1px solid ${theme.border.primary};
      background-color: transparent;
    `}
`
