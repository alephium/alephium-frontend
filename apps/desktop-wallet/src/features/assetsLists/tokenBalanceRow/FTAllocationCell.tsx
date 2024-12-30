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
import styled from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isListedFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import useFetchWalletWorth from '@/api/apiDataHooks/wallet/useFetchWalletWorth'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import { ListedFT } from '@/types/tokens'

const FTAllocationCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)
  const { data: tokenBalance, isLoading: isLoadingBalance } = useFetchWalletSingleTokenBalances({
    tokenId
  })
  const { data: walletWorth, isLoading: isLoadingWalletWorth } = useFetchWalletWorth()

  if (!isListedFT(token)) return <TableCell fixedWidth={140} />

  return (
    <TableCell fixedWidth={140}>
      <FTAllocationBar
        token={token}
        tokenAmount={BigInt(tokenBalance?.totalBalance)}
        walletWorth={walletWorth}
        isLoading={isLoadingToken || isLoadingBalance || isLoadingWalletWorth}
      />
    </TableCell>
  )
}

interface FTAllocationBarProps {
  token: ListedFT
  tokenAmount?: bigint
  walletWorth?: number
  isLoading?: boolean
}

const FTAllocationBar = ({ token, tokenAmount, walletWorth, isLoading }: FTAllocationBarProps) => {
  const { data: tokenPrice, isLoading: tokenPriceLoading } = useFetchTokenPrice(token.symbol)

  if (isLoading || tokenPriceLoading) return <SkeletonLoader width="140px" height="6px" />

  if (!token || !tokenAmount || !walletWorth || !tokenPrice) return null

  const tokenWorth = calculateAmountWorth(tokenAmount, tokenPrice, token.decimals)

  const ratio = tokenWorth / walletWorth

  return (
    <BarContainer>
      <Bar style={{ flex: ratio }} />
    </BarContainer>
  )
}

export default FTAllocationCell

const BarContainer = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  background-color: ${({ theme }) => theme.bg.primary};
`

const Bar = styled.div`
  background-color: ${({ theme }) => theme.global.accent};
  height: 100%;
`
