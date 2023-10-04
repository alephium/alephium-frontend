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
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { ViewProps } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import HistoricWorthChart from '~/components/HistoricWorthChart'
import { useAppSelector } from '~/hooks/redux'
import useWorthDelta from '~/hooks/useWorthDelta'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, selectTotalBalance } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'
import { DataPoint } from '~/types/charts'
import { NetworkStatus } from '~/types/network'
import { currencies } from '~/utils/currencies'

interface BalanceSummaryProps extends ViewProps {
  dateLabel: string
}

const BalanceSummary = ({ dateLabel, style, ...props }: BalanceSummaryProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const networkStatus = useAppSelector((s) => s.network.status)
  const networkName = useAppSelector((s) => s.network.name)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const { data: price } = useGetPriceQuery(currencies[currency].ticker, {
    pollingInterval: 60000,
    skip: totalBalance === BigInt(0)
  })
  const theme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList | ReceiveNavigationParamList>>()

  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()
  const worthDelta = useWorthDelta(worthInBeginningOfChart)

  const totalAmountWorth = calculateAmountWorth(totalBalance, price ?? 0)

  const deltaColor = worthDelta < 0 ? theme.global.alert : worthDelta > 0 ? theme.global.valid : theme.bg.tertiary

  const handleReceivePress = () => {
    if (addressHashes.length === 1) {
      navigation.navigate('ReceiveNavigation', {
        screen: 'QRCodeScreen',
        params: { addressHash: addressHashes[0] }
      })
    } else {
      navigation.navigate('ReceiveNavigation')
    }
  }

  return (
    <BalanceSummaryContainer
      style={[
        {
          shadowColor: 'black',
          shadowOffset: { height: 5, width: 0 },
          shadowOpacity: theme.name === 'dark' ? 0.5 : 0.1,
          shadowRadius: 8,
          elevation: 10
        },
        style
      ]}
      {...props}
    >
      <GradientContainer colors={['transparent', colord(deltaColor).alpha(0.03).toHex()]} locations={[0, 0.6]}>
        <TextContainer>
          <ActiveNetworkContainer>
            <NetworkStatusBullet status={networkStatus} />
            <AppText color="primary">{networkName}</AppText>
          </ActiveNetworkContainer>
          <DateLabelContainer>
            <AppText color="tertiary" semiBold>
              {dateLabel}
            </AppText>
          </DateLabelContainer>

          <Amount value={totalAmountWorth} isFiat fadeDecimals suffix={currencies[currency].symbol} bold size={38} />
        </TextContainer>

        {totalBalance === BigInt(0) ? (
          <ReceiveFundsButtonContainer>
            <Button
              title="Receive assets"
              onPress={handleReceivePress}
              iconProps={{ name: 'arrow-down-outline' }}
              variant="highlight"
              short
            />
          </ReceiveFundsButtonContainer>
        ) : (
          <ChartContainer>
            <HistoricWorthChart
              currency={currency}
              latestWorth={totalAmountWorth}
              onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
            />
          </ChartContainer>
        )}
      </GradientContainer>
    </BalanceSummaryContainer>
  )
}

export default BalanceSummary

const BalanceSummaryContainer = styled.View`
  margin: 0 ${DEFAULT_MARGIN}px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
`

const GradientContainer = styled(LinearGradient)`
  border-radius: ${BORDER_RADIUS_BIG}px;
`

const TextContainer = styled.View`
  margin: 5px ${DEFAULT_MARGIN}px 15px ${DEFAULT_MARGIN}px;
`

const ChartContainer = styled.View`
  margin-right: -1px;
  margin-left: -1px;
`

const ActiveNetworkContainer = styled.View`
  align-self: flex-end;
  margin-right: -8px;
  margin-top: 3px;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  border-radius: 33px;
  padding: 1px 7px;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const DateLabelContainer = styled.View``

const NetworkStatusBullet = styled.View<{ status: NetworkStatus }>`
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background-color: ${({ status, theme }) => (status === 'online' ? theme.global.valid : theme.global.alert)};
`

const ReceiveFundsButtonContainer = styled.View`
  padding: 15px;
`
