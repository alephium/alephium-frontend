import { calculateAmountWorth } from '@alephium/shared'
import styled from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import useFetchWalletWorth from '@/api/apiDataHooks/wallet/useFetchWalletWorth'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import { isListedFT, ListedFT } from '@/types/tokens'

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
