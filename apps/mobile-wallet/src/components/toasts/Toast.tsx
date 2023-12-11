/*
Copyright 2018 - 2023 The Alephium Authors
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
import { AlertCircle, CheckCircle, Icon, InfoIcon } from 'lucide-react-native'
import { ToastType } from 'react-native-toast-message'
import { useTheme } from 'styled-components'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'

interface ToastProps {
  type: ToastType
  text1?: string
  text2?: string
}

const Toast = ({ type, text1, text2 }: ToastProps) => {
  const theme = useTheme()

  const Icons: Record<ToastType, { color: string; Icon: Icon }> = {
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

  return (
    <ToastContainer>
      <IconContainer>
        <Icon />
      </IconContainer>
      <TextContainer>
        <Title>{text1}</Title>
        {text2 && <Subtitle>{text2}</Subtitle>}
      </TextContainer>
    </ToastContainer>
  )
}

export default Toast

const ToastContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.bg.contrast};
  padding: 15px 20px;
  width: 85%;
  border-radius: 8px;
`

const IconContainer = styled.View`
  width: 50px;
`

const TextContainer = styled.View`
  justify-content: center;
  flex: 1;
`

const Title = styled(AppText)`
  color: ${({ theme }) => theme.font.contrast};
`

const Subtitle = styled(AppText)`
  color: ${({ theme }) => colord(theme.font.contrast).alpha(0.7).toHex()};
`
