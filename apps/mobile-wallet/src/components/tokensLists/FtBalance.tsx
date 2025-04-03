import { isFT, TokenId } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'

interface FtBalanceProps {
  tokenId: TokenId
  balance?: bigint
}

const FtBalance = ({ tokenId, balance }: FtBalanceProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <AmountStyled
      value={balance}
      decimals={token.decimals}
      isUnknownToken={!token.symbol}
      suffix={token.symbol}
      bold
      useTinyAmountShorthand
    />
  )
}

export default FtBalance

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: center;
`
