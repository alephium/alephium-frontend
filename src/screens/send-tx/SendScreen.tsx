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

import {
  convertAlphToSet,
  formatAmountForDisplay,
  isAddressValid,
  MINIMAL_GAS_AMOUNT,
  MINIMAL_GAS_PRICE
} from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView } from 'react-native'
import { useTheme } from 'styled-components/native'

import client from '../../api/client'
import Amount from '../../components/Amount'
import AppText from '../../components/AppText'
import Button from '../../components/buttons/Button'
import ExpandableRow from '../../components/ExpandableRow'
import HighlightRow from '../../components/HighlightRow'
import AddressSelector from '../../components/inputs/AddressSelector'
import Input from '../../components/inputs/Input'
import {
  BottomModalScreenTitle,
  BottomScreenSection,
  ScreenSection,
  ScreenSectionTitle
} from '../../components/layout/Screen'
import { useAppSelector } from '../../hooks/redux'
import useDebouncedEffect from '../../hooks/useDebouncedEffect'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { selectAddressByHash } from '../../store/addressesSlice'
import { AddressHash } from '../../types/addresses'
import { isNumericStringValid } from '../../utils/numbers'

type ScreenProps = StackScreenProps<RootStackParamList, 'SendScreen'>

const SendScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const theme = useTheme()
  const mainAddress = useAppSelector((state) => state.addresses.mainAddress)
  const [fromAddressHash, setFromAddressHash] = useState<AddressHash>(addressHash ?? mainAddress)
  const fromAddress = useAppSelector((state) => selectAddressByHash(state, fromAddressHash))
  const [toAddressHash, setToAddressHash] = useState<string>('')
  const [amountString, setAmountString] = useState('')
  const [amount, setAmount] = useState(BigInt(0))
  const [fees, setFees] = useState<bigint>()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState('')
  const [gasAmount, setGasAmount] = useState('')
  const [gasPriceString, setGasPriceString] = useState('')
  const [gasPrice, setGasPrice] = useState<bigint>()
  const [isLoadingTxData, setIsLoadingTxData] = useState(false)

  const isFormDataComplete = amount > BigInt(0) && isAddressValid(toAddressHash) && isAddressValid(fromAddressHash)

  const gasAmountHasError = !!gasAmount && parseInt(gasAmount) < MINIMAL_GAS_AMOUNT
  const gasPriceHasError = !!gasPrice && gasPrice < MINIMAL_GAS_PRICE

  const handleAmountChange = (str: string) => isNumericStringValid(str) && setAmountString(str)
  const handleGasAmountChange = (str: string) => isNumericStringValid(str, false) && setGasAmount(str)
  const handleGasPriceChange = (str: string) => isNumericStringValid(str) && setGasPriceString(str)

  const buildTransaction = useCallback(() => {
    if (!fromAddress || !toAddressHash || !amountString) {
      setIsLoadingTxData(false)
      return
    }

    const createTransaction = async () => {
      try {
        const { data } = await client.cliqueClient.transactionCreate(
          fromAddress.hash,
          fromAddress.publicKey,
          toAddressHash,
          amount.toString(),
          undefined,
          gasAmount ? parseInt(gasAmount) : undefined,
          gasPrice?.toString() || undefined
        )
        setUnsignedTransaction(data.unsignedTx)
        setUnsignedTxId(data.txId)
        setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
        setIsLoadingTxData(false)
      } catch (e) {
        Alert.alert('Estimation error', (e as unknown as { error: { detail: string } }).error.detail)
      }
    }

    createTransaction()
  }, [amount, amountString, fromAddress, gasAmount, gasPrice, toAddressHash])

  useEffect(() => {
    try {
      setAmount(convertAlphToSet(amountString))
    } catch {
      setAmount(BigInt(0))
    }
  }, [amountString])

  useEffect(() => {
    try {
      setGasPrice(convertAlphToSet(gasPriceString))
    } catch {
      setGasPrice(undefined)
    }
  }, [gasPriceString])

  useDebouncedEffect(
    () => setIsLoadingTxData(true),
    () => buildTransaction(),
    [amount, gasPrice, gasAmount, toAddressHash],
    2000
  )

  return (
    <>
      <ScreenSection>
        <BottomModalScreenTitle>Send</BottomModalScreenTitle>
      </ScreenSection>
      <ScrollView>
        <ScreenSection>
          <AddressSelector
            label="From address"
            value={fromAddressHash}
            onValueChange={setFromAddressHash}
            isTopRounded
            hasBottomBorder
          />
          <Input label="To address" value={toAddressHash} onChangeText={setToAddressHash} hasBottomBorder />
          <Input
            label="Amount"
            value={amountString}
            onChangeText={handleAmountChange}
            isBottomRounded
            keyboardType="number-pad"
          />
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Summary</ScreenSectionTitle>
          <HighlightRow title="Est. fees" isTopRounded hasBottomBorder isSecondary>
            {isLoadingTxData ? (
              <ActivityIndicator size="large" color={theme.font.primary} />
            ) : fees ? (
              <Amount value={fees} fullPrecision />
            ) : (
              <AppText>-</AppText>
            )}
          </HighlightRow>
          <HighlightRow title="Total amount" isBottomRounded isSecondary>
            {isLoadingTxData ? (
              <ActivityIndicator size="large" color={theme.font.primary} />
            ) : (
              <Amount value={amount + BigInt(fees ?? 0)} fullPrecision bold color={theme.global.accent} />
            )}
          </HighlightRow>
        </ScreenSection>
        <ScreenSection>
          <ExpandableRow title="Tweak gas settings" expandedHeight={165}>
            <Input
              label="Gas"
              value={gasAmount}
              onChangeText={handleGasAmountChange}
              isTopRounded
              hasBottomBorder
              keyboardType="number-pad"
              error={gasAmountHasError ? `Gas must be at least ${MINIMAL_GAS_AMOUNT}` : ''}
            />
            <Input
              label="Gas price"
              value={gasPriceString}
              onChangeText={handleGasPriceChange}
              isBottomRounded
              hasBottomBorder
              keyboardType="number-pad"
              error={
                gasPriceHasError ? `Gas price must be at least ${formatAmountForDisplay(MINIMAL_GAS_PRICE, true)}` : ''
              }
            />
          </ExpandableRow>
        </ScreenSection>
        <BottomScreenSection>
          <Button
            title="Confirm"
            gradient
            onPress={() =>
              navigation.navigate('ConfirmSendScreen', {
                fromAddressHash,
                toAddressHash,
                amount: amount.toString(),
                gasAmount: gasAmount || undefined,
                gasPrice,
                unsignedTxId,
                unsignedTransaction,
                fees: fees ?? BigInt(0)
              })
            }
            wide
            disabled={isLoadingTxData || !isFormDataComplete || gasAmountHasError || gasPriceHasError}
          />
        </BottomScreenSection>
      </ScrollView>
    </>
  )
}

export default SendScreen
