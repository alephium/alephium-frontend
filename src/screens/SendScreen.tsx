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

import { convertAlphToSet } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { ArrowUp as ArrowUpIcon } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import Button from '../components/buttons/Button'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import AddressSelector from '../components/inputs/AddressSelector'
import Input from '../components/inputs/Input'
import Screen, { CenteredScreenSection, ScreenSection, ScreenSectionTitle } from '../components/layout/Screen'
import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { AddressHash } from '../types/addresses'
import { isNumericStringValid } from '../utils/numbers'

type ScreenProps = StackScreenProps<RootStackParamList, 'SendScreen'>

const SendScreen = ({ navigation }: ScreenProps) => {
  const theme = useTheme()
  const mainAddress = useAppSelector((state) => state.addresses.mainAddress)
  const [fromAddressHash, setFromAddressHash] = useState<AddressHash>(mainAddress)
  const [toAddressHash, setToAddressHash] = useState<string>()
  const [amountString, setAmountString] = useState('')
  const [amount, setAmount] = useState(BigInt(0))
  const [fee, setFee] = useState(BigInt(0))
  const [gasAmountString, setGasAmountString] = useState('')
  const [gasAmount, setGasAmount] = useState<number>()
  const [gasPriceString, setGasPriceString] = useState('')
  const [gasPrice, setGasPrice] = useState<number>()

  const totalAmount = amount + fee

  // TODO: Use isAddressValid from SDK
  const isFormDataComplete = amount > BigInt(0) && !!toAddressHash && !!fromAddressHash

  const handleAmountChange = (str: string) => isNumericStringValid(str) && setAmountString(str)
  const handleGasAmountChange = (str: string) => isNumericStringValid(str, false) && setGasAmountString(str)
  const handleGasPriceChange = (str: string) => isNumericStringValid(str) && setGasPriceString(str)

  useEffect(() => {
    if (amountString) {
      if (!amountString.endsWith('.')) {
        setAmount(convertAlphToSet(amountString))
      }
    } else {
      setAmount(BigInt(0))
    }
  }, [amountString])

  return (
    <Screen>
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
        {isFormDataComplete && (
          <>
            <ScreenSection>
              <ScreenSectionTitle>Summary</ScreenSectionTitle>
              <HighlightRow title="Est. fee" isTopRounded>
                <Amount value={fee} suffix="ALPH" fullPrecision />
              </HighlightRow>
              <HighlightRow title="Total value" isBottomRounded>
                <Amount value={totalAmount} suffix="ALPH" fullPrecision />
              </HighlightRow>
            </ScreenSection>
            <ScreenSection>
              <ExpandableRow title="Tweak gas settings" expandedHeight={165}>
                <Input
                  label="Gas"
                  value={gasAmountString}
                  onChangeText={handleGasAmountChange}
                  isTopRounded
                  hasBottomBorder
                  keyboardType="number-pad"
                />
                <Input
                  label="Gas price"
                  value={gasPriceString}
                  onChangeText={handleGasPriceChange}
                  isBottomRounded
                  hasBottomBorder
                  keyboardType="number-pad"
                />
              </ExpandableRow>
            </ScreenSection>
            <CenteredScreenSection>
              <Button
                title="Send"
                icon={<ArrowUpIcon size={24} color={theme.font.contrast} />}
                wide
                gradient
                disabled={!isFormDataComplete}
              />
            </CenteredScreenSection>
          </>
        )}
      </ScrollView>
    </Screen>
  )
}

export default SendScreen
