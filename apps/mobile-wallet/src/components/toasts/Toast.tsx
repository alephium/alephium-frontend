import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { AlertCircle, CheckCircle, InfoIcon, LucideIcon } from 'lucide-react-native'
import { useState } from 'react'
import { LayoutChangeEvent } from 'react-native'
import { ToastConfigParams, ToastType } from 'react-native-toast-message'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

const Toast = ({
  type,
  text1,
  text2,
  onPress
}: Pick<ToastConfigParams<unknown>, 'text1' | 'text2' | 'onPress' | 'type'>) => {
  const theme = useTheme()
  const [subtitleHeight, setSubtitleHeight] = useState(0)

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

  const handleSubtitleLayout = (e: LayoutChangeEvent) => setSubtitleHeight(e.nativeEvent.layout.height)

  return (
    <ToastContainer onPress={onPress}>
      <Gradient
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0.7, 1]}
        colors={[color, colord(color).alpha(0).toHex()]}
        style={{ height: 160 + (text2 ? subtitleHeight : 0) }}
        pointerEvents="none"
      />
      <ToastContent>
        <IconContainer>
          <Icon color={color} />
        </IconContainer>
        <TextContainer>
          <Title>{text1}</Title>
          {text2 && <Subtitle onLayout={handleSubtitleLayout}>{text2}</Subtitle>}
        </TextContainer>
      </ToastContent>
    </ToastContainer>
  )
}

export default Toast

const ToastContainer = styled.Pressable`
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
`

const ToastContent = styled.View`
  flex-direction: row;
  padding: 20px;
  gap: 16px;
`

const IconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 40px;
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

const Gradient = styled(LinearGradient)`
  position: absolute;
  top: -50px;
  left: 0;
  right: 0;
`
