import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import FTWorthAmount from '@/components/amounts/FTWorthAmount'
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
