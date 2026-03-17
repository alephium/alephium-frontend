import { selectDefaultAddressHash } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances } from '@alephium/shared-react'

import { useAppSelector } from '~/hooks/redux'

import useXAlphTokenId from './useXAlphTokenId'

const useFetchXAlphBalance = () => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const xAlphTokenId = useXAlphTokenId()
  const { data: tokenBalances, isLoading } = useFetchAddressSingleTokenBalances({
    addressHash: defaultAddressHash ?? '',
    tokenId: xAlphTokenId ?? '',
    skip: !defaultAddressHash || !xAlphTokenId
  })

  return {
    data: tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : BigInt(0),
    isLoading
  }
}

export default useFetchXAlphBalance
