import { calculateTokenAmountWorth, isFT } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances, useFetchToken, useFetchTokenPrice } from '@alephium/shared-react'
import { isNumber } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/Table/TableCellAmount'

interface AddressTokenBalancesProps {
  tokenId: string
  addressStr: string
}

const AddressTokenBalances = ({ tokenId, addressStr }: AddressTokenBalancesProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash: addressStr, tokenId })
  const { data: token } = useFetchToken(tokenId)

  const totalBalance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined
  const availableBalance = tokenBalances?.availableBalance ? BigInt(tokenBalances.availableBalance) : undefined
  const tokenSymbol = token && isFT(token) ? token.symbol : undefined
  const tokenDecimals = token && isFT(token) ? token.decimals : undefined

  return (
    <TableCellAmount>
      <TokenAmount assetId={tokenId} value={totalBalance} suffix={tokenSymbol} decimals={tokenDecimals} />
      {token && isFT(token) && (
        <FTWorthAmount symbol={token.symbol} decimals={token.decimals} totalBalance={totalBalance} />
      )}
      {availableBalance !== undefined && availableBalance !== totalBalance ? (
        <TokenAmountSublabel>
          {`${t('Available')} `}
          <Amount
            assetId={tokenId}
            value={availableBalance}
            suffix={tokenSymbol}
            decimals={tokenDecimals}
            color={theme.font.secondary}
          />
        </TokenAmountSublabel>
      ) : tokenDecimals === undefined ? (
        <TokenAmountSublabel>{t('Raw amount')}</TokenAmountSublabel>
      ) : undefined}
    </TableCellAmount>
  )
}

export default AddressTokenBalances

interface FTWorthAmountProps {
  symbol: string
  decimals: number
  totalBalance?: bigint
}

const FTWorthAmount = ({ symbol, decimals, totalBalance }: FTWorthAmountProps) => {
  const theme = useTheme()
  const { data: tokenPrice, isLoading } = useFetchTokenPrice(symbol)

  if (isLoading) return <SkeletonLoader height="20px" width="30%" />

  const worth =
    totalBalance !== undefined && isNumber(tokenPrice)
      ? calculateTokenAmountWorth(totalBalance, tokenPrice, decimals)
      : undefined

  if (worth === undefined) return '-'

  return <Amount value={worth} suffix="$" isFiat color={theme.font.secondary} />
}

const TokenAmount = styled(Amount)`
  font-size: 14px;
`

const TokenAmountSublabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 400;
`
