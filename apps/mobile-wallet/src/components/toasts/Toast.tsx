/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { AlertCircle, CheckCircle, InfoIcon, LucideIcon } from 'lucide-react-native'
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
      color: theme.header.visible
    }
  }

  const Icon = Icons[type].Icon
  const color = Icons[type].color

  return (
    <ToastContainer onPress={onPress}>
      <Gradient
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0.6, 1]}
        colors={[color, colord(color).alpha(0).toHex()]}
        style={{ height: 160 }}
        pointerEvents="none"
      />
      <ToastContent>
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
  background-color: ${({ theme }) => theme.bg.contrast};
`

const TextContainer = styled.View`
  justify-content: center;
  flex: 1;
  gap: 5px;
`

const Title = styled(AppText)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 16px;
  font-weight: 600;
`

const Subtitle = styled(AppText)`
  color: ${({ theme }) => theme.font.secondary};
`

const Gradient = styled(LinearGradient)`
  position: absolute;
  top: -50px;
  left: 0;
  right: 0;
`
