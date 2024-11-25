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

import { TableCell, TableRow } from '@/components/Table'
import { FTWalletAmountCell } from '@/features/assetsLists/tokenBalanceRow/FTAmountCells'
import FTPriceCell from '@/features/assetsLists/tokenBalanceRow/FTPriceCell'
import FTWorthCell from '@/features/assetsLists/tokenBalanceRow/FTWorthCell'
import { FTNameCell, NSTNameCell } from '@/features/assetsLists/tokenBalanceRow/NameCells'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const WalletFTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TableCell fixedWidth={50} noBorder>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <FTNameCell tokenId={tokenId} />
    <FTPriceCell tokenId={tokenId} />
    <FTWalletAmountCell tokenId={tokenId} />
    <FTWorthCell tokenId={tokenId} />
  </TableRow>
)

export const WalletNSTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TableCell fixedWidth={50}>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <NSTNameCell tokenId={tokenId} />
    <FTWalletAmountCell tokenId={tokenId} />
  </TableRow>
)
