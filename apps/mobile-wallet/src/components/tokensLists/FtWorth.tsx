import { calculateTokenAmountWorth, CURRENCIES, isFT, TokenId } from '@alephium/shared'
import { useFetchToken, useFetchTokenPrice } from '@alephium/shared-react'
import { isNumber } from 'lodash'
import { useMemo } from 'react'
import styled from 'styled-components'

import Amount, { AmountProps } from '~/components/Amount'
import { useAppSelector } from '~/hooks/redux'

interface FtWorthProps extends AmountProps {
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
  const currency = useAppSelector((s) => s.settings.currency)
  const { data: tokenPrice } = useFetchTokenPrice(symbol)

  const worth = useMemo(
    () =>
      amount !== undefined && isNumber(tokenPrice)
        ? calculateTokenAmountWorth(amount, tokenPrice, decimals)
        : undefined,
    [amount, tokenPrice, decimals]
  )

  if (worth === undefined) return null

  return <AmountStyled isFiat value={worth} suffix={CURRENCIES[currency].symbol} {...props} />
}

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: flex-end;
  margin-top: 5px;
`
