import { useQueries } from '@tanstack/react-query'

import useFetchTokensSeparatedByListing from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ListedFT, TokenId, UnlistedToken } from '@/types/tokens'

interface TokensByType<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
    unlistedFtIds: TokenId[]
    nftIds: TokenId[]
    nstIds: TokenId[]
  }
  isLoading: boolean
}

const useFetchTokensSeparatedByType = <T extends UnlistedToken>(tokens: T[] = []): TokensByType<T> => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const {
    data: { listedFts, unlistedTokens },
    isLoading: isLoadingTokensByListing
  } = useFetchTokensSeparatedByListing(tokens)

  const {
    data: { fungible: unlistedFtIds, 'non-fungible': nftIds, 'non-standard': nstIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenTypeQuery({ id, networkId })),
    combine: combineTokenTypeQueryResults
  })

  return {
    data: { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds }, // TODO: Consider adding balances instead of IDs?
    isLoading: isLoadingTokensByListing || isLoadingTokensByType
  }
}

export default useFetchTokensSeparatedByType
