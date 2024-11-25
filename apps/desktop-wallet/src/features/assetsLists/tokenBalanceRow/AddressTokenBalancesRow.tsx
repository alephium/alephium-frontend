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

import { TableRow } from '@/components/Table'
import { FTAddressAmountCell, RawAmountSubtitle } from '@/features/assetsLists/tokenBalanceRow/FTAmountCells'
import FTWorth from '@/features/assetsLists/tokenBalanceRow/FTWorthCell'
import { FTNameCell, NSTNameCell } from '@/features/assetsLists/tokenBalanceRow/NameCells'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { AddressTokenBalancesRowProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const AddressFTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <TokenLogo tokenId={tokenId} />
      <FTNameCell tokenId={tokenId} />
      <FTAddressAmountCell tokenId={tokenId} addressHash={addressHash} />
      <FTWorth tokenId={tokenId} />
    </TokenRow>
  </TableRow>
)

export const AddressNSTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <TokenLogo tokenId={tokenId} />
      <NSTNameCell tokenId={tokenId} />
      <RawAmountSubtitle />
    </TokenRow>
  </TableRow>
)

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`
