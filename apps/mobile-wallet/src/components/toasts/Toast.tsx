import { colord } from 'colord'
import { AlertCircle, CheckCircle, InfoIcon, LucideIcon } from 'lucide-react-native'
import { ToastConfigParams, ToastType } from 'react-native-toast-message'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS, DEFAULT_MARGIN } from '~/style/globalStyle'

const Toast = ({
  type,
  text1,
  text2,
  onPress
}: Pick<ToastConfigParams<unknown>, 'text1' | 'text2' | 'onPress' | 'type'>) => {
  const theme = useTheme()

  const Icons: Record<ToastType, { color: string; Icon: LucideIcon }> = {
    success: {
      Icon: CheckCircle,
      color: theme.global.valid
    },
    error: {
      Icon: AlertCircle,
      color: theme.global.alert
    },
    info: {
      Icon: InfoIcon,
      color: theme.global.accent
    }
  }

  const Icon = Icons[type].Icon
  const color = Icons[type].color

  return (
    <ToastContainer onPress={onPress}>
      <ToastContent
        style={{
          backgroundColor: colord(color).alpha(0.95).toHex(),
          borderColor: color,
          borderWidth: 1
        }}
      >
        <IconContainer>
          <Icon color={color} />
        </IconContainer>
        <TextContainer>
          <Title>{text1}</Title>
          {text2 && <Subtitle>{text2}</Subtitle>}
        </TextContainer>
      </ToastContent>
    </ToastContainer>
  )
}

export default Toast

const ToastContainer = styled.Pressable`
  position: absolute;
  top: 0px;
  padding: 0 ${DEFAULT_MARGIN}px;
  width: 100%;
  z-index: 10;
`

const ToastContent = styled.View`
  flex-direction: row;
  padding: ${DEFAULT_MARGIN}px;
  gap: 16px;
  border-radius: ${BORDER_RADIUS}px;
  align-items: center;
`

const IconContainer = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
`

const TextContainer = styled.View`
  justify-content: center;
  flex: 1;
  gap: 5px;
`

const Title = styled(AppText)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
`

const Subtitle = styled(AppText)`
  color: rgba(255, 255, 255, 0.8);
`
