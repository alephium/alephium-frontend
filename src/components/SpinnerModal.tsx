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

interface SpinnerModalProps {
  isActive: boolean
  text?: string
}

const SpinnerModal = ({ isActive, text }: SpinnerModalProps) => {
  const theme = useTheme()

  return (
    <ModalWithBackdrop animationType="fade" visible={isActive}>
      <SpinnerContainer>
        <ActivityIndicator size={80} color={theme.font.contrast} />
        {text && (
          <LoadingText semiBold size={16}>
            {text}
          </LoadingText>
        )}
      </SpinnerContainer>
    </ModalWithBackdrop>
  )
}

export default SpinnerModal

const SpinnerContainer = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${({ theme }) => colord(theme.bg.contrast).alpha(0.3).toRgbString()};
  justify-content: center;
  align-items: center;
`

const LoadingText = styled(AppText)`
  margin-top: 20px;
  color: ${({ theme }) => theme.font.contrast};
`
