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
  formatAmountForDisplay,
  fromHumanReadableAmount,
  getHumanReadableError,
  MINIMAL_GAS_AMOUNT,
  MINIMAL_GAS_PRICE,
  toHumanReadableAmount
} from '@alephium/sdk'
import { node } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView } from 'react-native'
import Toast from 'react-native-root-toast'
import styled from 'styled-components/native'

import { buildSweepTransactions, buildUnsignedTransactions, signAndSendTransaction } from '../api/transactions'
import Amount from '../components/Amount'
import Button from '../components/buttons/Button'
import ConfirmWithAuthModal from '../components/ConfirmWithAuthModal'
import ConsolidationModal from '../components/ConsolidationModal'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import AddressSelector from '../components/inputs/AddressSelector'
import Input from '../components/inputs/Input'
import Screen, {
  BottomModalScreenTitle,
  BottomScreenSection,
  ScreenSection,
  ScreenSectionTitle
} from '../components/layout/Screen'
import SpinnerModal from '../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressByHash, selectDefaultAddress, transactionSent } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'
import { getAddressAvailableBalance } from '../utils/addresses'
import {
  validateIsAddressValid,
  validateIsNumericStringValid,
  validateOptionalIsNumericStringValid
} from '../utils/forms'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'SendScreen'>

type TxStep = 'build' | 'send'

type FormData = {
  fromAddressHash: AddressHash
  toAddressHash: AddressHash
  amountInAlph: string
  gasAmount: string
  gasPriceInAlph: string
}

type UnsignedTxData = {
  unsignedTxs: {
    txId: node.BuildTransactionResult['txId'] | node.SweepAddressTransaction['txId']
    unsignedTx: node.BuildTransactionResult['unsignedTx'] | node.SweepAddressTransaction['unsignedTx']
  }[]
  fees: bigint
}

const requiredErrorMessage = 'This field is required'

const SendScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const requiresAuth = useAppSelector((state) => state.settings.requireAuth)
  const dispatch = useAppDispatch()

  const defaultAddress = useAppSelector(selectDefaultAddress)
  const fromAddressHash = addressHash ?? defaultAddress?.hash
  const defaultValues = { fromAddressHash, toAddressHash: '', amountInAlph: '', gasAmount: '', gasPriceInAlph: '' }
  const { control, watch, handleSubmit, setValue, formState } = useForm<FormData>({ defaultValues })
  const { fromAddressHash: formFromAddress, toAddressHash, gasAmount, amountInAlph, gasPriceInAlph } = watch()
  const fromAddress = useAppSelector((state) => selectAddressByHash(state, formFromAddress))

  const [amount, setAmount] = useState(BigInt(0))
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isConsolidateModalVisible, setIsConsolidateModalVisible] = useState(false)
  const [isAuthenticationModalVisible, setIsAuthenticationModalVisible] = useState(false)
  const [txStep, setTxStep] = useState<TxStep>('build')
  const [isLoading, setIsLoading] = useState(false)
  const [unsignedTxData, setUnsignedTxData] = useState<UnsignedTxData>({
    unsignedTxs: [],
    fees: BigInt(0)
  })

  const errors = formState.errors
  const isFormValid = isEmpty(errors)
  const totalAmount = BigInt(amount + unsignedTxData?.fees) // 🚨 TODO: Operations with BigInt give inaccurate results. Use `.plus` method of 'big-integer' instead
  const loadingMessage = {
    build: 'Calculating fees...',
    send: 'Sending...'
  }[txStep]

  const validateOptionalMinGasAmount = (value: string) =>
    !value || parseInt(value) >= MINIMAL_GAS_AMOUNT || `Gas must be at least ${MINIMAL_GAS_AMOUNT}`
  const validateOptionalMinGasPrice = (value: string) =>
    !value ||
    fromHumanReadableAmount(value) >= MINIMAL_GAS_PRICE ||
    `Gas price must be at least ${formatAmountForDisplay({ amount: MINIMAL_GAS_PRICE, fullPrecision: true })}`

  useEffect(() => setTxStep('build'), [fromAddress, toAddressHash, amountInAlph, gasAmount, gasPriceInAlph])

  const buildConsolidationTransactions = useCallback(async () => {
    if (!fromAddress) return

    setIsLoading(true)

    try {
      const data = await buildSweepTransactions(fromAddress, fromAddress.hash)
      setUnsignedTxData(data)
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Error while building the transaction'))
    } finally {
      setIsLoading(false)
    }
  }, [fromAddress])

  const buildTransaction = useCallback(
    async (formData: FormData) => {
      if (!fromAddress?.hash || !isFormValid) return

      setIsLoading(true)
      const gasPriceInSet = formData.gasPriceInAlph ? fromHumanReadableAmount(formData.gasPriceInAlph) : undefined

      const amountInSet = fromHumanReadableAmount(formData.amountInAlph)

      setAmount(amountInSet)

      try {
        const toAddressHash = formData.toAddressHash
        const data = await buildUnsignedTransactions(fromAddress, toAddressHash, amountInSet, gasAmount, gasPriceInSet)
        setUnsignedTxData(data)
        setTxStep('send')
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        const { error } = e as APIError
        if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
          setConsolidationRequired(true)
          setIsConsolidateModalVisible(true)
          await buildConsolidationTransactions()
        } else {
          Toast.show(getHumanReadableError(e, 'Error while building the transaction'))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [buildConsolidationTransactions, fromAddress, gasAmount, isFormValid]
  )

  const sendTransaction = useCallback(async () => {
    if (!fromAddress?.hash) return

    setIsLoading(true)

    try {
      for (const { txId, unsignedTx } of unsignedTxData.unsignedTxs) {
        const data = await signAndSendTransaction(fromAddress, txId, unsignedTx)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: fromAddress.hash,
            toAddress: consolidationRequired ? fromAddress.hash : toAddressHash,
            timestamp: new Date().getTime(),
            amount: amount.toString(),
            status: 'pending'
          })
        )
      }

      navigation.navigate('TransfersScreen')
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Could not send transaction'))
    } finally {
      setIsLoading(false)
    }
  }, [amount, consolidationRequired, dispatch, fromAddress, navigation, toAddressHash, unsignedTxData.unsignedTxs])

  const authenticateAndSend = useCallback(async () => {
    if (requiresAuth) {
      setIsAuthenticationModalVisible(true)
    } else {
      sendTransaction()
    }
  }, [requiresAuth, sendTransaction])

  const handleUseMaxAmountPress = useCallback(() => {
    if (!fromAddress) return

    setValue('amountInAlph', toHumanReadableAmount(getAddressAvailableBalance(fromAddress)))
  }, [fromAddress, setValue])

  return (
    <Screen>
      <ScrollView>
        <MainContent>
          <>
            <ScreenSection>
              <BottomModalScreenTitle>Send</BottomModalScreenTitle>
            </ScreenSection>
            <ScreenSection>
              <Controller
                name="fromAddressHash"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AddressSelector
                    label="From address"
                    value={value}
                    onValueChange={onChange}
                    onBlur={onBlur}
                    error={
                      errors.fromAddressHash?.type === 'required'
                        ? requiredErrorMessage
                        : errors.fromAddressHash?.message
                    }
                  />
                )}
                rules={{
                  required: true,
                  validate: validateIsAddressValid
                }}
                control={control}
              />

              <Controller
                name="toAddressHash"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="To address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={
                      errors.toAddressHash?.type === 'required' ? requiredErrorMessage : errors.toAddressHash?.message
                    }
                  />
                )}
                rules={{
                  required: true,
                  validate: validateIsAddressValid
                }}
                control={control}
              />
              <Controller
                name="amountInAlph"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Amount"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    error={
                      errors.amountInAlph?.type === 'required' ? requiredErrorMessage : errors.amountInAlph?.message
                    }
                    RightContent={
                      <UseMaxButton
                        title="Use max"
                        onPress={handleUseMaxAmountPress}
                        type="transparent"
                        variant="accent"
                      />
                    }
                  />
                )}
                rules={{
                  required: true,
                  validate: validateIsNumericStringValid
                }}
                control={control}
              />
            </ScreenSection>
            <ScreenSection>
              <ExpandableRow title="Tweak gas settings" expandedHeight={165}>
                <Controller
                  control={control}
                  rules={{
                    validate: {
                      validateOptionalIsNumericStringValid,
                      validateOptionalMinGasAmount
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Gas"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      error={errors.gasAmount?.message}
                    />
                  )}
                  name="gasAmount"
                />
                <Controller
                  control={control}
                  rules={{
                    validate: {
                      validateOptionalIsNumericStringValid,
                      validateOptionalMinGasPrice
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Gas price"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      error={errors.gasPriceInAlph?.message}
                    />
                  )}
                  name="gasPriceInAlph"
                />
              </ExpandableRow>
            </ScreenSection>
            {txStep === 'send' && unsignedTxData.fees && totalAmount && (
              <ScreenSection>
                <ScreenSectionTitle>Summary</ScreenSectionTitle>
                <HighlightRow title="Expected fee" isSecondary>
                  <Amount value={unsignedTxData.fees} fullPrecision />
                </HighlightRow>
                <HighlightRow title="Total amount" isSecondary>
                  <Amount value={totalAmount} fullPrecision bold color="accent" />
                </HighlightRow>
              </ScreenSection>
            )}
          </>
        </MainContent>
        <BottomScreenSection>
          <Button
            title={txStep === 'build' ? 'Continue' : 'Confirm'}
            onPress={txStep === 'build' ? handleSubmit(buildTransaction) : authenticateAndSend}
            wide
            disabled={isLoading || !isFormValid}
          />
        </BottomScreenSection>

        {isConsolidateModalVisible && (
          <ConsolidationModal
            onConsolidate={authenticateAndSend}
            onCancel={() => setIsConsolidateModalVisible(false)}
            fees={unsignedTxData.fees}
          />
        )}
        {isAuthenticationModalVisible && <ConfirmWithAuthModal onConfirm={sendTransaction} />}
      </ScrollView>
      <SpinnerModal isActive={isLoading} text={loadingMessage} />
    </Screen>
  )
}

export default SendScreen

const MainContent = styled.View`
  flex: 1;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const UseMaxButton = styled(Button)`
  padding-right: 0;
`
