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
