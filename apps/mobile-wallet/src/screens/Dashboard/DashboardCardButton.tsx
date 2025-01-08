import Ionicons from '@expo/vector-icons/Feather'
import Animated, { LinearTransition } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button, { ButtonProps } from '~/components/buttons/Button'

interface DashboardCardButtonProps extends ButtonProps {}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

const DashboardCardButton = ({ title, iconProps, ...props }: DashboardCardButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonStyled variant="contrast" squared flex {...props}>
      {iconProps && <AnimatedIonicons layout={LinearTransition} color={theme.font.contrast} size={22} {...iconProps} />}
      <AppText color="contrast" semiBold size={12}>
        {title}
      </AppText>
    </ButtonStyled>
  )
}

export default DashboardCardButton

const ButtonStyled = styled(Button)`
  flex-direction: column;
  gap: 2px;
`
