import { AddressHash } from '@alephium/shared'

import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import useFetchListedFtsWorth from '@/api/apiDataHooks/utils/useFetchListedFtsWorth'
import useFetchTokensSeparatedByListing from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'

const useFetchAddressWorth = (addressHash: AddressHash) => {
  const { data: allTokensBalances, isLoading: isLoadingBalances } = useFetchAddressBalances(addressHash)
  const {
    data: { listedFts },
    isLoading: isLoadingTokensByListing
  } = useFetchTokensSeparatedByListing(allTokensBalances)
  const { data: worth, isLoading: isLoadingWorth } = useFetchListedFtsWorth(listedFts)

  return {
    data: worth,
    isLoading: isLoadingWorth || isLoadingTokensByListing || isLoadingBalances
  }
}

export default useFetchAddressWorth
