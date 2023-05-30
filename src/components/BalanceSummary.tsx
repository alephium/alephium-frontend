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

import { calculateAmountWorth } from '@alephium/sdk'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import HistoricWorthChart from '~/components/HistoricWorthChart'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressesHaveHistoricBalances } from '~/store/addresses/addressesSelectors'
import { selectTotalBalance } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { ChartLength, chartLengths } from '~/types/charts'
import { currencies } from '~/utils/currencies'

interface BalanceSummaryProps {
  dateLabel: string
  style?: StyleProp<ViewStyle>
}

const BalanceSummary = ({ dateLabel, style }: BalanceSummaryProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies[currency].ticker, {
    pollingInterval: 60000,
    skip: totalBalance === BigInt(0)
  })
  const addressDataStatus = useAppSelector((s) => s.addresses.status)
  const hasHistoricBalances = useAppSelector(selectAddressesHaveHistoricBalances)
  const theme = useTheme()

  const [chartLength, setChartLength] = useState<ChartLength>('1m')

  const balance = calculateAmountWorth(totalBalance, price ?? 0)
  const showActivityIndicator = isPriceLoading || addressDataStatus === 'uninitialized'

  return (
    <View style={style}>
      {showActivityIndicator ? (
        <ActivityIndicator size="large" color={theme.font.primary} />
      ) : (
        <>
          <Label color="tertiary" semiBold>
            {dateLabel}
          </Label>
          <Amount value={balance} isFiat fadeDecimals suffix={currencies[currency].symbol} bold size={38} />
          <ChartLengthBadges>
            {chartLengths.map((length) => {
              const isActive = length === chartLength

              return (
                hasHistoricBalances && (
                  <ChartLengthButton key={length} isActive={isActive} onPress={() => setChartLength(length)}>
                    <AppText color={isActive ? 'contrast' : 'secondary'} size={14} medium>
                      {length.toUpperCase()}
                    </AppText>
                  </ChartLengthButton>
                )
              )
            })}
          </ChartLengthBadges>
        </>
      )}

      <ChartContainer>
        <HistoricWorthChart currency={currency} latestWorth={balance} length={chartLength} />
      </ChartContainer>
    </View>
  )
}

export default BalanceSummary

const Label = styled(AppText)`
  margin-bottom: 14px;
`

const ChartContainer = styled.View`
  margin: 0 -30px;
`

const ChartLengthBadges = styled.View`
  flex-direction: row;
  gap: 12px;
  margin: 10px 0;
`

const ChartLengthButton = styled(Pressable)<{ isActive?: boolean }>`
  width: 32px;
  height: 23px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.font.secondary : 'transparent')};
`
