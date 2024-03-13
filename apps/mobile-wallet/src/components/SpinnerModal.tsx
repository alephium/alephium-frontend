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
import { BlurView } from 'expo-blur'
import { ActivityIndicator } from 'react-native'
import styled, { DefaultTheme, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'

type FontColor = keyof DefaultTheme['font']

interface SpinnerProps {
  text?: string
  bg?: 'faded' | 'full'
  color?: FontColor
}

interface SpinnerModalProps extends SpinnerProps {
  isActive: boolean
  blur?: boolean
}

const SpinnerModal = ({ isActive, text, blur = true, bg }: SpinnerModalProps) => {
  const theme = useTheme()

  return (
    <ModalWithBackdrop animationType="fade" visible={isActive}>
      {blur ? (
        <BlurView tint={theme.name} intensity={30} style={{ flex: 1, width: '100%' }}>
          <Spinner bg={bg} text={text} color="primary" />
        </BlurView>
      ) : (
        <Spinner bg={bg} text={text} color={theme.name === 'dark' ? 'primary' : 'contrast'} />
      )}
    </ModalWithBackdrop>
  )
}

export default SpinnerModal

export const Spinner = ({ text, color = 'tertiary', bg }: SpinnerProps) => {
  const theme = useTheme()

  return (
    <SpinnerStyled bg={bg}>
      <ActivityIndicator size={80} color={theme.font[color]} />
      {text && (
        <LoadingText semiBold size={16} color={color}>
          {text}
        </LoadingText>
      )}
    </SpinnerStyled>
  )
}

const SpinnerStyled = styled.View<{ bg?: SpinnerProps['bg'] }>`
  flex: 1;
  width: 100%;
  background-color: ${({ theme, bg }) =>
    bg === 'faded'
      ? colord(theme.bg.contrast).alpha(0.3).toRgbString()
      : bg === 'full'
        ? theme.bg.contrast
        : undefined};
  justify-content: center;
  align-items: center;
`

const LoadingText = styled(AppText)`
  margin-top: 20px;
`
