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

import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import { TableCell, TableRow } from '@/components/Table'
import AmountsColumn, { RawAmountSubtitle } from '@/features/assetsLists/tokenBalanceRow/AmountsCell'
import FTWorth from '@/features/assetsLists/tokenBalanceRow/FTWorth'
import { FTNameCell, NSTNameCell } from '@/features/assetsLists/tokenBalanceRow/NameCells'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenBalancesRowAmountsProps, TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const WalletFTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TableCell maxWidth={50} noBorder>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <FTNameCell tokenId={tokenId} />

    <FTAmountsCell tokenId={tokenId} />
  </TableRow>
)

export const WalletNSTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TableCell maxWidth={50}>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <NSTNameCell tokenId={tokenId} />
    <WalletTokenBalancesAmountsCell tokenId={tokenId}>
      <RawAmountSubtitle />
    </WalletTokenBalancesAmountsCell>
  </TableRow>
)

const FTAmountsCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: walletTokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  return (
    <WalletTokenBalancesAmountsCell tokenId={tokenId}>
      <FTWorth
        tokenId={tokenId}
        totalBalance={walletTokenBalances?.totalBalance}
        isLoadingBalance={isLoadingTokenBalances}
      />
    </WalletTokenBalancesAmountsCell>
  )
}

const WalletTokenBalancesAmountsCell = ({ tokenId, children }: TokenBalancesRowAmountsProps) => {
  const { data: walletTokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  return (
    <AmountsColumn
      isLoading={isLoadingTokenBalances}
      totalBalance={walletTokenBalances?.totalBalance}
      availableBalance={walletTokenBalances?.availableBalance}
      tokenId={tokenId}
    >
      {children}
    </AmountsColumn>
  )
}
