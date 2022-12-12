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

import { convertSetToFiat } from '@alephium/sdk'
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import { selectTotalBalance } from '../store/addressesSlice'
import { selectIsPriceUninitialized } from '../store/priceSlice'
import { currencies } from '../utils/currencies'
import Amount from './Amount'

interface BalanceSummaryProps {
  style?: StyleProp<ViewStyle>
}

const BalanceSummary = ({ style }: BalanceSummaryProps) => {
  const [price, currency, addressDataStatus] = useAppSelector((s) => [s.price, s.settings.currency, s.addresses.status])
  const totalBalance = useAppSelector(selectTotalBalance)
  const isPriceUninitialized = useAppSelector(selectIsPriceUninitialized)
  const theme = useTheme()

  const balance = convertSetToFiat(totalBalance, price.value ?? 0)
  const showActivityIndicator = isPriceUninitialized || addressDataStatus === 'uninitialized'

  return (
    <View style={style}>
      {showActivityIndicator ? (
        <ActivityIndicator size="large" color={theme.font.primary} />
      ) : (
        <>
          <AmountInFiat value={balance} isFiat fadeDecimals suffix={currencies[currency].symbol} bold size={38} />
          <Amount value={totalBalance} fadeDecimals bold size={20} />
        </>
      )}
    </View>
  )
}

export default BalanceSummary

const AmountInFiat = styled(Amount)`
  margin-bottom: 10px;
`
