/*
Copyright 2018 - 2022 The Alephium Authors
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
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'

interface SpinnerProps {
  text?: string
  fadedBg?: boolean
}

interface SpinnerModalProps extends SpinnerProps {
  isActive: boolean
}

const SpinnerModal = ({ isActive, text }: SpinnerModalProps) => (
  <ModalWithBackdrop animationType="fade" visible={isActive}>
    <Spinner fadedBg text={text} />
  </ModalWithBackdrop>
)

export default SpinnerModal

export const Spinner = ({ text }: SpinnerProps) => {
  const theme = useTheme()

  return (
    <SpinnerStyled>
      <ActivityIndicator size={80} color={theme.font.contrast} />
      {text && (
        <LoadingText semiBold size={16}>
          {text}
        </LoadingText>
      )}
    </SpinnerStyled>
  )
}

const SpinnerStyled = styled.View<{ fadedBg?: SpinnerProps['fadedBg'] }>`
  flex: 1
  width: 100%;
  background-color: ${({ theme, fadedBg }) =>
    fadedBg ? colord(theme.bg.contrast).alpha(0.3).toRgbString() : undefined};
  justify-content: center;
  align-items: center;
`

const LoadingText = styled(AppText)`
  margin-top: 20px;
  color: ${({ theme }) => theme.font.contrast};
`
