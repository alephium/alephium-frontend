import { calculateTokenAmountWorth } from '@alephium/shared'
import { useFetchTokenPrice } from '@alephium/shared-react'
import { isNumber } from 'lodash'

import Amount, { AmountLoaderProps, FiatAmountProps } from '@/components/Amount'

type FTWorthAmountProps = Omit<FiatAmountProps, 'value' | 'isFiat'> &
  AmountLoaderProps & {
    symbol: string
    decimals: number
    totalBalance?: bigint
  }

const FTWorthAmount = ({ symbol, totalBalance, decimals, ...props }: FTWorthAmountProps) => {
  const { data: tokenPrice } = useFetchTokenPrice(symbol)

  const worth =
    totalBalance !== undefined && isNumber(tokenPrice)
      ? calculateTokenAmountWorth(totalBalance, tokenPrice, decimals)
      : undefined

  if (worth === undefined) return '-'

  return <Amount value={worth} isFiat semiBold {...props} />
}

export default FTWorthAmount
