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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { ArrowUp as ArrowUpIcon } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useTheme } from 'styled-components/native'
import client from '../../api/client'

import AddressBadge from '../../components/AddressBadge'
import Amount from '../../components/Amount'
import Button from '../../components/buttons/Button'
import HighlightRow from '../../components/HighlightRow'
import Screen, { CenteredScreenSection, ScreenSection } from '../../components/layout/Screen'
import { useAppSelector } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { selectAddressByHash } from '../../store/addressesSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'ConfirmSendScreen'>

const ConfirmSendScreen = ({
  navigation,
  route: {
    params: { fromAddressHash, toAddressHash, amount, gasAmount, gasPrice }
  }
}: ScreenProps) => {
  // TODO: Build tx to calculate fee
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState('')
  const [fees, setFees] = useState(BigInt(0))
  const theme = useTheme()
  const fromAddress = useAppSelector((state) => selectAddressByHash(state, fromAddressHash))

  const buildTransaction = useCallback(async () => {
    if (!fromAddress) return

    console.log('fromAddress.hash', fromAddress.hash)
    console.log('fromAddress.publicKey', fromAddress.publicKey)
    console.log('toAddressHash', toAddressHash)
    console.log('amount', amount)
    console.log('gasAmount', gasAmount)
    console.log('gasPrice', gasPrice || undefined)

    const { data } = await client.cliqueClient.transactionCreate(
      fromAddress.hash,
      fromAddress.publicKey,
      toAddressHash,
      amount,
      undefined,
      gasAmount ? parseInt(gasAmount) : undefined,
      gasPrice || undefined
    )
    setUnsignedTransaction(data.unsignedTx)
    setUnsignedTxId(data.txId)
    setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
  }, [amount, fromAddress, gasAmount, gasPrice, toAddressHash])

  useFocusEffect(
    useCallback(() => {
      try {
        buildTransaction()
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        // const { error } = e as APIError
        // if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
        //   setIsConsolidateUTXOsModalVisible(true)
        //   setConsolidationRequired(true)
        // } else {
        //   setSnackbarMessage({
        //     text: getHumanReadableError(e, t`Error while building the transaction`),
        //     type: 'alert',
        //     duration: 5000
        //   })
        // }
      }
    }, [buildTransaction])
  )

  return (
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
            <HighlightRow title="Amount">
              <Amount value={BigInt(amount)} fullPrecision />
            </HighlightRow>
            <HighlightRow title="Est. fees">
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
          <Button title="Send" icon={<ArrowUpIcon size={24} color={theme.font.contrast} />} wide gradient />
        </CenteredScreenSection>
      </ScrollView>
    </Screen>
  )
}

export default ConfirmSendScreen
