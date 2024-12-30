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

import { calculateAmountWorth } from '@alephium/shared'
import { isNumber } from 'lodash'

import useFetchTokenPrices, { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

const FTWorthCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: totalBalance, isLoading: isLoadingBalance } = useFetchWalletSingleTokenBalances({
    tokenId
  })
  const { data: token } = useFetchToken(tokenId)
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!isFT(token)) return null

  return (
    <TableCell align="right">
      {isLoadingBalance || isLoadingTokenPrices ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <FTWorthAmount
          symbol={token.symbol}
          decimals={token.decimals}
          totalBalance={BigInt(totalBalance?.totalBalance)}
        />
      )}
    </TableCell>
  )
}

export default FTWorthCell

interface FTWorthAmountProps {
  symbol: string
  decimals: number
  totalBalance?: bigint
}

const FTWorthAmount = ({ symbol, totalBalance, decimals }: FTWorthAmountProps) => {
  const { data: tokenPrice } = useFetchTokenPrice(symbol)

  const worth =
    totalBalance !== undefined && isNumber(tokenPrice)
      ? calculateAmountWorth(totalBalance, tokenPrice, decimals)
      : undefined

  if (worth === undefined) return '-'

  return <Amount value={worth} isFiat semiBold />
}
