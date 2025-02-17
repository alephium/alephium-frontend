import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import FTWorthAmount from '@/components/amounts/FTWorthAmount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { AddressTokenBalancesRowProps, TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import { isFT } from '@/types/tokens'

export const FTAddressWorthCell = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => {
  const { data: tokenBalances, isLoading: isLoadingBalance } = useFetchAddressSingleTokenBalances({
    tokenId,
    addressHash
  })
  const { data: token } = useFetchToken(tokenId)
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!token || !isFT(token)) return null

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <TableCell align="right">
      {isLoadingBalance || isLoadingTokenPrices ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <FTWorthAmount symbol={token.symbol} decimals={token.decimals} totalBalance={totalBalance} />
      )}
    </TableCell>
  )
}

export const FTWalletWorthCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: tokenBalances, isLoading: isLoadingBalances } = useFetchWalletSingleTokenBalances({ tokenId })
  const { data: token } = useFetchToken(tokenId)
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!token || !isFT(token)) return null

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <TableCell align="right">
      {isLoadingBalances || isLoadingTokenPrices ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <FTWorthAmount symbol={token.symbol} decimals={token.decimals} totalBalance={totalBalance} />
      )}
    </TableCell>
  )
}
