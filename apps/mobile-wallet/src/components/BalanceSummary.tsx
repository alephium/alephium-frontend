/*
Copyright 2018 - 2024 The Alephium Authors
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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { Skeleton } from 'moti/skeleton'
import { useMemo } from 'react'
import { View, ViewProps } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesTokensWorth } from '~/store/addresses/addressesSelectors'
import { selectAddressIds } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BalanceSummaryProps extends ViewProps {
  dateLabel: string
}

const BalanceSummary = ({ dateLabel, style, ...props }: BalanceSummaryProps) => {
  const theme = useTheme()
  const currency = useAppSelector((s) => s.settings.currency)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHashes))

  return (
    <BalanceSummaryContainer style={style} {...props}>
      <TextContainer>
        <View>
          <AppText color="secondary" semiBold>
            {dateLabel}
          </AppText>
        </View>

        {addressesBalancesStatus === 'uninitialized' ? (
          <View style={{ marginTop: 13 }}>
            <Skeleton show colorMode={theme.name} width={200} height={38} />
          </View>
        ) : (
          <Amount value={balanceInFiat} isFiat suffix={CURRENCIES[currency].symbol} semiBold size={40} />
        )}
      </TextContainer>
    </BalanceSummaryContainer>
  )
}

export default BalanceSummary

const BalanceSummaryContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin: 10px 0;
`

const TextContainer = styled.View`
  align-items: center;
  margin: 10px ${DEFAULT_MARGIN + 10}px 15px ${DEFAULT_MARGIN + 10}px;
`
