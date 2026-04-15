import { AddressHash } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances } from '@alephium/shared-react'

import useXAlphTokenId from './useXAlphTokenId'

const useFetchXAlphBalance = (addressHash: AddressHash) => {
  const xAlphTokenId = useXAlphTokenId()
  const {
    data: tokenBalances,
    isLoading,
    isFetching
  } = useFetchAddressSingleTokenBalances({ addressHash, tokenId: xAlphTokenId })

  return {
    data: tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : BigInt(0),
    isLoading,
    isFetching
  }
}

export default useFetchXAlphBalance
