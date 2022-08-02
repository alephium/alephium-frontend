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

import { StackScreenProps } from '@react-navigation/stack'
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from 'lucide-react-native'
import { ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import BalanceSummary from '../components/BalanceSummary'
import Button from '../components/buttons/Button'
import Screen from '../components/layout/Screen'
import TransactionsList from '../components/TransactionsList'
import { useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import { selectAddressIds } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

type ScreenProps = StackScreenProps<InWalletTabsParamList, 'TransfersScreen'> & {
  style?: StyleProp<ViewStyle>
}

const TransfersScreen = ({ navigation, style }: ScreenProps) => {
  const theme = useTheme()
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]

  return (
    <Screen style={style}>
      <ScrollView>
        <ScreenSection>
          <BalanceSummary />
          <Buttons>
            <SendButton>
              <ArrowUpIcon size={24} color={theme.font.contrast} />
              <ButtonText>Send</ButtonText>
            </SendButton>
            <ReceiveButton>
              <ArrowDownIcon size={24} color={theme.font.contrast} />
              <ButtonText>Receive</ButtonText>
            </ReceiveButton>
          </Buttons>
        </ScreenSection>
        <ScreenSection>
          <TransactionsList addressHashes={addressHashes} />
        </ScreenSection>
      </ScrollView>
    </Screen>
  )
}

export default styled(TransfersScreen)`
  padding-top: 30px;
`

const Buttons = styled.View`
  display: flex;
  flex-direction: row;
`
const IconedButton = styled(Button)`
  flex-direction: row;
`

const SendButton = styled(IconedButton)`
  flex: 1;
  margin-right: 5px;
`

const ReceiveButton = styled(IconedButton)`
  flex: 1;
  margin-left: 5px;
`

const ButtonText = styled(Text)`
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  margin-left: 10px;
`

const ScreenSection = styled(View)`
  padding: 22px 20px;

  border-bottom-color: ${({ theme }) => theme.border.secondary};
  border-bottom-width: 1px;
`
