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

import styled from 'styled-components'

import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import { TableRow } from '@/components/Table'
import AmountsColumn, { RawAmountSubtitle } from '@/features/assetsLists/tokenBalanceRow/AmountsColumn'
import FTWorth from '@/features/assetsLists/tokenBalanceRow/FTWorth'
import { FTNameColumn, NSTNameColumn } from '@/features/assetsLists/tokenBalanceRow/NameColumns'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import {
  AddressTokenBalancesRowAmountsProps,
  AddressTokenBalancesRowProps
} from '@/features/assetsLists/tokenBalanceRow/types'

export const AddressFTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <TokenLogo tokenId={tokenId} />
      <FTNameColumn tokenId={tokenId} />
      <FTAmounts tokenId={tokenId} addressHash={addressHash} />
    </TokenRow>
  </TableRow>
)

export const AddressNSTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <TokenLogo tokenId={tokenId} />
      <NSTNameColumn tokenId={tokenId} />
      <AddressTokenBalancesRowAmounts tokenId={tokenId} addressHash={addressHash}>
        <RawAmountSubtitle />
      </AddressTokenBalancesRowAmounts>
    </TokenRow>
  </TableRow>
)

const FTAmounts = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => {
  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useFetchAddressSingleTokenBalances({
    addressHash,
    tokenId
  })

  const amount = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <AddressTokenBalancesRowAmounts tokenId={tokenId} addressHash={addressHash}>
      <FTWorth tokenId={tokenId} totalBalance={amount} isLoadingBalance={isLoadingTokenBalances} />
    </AddressTokenBalancesRowAmounts>
  )
}

const AddressTokenBalancesRowAmounts = ({ tokenId, addressHash, children }: AddressTokenBalancesRowAmountsProps) => {
  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useFetchAddressSingleTokenBalances({
    addressHash,
    tokenId
  })

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined
  const availableBalance = tokenBalances?.availableBalance ? BigInt(tokenBalances.availableBalance) : undefined

  return (
    <AmountsColumn
      isLoading={isLoadingTokenBalances}
      totalBalance={totalBalance}
      availableBalance={availableBalance}
      tokenId={tokenId}
    >
      {children}
    </AmountsColumn>
  )
}

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`
