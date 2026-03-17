import { useFetchWalletSingleTokenBalances } from '@alephium/shared-react'

import useXAlphTokenId from './useXAlphTokenId'

const useFetchXAlphBalance = () => {
  const xAlphTokenId = useXAlphTokenId()
  const { data: tokenBalances, isLoading } = useFetchWalletSingleTokenBalances({ tokenId: xAlphTokenId ?? '' })

  return {
    data: tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : BigInt(0),
    isLoading
  }
}

export default useFetchXAlphBalance
