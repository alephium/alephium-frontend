import { calculateTokenAmountWorth, isListedFT, ListedFT } from '@alephium/shared'
import {
  useFetchToken,
  useFetchTokenPrice,
  useFetchWalletSingleTokenBalances,
  useFetchWalletWorth
} from '@alephium/shared-react'
import styled from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

const FTAllocationCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)
  const { data: tokenBalances, isLoading: isLoadingBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })
  const { data: walletWorth, isLoading: isLoadingWalletWorth } = useFetchWalletWorth()

  if (!token || !isListedFT(token)) return <TableCell fixedWidth={140} />

  const tokenAmount = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <TableCell fixedWidth={140}>
      <FTAllocationBar
        token={token}
        tokenAmount={tokenAmount}
        walletWorth={walletWorth}
        isLoading={isLoadingToken || isLoadingBalances || isLoadingWalletWorth}
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

  const tokenWorth = calculateTokenAmountWorth(tokenAmount, tokenPrice, token.decimals)

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
  height: 4px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  background-color: ${({ theme }) => theme.bg.primary};
`

const Bar = styled.div`
  background-color: ${({ theme }) => theme.bg.contrast};
  height: 100%;
`
