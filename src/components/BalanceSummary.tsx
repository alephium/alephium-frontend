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
import { Skeleton } from 'moti/skeleton'
import { useState } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import DeltaPercentage from '~/components/DeltaPercentage'
import HistoricWorthChart from '~/components/HistoricWorthChart'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressesHaveHistoricBalances } from '~/store/addresses/addressesSelectors'
import { selectTotalBalance } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { ChartLength, chartLengths, DataPoint } from '~/types/charts'
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
  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()

  const totalAmountWorth = calculateAmountWorth(totalBalance, price ?? 0)
  const showActivityIndicator = isPriceLoading || addressDataStatus === 'uninitialized'

  return (
    <View style={style}>
      <Label color="tertiary" semiBold>
        {dateLabel}
      </Label>
      <Skeleton show={showActivityIndicator} colorMode={theme.name} width={150}>
        <Amount value={totalAmountWorth} isFiat fadeDecimals suffix={currencies[currency].symbol} bold size={38} />
      </Skeleton>
      {hasHistoricBalances && worthInBeginningOfChart !== undefined && (
        <Row>
          <Skeleton show={showActivityIndicator} colorMode={theme.name}>
            <DeltaPercentage initialValue={worthInBeginningOfChart} latestValue={totalAmountWorth} />
          </Skeleton>
          <ChartLengthBadges>
            {chartLengths.map((length) => {
              const isActive = length === chartLength

              return (
                <ChartLengthButton key={length} isActive={isActive} onPress={() => setChartLength(length)}>
                  <AppText color={isActive ? 'contrast' : 'secondary'} size={14} medium>
                    {length.toUpperCase()}
                  </AppText>
                </ChartLengthButton>
              )
            })}
          </ChartLengthBadges>
        </Row>
      )}

      <ChartContainer>
        <HistoricWorthChart
          currency={currency}
          latestWorth={totalAmountWorth}
          length={chartLength}
          onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
        />
      </ChartContainer>
    </View>
  )
}

export default BalanceSummary

const Label = styled(AppText)`
  margin-bottom: 14px;
`

const ChartContainer = styled.View`
  margin: 0 -35px;
`

const ChartLengthBadges = styled.View`
  flex-direction: row;
  gap: 12px;
`

const ChartLengthButton = styled(Pressable)<{ isActive?: boolean }>`
  width: 32px;
  height: 23px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.font.secondary : 'transparent')};
`

const Row = styled.View`
  flex-direction: row;
  gap: 24px;
  margin: 10px 0;
`
