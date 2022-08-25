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

import { BILLION, convertAlphToSet, formatAmountForDisplay } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { ArrowRight as ArrowRightIcon } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useTheme } from 'styled-components/native'

import Button from '../../components/buttons/Button'
import ExpandableRow from '../../components/ExpandableRow'
import AddressSelector from '../../components/inputs/AddressSelector'
import Input from '../../components/inputs/Input'
import Screen, { CenteredScreenSection, ScreenSection } from '../../components/layout/Screen'
import { useAppSelector } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { AddressHash } from '../../types/addresses'
import { isNumericStringValid } from '../../utils/numbers'

type ScreenProps = StackScreenProps<RootStackParamList, 'SendScreen'>

const SendScreen = ({ navigation }: ScreenProps) => {
  const theme = useTheme()
  const mainAddress = useAppSelector((state) => state.addresses.mainAddress)
  const [fromAddressHash, setFromAddressHash] = useState<AddressHash>(mainAddress)
  const [toAddressHash, setToAddressHash] = useState<string>()
  const [amountString, setAmountString] = useState('')
  const [amount, setAmount] = useState(BigInt(0))
  const [gasAmount, setGasAmount] = useState('')
  const [gasPriceString, setGasPriceString] = useState('')
  const [gasPrice, setGasPrice] = useState<bigint>()

  // TODO: Import from SDK
  const MINIMAL_GAS_AMOUNT = 20000
  const MINIMAL_GAS_PRICE = BigInt(BILLION * 100)

  const isFormDataComplete =
    amount > BigInt(0) &&
    // TODO: Use isAddressValid from SDK
    !!toAddressHash &&
    // TODO: Use isAddressValid from SDK
    !!fromAddressHash

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

  const handleContinuePress = () => {}

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
          {isFormDataComplete && (
            <>
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
            </>
          )}
        </View>
        {isFormDataComplete && (
          <CenteredScreenSection>
            <Button
              title="Continue"
              onPress={() =>
                navigation.navigate('ConfirmSendScreen', {
                  fromAddressHash,
                  toAddressHash,
                  amount: amount.toString(),
                  gasAmount: gasAmount || undefined,
                  gasPrice: gasPrice ? gasPrice.toString() : undefined
                })
              }
              icon={<ArrowRightIcon size={24} color={theme.font.contrast} />}
              wide
              disabled={!isFormDataComplete || gasAmountHasError || gasPriceHasError}
            />
          </CenteredScreenSection>
        )}
      </ScrollView>
    </Screen>
  )
}

export default SendScreen
