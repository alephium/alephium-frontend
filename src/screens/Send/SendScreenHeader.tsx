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

import { ChevronLeft } from 'lucide-react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import { useSendContext } from '~/contexts/SendContext'

const SendScreenHeader = () => {
  const theme = useTheme()
  const { isContinueEnabled, onBack, onContinue } = useSendContext()

  return (
    <SendScreenHeaderStyled>
      <BackButton onPress={onBack}>
        <ChevronLeft size={25} />
      </BackButton>
      <ProgressBar
        progress={0}
        color={theme.global.accent}
        unfilledColor={theme.border.secondary}
        borderWidth={0}
        height={9}
        width={120}
      />
      <ContinueButton onPress={onContinue} disabled={!isContinueEnabled}>
        <AppText color="contrast" semiBold size={16}>
          Continue
        </AppText>
      </ContinueButton>
    </SendScreenHeaderStyled>
  )
}

export default SendScreenHeader

const SendScreenHeaderStyled = styled(ScreenSection)`
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 16px;
  align-items: center;
`

const BackButton = styled.Pressable`
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: ${({ theme }) => theme.bg.secondary};
  align-items: center;
  justify-content: center;
`

const ContinueButton = styled.Pressable`
  padding: 4px 15px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 26px;
`
