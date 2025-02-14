import { useTheme } from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

const FTPriceCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <TableCell>
      <Price tokenSymbol={token.symbol} />
    </TableCell>
  )
}

const Price = ({ tokenSymbol }: { tokenSymbol: string }) => {
  const { data: tokenPrice, isLoading } = useFetchTokenPrice(tokenSymbol)
  const theme = useTheme()

  if (tokenPrice === undefined || tokenPrice === null) return '-'

  return isLoading ? (
    <SkeletonLoader height="20px" width="30%" />
  ) : (
    <Amount isFiat value={tokenPrice} overrideSuffixColor color={theme.font.secondary} />
  )
}

export default FTPriceCell
