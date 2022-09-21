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
import { ScrollView, Text, View } from 'react-native'

import AddressBadge from '../../components/AddressBadge'
import Amount from '../../components/Amount'
import Button from '../../components/buttons/Button'
import HighlightRow from '../../components/HighlightRow'
import Screen, { CenteredScreenSection, ScreenSection } from '../../components/layout/Screen'
import RootStackParamList from '../../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'ConfirmSendScreen'>

const ConfirmSendScreen = ({
  navigation,
  route: {
    params: { fromAddressHash, toAddressHash, amount, gasAmount, gasPrice, unsignedTxId, unsignedTransaction, fees }
  }
}: ScreenProps) => (
  <Screen>
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between'
      }}
    >
      <View>
        <ScreenSection>
          <HighlightRow title="From address" isTopRounded>
            <AddressBadge address={fromAddressHash} />
          </HighlightRow>
          <HighlightRow title="To address">
            <AddressBadge address={toAddressHash} />
          </HighlightRow>
          <HighlightRow title="Amount" isBottomRounded>
            <Amount value={BigInt(amount)} fullPrecision />
          </HighlightRow>
        </ScreenSection>
        <ScreenSection>
          <HighlightRow title="Est. fees" isTopRounded>
            <Amount value={fees} fullPrecision />
          </HighlightRow>
          <HighlightRow title="Total amount" isBottomRounded>
            <Amount value={BigInt(amount) + fees} fullPrecision />
          </HighlightRow>
        </ScreenSection>
        {gasAmount && gasPrice && (
          <ScreenSection>
            <HighlightRow title="Gas" isTopRounded>
              <Text>{gasAmount}</Text>
            </HighlightRow>
            <HighlightRow title="Gas price" isBottomRounded>
              <Amount value={BigInt(gasPrice)} fullPrecision />
            </HighlightRow>
          </ScreenSection>
        )}
      </View>
      <CenteredScreenSection>
        <Button title="Send" wide gradient />
      </CenteredScreenSection>
    </ScrollView>
  </Screen>
)

export default ConfirmSendScreen
