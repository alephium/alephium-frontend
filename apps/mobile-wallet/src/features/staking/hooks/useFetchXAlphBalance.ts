import { AddressHash } from '@alephium/shared/types'
import { useFetchAddressSingleTokenBalances } from '@alephium/shared-react'

import { xAlphTokenId } from '~/api/powfi'

const useFetchXAlphBalance = (addressHash: AddressHash) => {
  const { data: tokenBalances, isLoading } = useFetchAddressSingleTokenBalances({ addressHash, tokenId: xAlphTokenId })

  return {
    data: tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : BigInt(0),
    isLoading
  }
}

export default useFetchXAlphBalance
