import { calculateAmountWorth, CURRENCIES, isFT, TokenId } from '@alephium/shared'
import { useFetchToken, useFetchTokenPrice } from '@alephium/shared-react'
import { isNumber } from 'lodash'
import { useMemo } from 'react'
import styled from 'styled-components'

import Amount, { AmountProps } from '~/components/Amount'
import { useAppSelector } from '~/hooks/redux'

interface FtWorthProps extends AmountProps {
  tokenId: TokenId
  balance?: bigint
}

const FtWorth = (props: FtWorthProps) => {
  const { data: token } = useFetchToken(props.tokenId)

  if (!token || !isFT(token)) return null

  return <FtWorthAmount symbol={token.symbol} decimals={token.decimals} {...props} />
}

export default FtWorth

interface AddressFtWorthAmountProps extends FtWorthProps {
  symbol: string
  decimals: number
}

const FtWorthAmount = ({ symbol, decimals, balance, ...props }: AddressFtWorthAmountProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const { data: tokenPrice } = useFetchTokenPrice(symbol)

  const worth = useMemo(
    () =>
      balance !== undefined && isNumber(tokenPrice) ? calculateAmountWorth(balance, tokenPrice, decimals) : undefined,
    [balance, tokenPrice, decimals]
  )

  if (worth === undefined) return null

  return <FiatAmountStyled isFiat value={worth} suffix={CURRENCIES[currency].symbol} {...props} />
}

const FiatAmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: flex-end;
  margin-top: 5px;
`
