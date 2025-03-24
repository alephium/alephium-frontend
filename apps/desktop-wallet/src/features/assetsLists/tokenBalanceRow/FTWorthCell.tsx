import { isFT } from '@alephium/shared'
import {
  useFetchAddressSingleTokenBalances,
  useFetchToken,
  useFetchTokenPrices,
  useFetchWalletSingleTokenBalances
} from '@alephium/shared-react'

import FTWorthAmount from '@/components/amounts/FTWorthAmount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { AddressTokenBalancesRowProps, TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

interface FTAddressWorthCellProps extends AddressTokenBalancesRowProps {
  noBorder?: boolean
}

export const FTAddressWorthCell = ({ tokenId, addressHash, noBorder }: FTAddressWorthCellProps) => {
  const { data: tokenBalances, isLoading: isLoadingBalance } = useFetchAddressSingleTokenBalances({
    tokenId,
    addressHash
  })
  const { data: token } = useFetchToken(tokenId)
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!token || !isFT(token)) return null

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <TableCell align="right" noBorder={noBorder}>
      {isLoadingBalance || isLoadingTokenPrices ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <FTWorthAmount symbol={token.symbol} decimals={token.decimals} totalBalance={totalBalance} />
      )}
    </TableCell>
  )
}

interface FTWalletWorthCellProps extends TokenBalancesRowBaseProps {
  noBorder?: boolean
}

export const FTWalletWorthCell = ({ tokenId, noBorder }: FTWalletWorthCellProps) => {
  const { data: tokenBalances, isLoading: isLoadingBalances } = useFetchWalletSingleTokenBalances({ tokenId })
  const { data: token } = useFetchToken(tokenId)
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!token || !isFT(token)) return null

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <TableCell align="right" noBorder={noBorder}>
      {isLoadingBalances || isLoadingTokenPrices ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <FTWorthAmount symbol={token.symbol} decimals={token.decimals} totalBalance={totalBalance} />
      )}
    </TableCell>
  )
}
