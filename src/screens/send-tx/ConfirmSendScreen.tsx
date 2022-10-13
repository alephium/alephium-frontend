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
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text } from 'react-native'
import { useTheme } from 'styled-components/native'

import client from '../../api/client'
import AddressBadge from '../../components/AddressBadge'
import Amount from '../../components/Amount'
import Button from '../../components/buttons/Button'
import HighlightRow from '../../components/HighlightRow'
import { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '../../components/layout/Screen'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import InWalletTabsParamList from '../../navigation/inWalletRoutes'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { addTransactionToAddress, selectAddressByHash } from '../../store/addressesSlice'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'ConfirmSendScreen'>

const ConfirmSendScreen = ({
  navigation,
  route: {
    params: { fromAddressHash, toAddressHash, amount, gasAmount, gasPrice, unsignedTxId, unsignedTransaction, fees }
  }
}: ScreenProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const fromAddress = useAppSelector((state) => selectAddressByHash(state, fromAddressHash))
  const [isSending, setIsSending] = useState(false)

  const handleSend = useCallback(async () => {
    if (!fromAddress) return

    setIsSending(true)

    try {
      const signature = client.cliqueClient.transactionSign(unsignedTxId, fromAddress.privateKey)
      await client.cliqueClient.transactionSend(fromAddress.hash, unsignedTransaction, signature)
      dispatch(
        addTransactionToAddress({
          hash: unsignedTxId,
          inputs: [{ outputRef: { hint: -1, key: '' }, address: fromAddressHash, attoAlphAmount: amount }],
          outputs: [{ hint: -1, key: '', type: '', address: toAddressHash, attoAlphAmount: amount }],
          timestamp: new Date().getTime(),
          gasAmount: gasAmount ? parseInt(gasAmount) : 0,
          gasPrice: gasPrice ? gasPrice.toString() : '',
          blockHash: ''
        })
      )
      navigation.navigate('TransfersScreen')
    } catch (e) {
      Alert.alert('Send error', (e as unknown as { error: { detail: string } }).error.detail)
    }
    setIsSending(false)
  }, [
    fromAddress,
    amount,
    dispatch,
    fromAddressHash,
    gasAmount,
    gasPrice,
    navigation,
    toAddressHash,
    unsignedTransaction,
    unsignedTxId
  ])

  return (
    <>
      <ScreenSection>
        <BottomModalScreenTitle>Review</BottomModalScreenTitle>
      </ScreenSection>
      <ScrollView>
        <>
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
        </>
      </ScrollView>
      <BottomScreenSection>
        <Button
          onPress={handleSend}
          title={isSending ? 'Sending' : 'Send'}
          disabled={isSending}
          wide
          gradient
          icon={isSending ? <ActivityIndicator size="large" color={theme.font.primary} /> : null}
        />
      </BottomScreenSection>
    </>
  )
}

export default ConfirmSendScreen
