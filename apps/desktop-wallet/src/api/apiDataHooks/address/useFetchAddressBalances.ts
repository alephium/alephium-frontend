import { AddressHash } from '@alephium/shared'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import useFetchAddressBalancesTokens from '@/api/apiDataHooks/address/useFetchAddressBalancesTokens'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'

const useFetchAddressBalances = (addressHash: AddressHash) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressBalancesAlph({
    addressHash
  })
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchAddressBalancesTokens({
    addressHash
  })
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph: true,
    alphBalances,
    tokensBalances
  })

  return {
    data: allTokensBalances,
    isLoading: isLoadingTokensBalances || isLoadingAlphBalances
  }
}

export default useFetchAddressBalances
