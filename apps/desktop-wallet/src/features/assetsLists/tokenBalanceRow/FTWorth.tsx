import { calculateAmountWorth } from '@alephium/shared'
import { isNumber } from 'lodash'
import styled from 'styled-components'

import useFetchTokenPrices, { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

interface FTWorth extends TokenBalancesRowBaseProps {
  isLoadingBalance: boolean
  totalBalance?: bigint
}

const FTWorth = ({ tokenId, totalBalance, isLoadingBalance }: FTWorth) => {
  const { data: token } = useFetchToken(tokenId)
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!isFT(token)) return null

  if (isLoadingBalance || isLoadingTokenPrices) return <SkeletonLoader height="20px" width="30%" />

  return (
    <Worth>
      <FTWorthAmount symbol={token.symbol} decimals={token.decimals} totalBalance={totalBalance} />
    </Worth>
  )
}

export default FTWorth

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

  if (worth === undefined) return null

  return <Amount value={worth} isFiat />
}

const Worth = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.secondary};
`
