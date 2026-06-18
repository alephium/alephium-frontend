import { calculateTokenAmountWorth } from '@alephium/shared/numbers'
import { isFT, TokenId } from '@alephium/shared/types'
import { useFetchToken, useFetchTokenPrice } from '@alephium/shared-react'
import { useMemo } from 'react'
import styled from 'styled-components'

import Amount, { AmountBaseProps } from '~/components/Amount'

interface FtWorthProps extends AmountBaseProps {
  tokenId: TokenId
  amount?: bigint
}

const FtWorth = (props: FtWorthProps) => {
  const { data: token } = useFetchToken(props.tokenId)

  if (!token || !isFT(token)) return null

  return <FtAmountWorth symbol={token.symbol} decimals={token.decimals} {...props} />
}

export default FtWorth

interface AddressFtAmountWorthProps extends FtWorthProps {
  symbol: string
  decimals: number
}

const FtAmountWorth = ({ symbol, decimals, amount, ...props }: AddressFtAmountWorthProps) => {
  const { data: tokenPrice } = useFetchTokenPrice(symbol)

  const worth = useMemo(
    () =>
      amount !== undefined && typeof tokenPrice === 'number'
        ? calculateTokenAmountWorth(amount, tokenPrice, decimals)
        : undefined,
    [amount, tokenPrice, decimals]
  )

  if (worth === undefined) return null

  return <AmountStyled isFiat value={worth} {...props} />
}

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: flex-end;
  margin-top: 5px;
`
