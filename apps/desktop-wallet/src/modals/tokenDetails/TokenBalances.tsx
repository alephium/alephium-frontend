import styled from 'styled-components'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import FTAmounts from '@/components/amounts/FTAmounts'
import FTWorthAmount from '@/components/amounts/FTWorthAmount'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'

const TokenBalances = ({ tokenId }: TokenDetailsModalProps) => (
  <>
    <FTAmountsStyled tokenId={tokenId} />
    <TokenBalanceWorth tokenId={tokenId} />
  </>
)

export default TokenBalances

const TokenBalanceWorth = ({ tokenId }: TokenDetailsModalProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { data: totalBalance, isLoading: isLoadingBalance } = useFetchWalletSingleTokenBalances({
    tokenId
  })
  const { isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  if (!token || !isFT(token)) return null

  return (
    <FTWorthAmountStyled
      isLoading={isLoadingBalance || isLoadingTokenPrices}
      symbol={token.symbol}
      decimals={token.decimals}
      totalBalance={BigInt(totalBalance?.totalBalance)}
    />
  )
}

const FTAmountsStyled = styled(FTAmounts)`
  font-size: 38px;
`

const FTWorthAmountStyled = styled(FTWorthAmount)`
  font-size: 20px;
`
