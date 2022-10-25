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
  APIError,
  convertAlphToSet,
  formatAmountForDisplay,
  isAddressValid,
  MINIMAL_GAS_AMOUNT,
  MINIMAL_GAS_PRICE
} from '@alephium/sdk'
import { SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { StackScreenProps } from '@react-navigation/stack'
import { Codesandbox } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import Toast from 'react-native-root-toast'
import styled, { useTheme } from 'styled-components/native'

import client from '../api/client'
import Amount from '../components/Amount'
import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import InfoBox from '../components/InfoBox'
import AddressSelector from '../components/inputs/AddressSelector'
import Input from '../components/inputs/Input'
import Screen, {
  BottomModalScreenTitle,
  BottomScreenSection,
  ScreenSection,
  ScreenSectionTitle
} from '../components/layout/Screen'
import ModalWithBackdrop from '../components/ModalWithBackdrop'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { addPendingTransactionToAddress, selectAddressByHash } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'
import { isNumericStringValid } from '../utils/numbers'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'SendScreen'>

type TxStep = 'build' | 'send'

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
  const [fees, setFees] = useState<bigint>(BigInt(0))
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState('')
  const [gasAmount, setGasAmount] = useState('')
  const [gasPriceString, setGasPriceString] = useState('')
  const [gasPrice, setGasPrice] = useState<bigint>()
  const [isLoading, setIsLoading] = useState(false)
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const dispatch = useAppDispatch()
  const [txStep, setTxStep] = useState<TxStep>('build')
  const totalAmount = amount + fees

  const isFormDataComplete = amount > BigInt(0) && isAddressValid(toAddressHash) && isAddressValid(fromAddressHash)

  const gasAmountHasError = !!gasAmount && parseInt(gasAmount) < MINIMAL_GAS_AMOUNT
  const gasPriceHasError = !!gasPrice && gasPrice < MINIMAL_GAS_PRICE

  const handleAmountChange = (str: string) => isNumericStringValid(str) && setAmountString(str)
  const handleGasAmountChange = (str: string) => isNumericStringValid(str, false) && setGasAmount(str)
  const handleGasPriceChange = (str: string) => isNumericStringValid(str) && setGasPriceString(str)

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

  useEffect(() => {
    if (txStep === 'send') setTxStep('build')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAddress, toAddressHash, amount, gasAmount, gasPrice])

  const buildConsolidationTransactions = useCallback(async () => {
    if (!fromAddress) return

    setIsSweeping(true)
    setIsLoading(true)

    const { unsignedTxs, fees } = await client.buildSweepTransactions(fromAddress, fromAddress.hash)

    setSweepUnsignedTxs(unsignedTxs)
    setFees(fees)
    setIsLoading(false)
  }, [fromAddress])

  const buildTransaction = useCallback(async () => {
    if (!fromAddress || !toAddressHash || !amountString) return

    setIsLoading(true)

    const isSweep = amount === BigInt(fromAddress.networkData.availableBalance)
    setIsSweeping(isSweep)

    try {
      if (isSweep) {
        const { unsignedTxs, fees } = await client.buildSweepTransactions(fromAddress, toAddressHash)
        setSweepUnsignedTxs(unsignedTxs)
        setFees(fees)
      } else {
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
      }

      setTxStep('send')
    } catch (e) {
      // TODO: When API error codes are available, replace this substring check with a proper error code check
      const { error } = e as APIError
      if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
        setConsolidationRequired(true)
        setIsSweeping(true)
        setIsConsolidateUTXOsModalVisible(true)
        await buildConsolidationTransactions()
      } else {
        Toast.show('Error while building the transaction')
      }
    } finally {
      setIsLoading(false)
    }
  }, [amount, amountString, buildConsolidationTransactions, fromAddress, gasAmount, gasPrice, toAddressHash])

  const sendTransaction = useCallback(async () => {
    if (!fromAddress) return

    setIsLoading(true)

    try {
      if (isSweeping) {
        for (const { txId, unsignedTx } of sweepUnsignedTxs) {
          client.signAndSendTransaction(fromAddress, txId, unsignedTx)

          dispatch(
            addPendingTransactionToAddress({
              hash: txId,
              fromAddress: fromAddressHash,
              toAddress: consolidationRequired ? fromAddressHash : toAddressHash,
              timestamp: new Date().getTime(),
              amount: amount.toString(),
              status: 'pending'
            })
          )
        }
      } else {
        client.signAndSendTransaction(fromAddress, unsignedTxId, unsignedTransaction)

        dispatch(
          addPendingTransactionToAddress({
            hash: unsignedTxId,
            fromAddress: fromAddressHash,
            toAddress: toAddressHash,
            timestamp: new Date().getTime(),
            amount: amount.toString(),
            status: 'pending'
          })
        )
      }
      navigation.navigate('TransfersScreen')
    } catch (e) {
      Alert.alert('Could not send transaction', (e as unknown as { error: { detail: string } }).error.detail)
    }
    setIsLoading(false)
  }, [
    amount,
    consolidationRequired,
    dispatch,
    fromAddress,
    fromAddressHash,
    isSweeping,
    navigation,
    sweepUnsignedTxs,
    toAddressHash,
    unsignedTransaction,
    unsignedTxId
  ])

  return (
    <Screen>
      <ScrollView>
        <MainContent>
          <>
            <ScreenSection>
              <BottomModalScreenTitle>Send</BottomModalScreenTitle>
            </ScreenSection>
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
                    gasPriceHasError
                      ? `Gas price must be at least ${formatAmountForDisplay(MINIMAL_GAS_PRICE, true)}`
                      : ''
                  }
                />
              </ExpandableRow>
            </ScreenSection>
            {txStep === 'send' && !isLoading && fees && totalAmount && (
              <ScreenSection>
                <ScreenSectionTitle>Summary</ScreenSectionTitle>
                <HighlightRow title="Expected fee" isTopRounded hasBottomBorder isSecondary>
                  <Amount value={fees} fullPrecision />
                </HighlightRow>
                <HighlightRow title="Total amount" isBottomRounded isSecondary>
                  <Amount value={totalAmount} fullPrecision bold color={theme.global.accent} />
                </HighlightRow>
              </ScreenSection>
            )}
          </>
        </MainContent>
        <BottomScreenSection>
          <Button
            title={txStep === 'build' ? 'Continue' : 'Confirm'}
            gradient
            onPress={txStep === 'build' ? buildTransaction : sendTransaction}
            wide
            disabled={isLoading || !isFormDataComplete || gasAmountHasError || gasPriceHasError}
          />
        </BottomScreenSection>
        <ModalWithBackdrop
          animationType="fade"
          visible={isConsolidateUTXOsModalVisible}
          closeModal={() => setIsConsolidateUTXOsModalVisible(false)}
        >
          <ConsolidationModalContent>
            <ScreenSectionStyled fill>
              <InfoBox title="Action to take" Icon={Codesandbox} iconColor="#64f6c2">
                <View>
                  <AppText>
                    It appers that the address you use to send funds from has too many UTXOs! Would you like to
                    consolidate them? This will cost as small fee.
                  </AppText>
                  <Fee>
                    <Amount prefix="Fee:" value={fees} fullPrecision fadeDecimals bold />
                  </Fee>
                </View>
              </InfoBox>
            </ScreenSectionStyled>
            <BottomScreenSection>
              <ButtonsRow>
                <Button title="Cancel" onPress={() => setIsConsolidateUTXOsModalVisible(false)} />
                <Button title="Consolidate" onPress={sendTransaction} />
              </ButtonsRow>
            </BottomScreenSection>
          </ConsolidationModalContent>
        </ModalWithBackdrop>
      </ScrollView>
    </Screen>
  )
}

export default SendScreen

const ConsolidationModalContent = styled.View`
 flex: 1
 width: 100%;
 background-color: ${({ theme }) => theme.bg.primary};
`

const MainContent = styled.View`
  flex: 1;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const ScreenSectionStyled = styled(ScreenSection)`
  align-items: center;
  justify-content: center;
`

const Fee = styled(AppText)`
  display: flex;
  margin-top: 20px;
`
