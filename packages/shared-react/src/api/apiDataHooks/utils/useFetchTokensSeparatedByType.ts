import { ListedFT, TokenId, UnlistedToken } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useFetchTokensSeparatedByListing } from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId, useIsExplorerOffline } from '@/network'

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

export const useFetchTokensSeparatedByType = <T extends UnlistedToken>(tokens: T[] = []): TokensByType<T> => {
  const networkId = useCurrentlyOnlineNetworkId()
  const isExplorerOffline = useIsExplorerOffline()

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

  const nsts = useMemo(
    () =>
      // If EB is offline and we have no caches, all unlistedTokens should be considered NSTs
      isExplorerOffline && nftIds.length === 0 && nstIds.length === 0 && unlistedFtIds.length === 0
        ? unlistedTokens.map(({ id }) => id)
        : nstIds,
    [isExplorerOffline, nftIds.length, nstIds, unlistedFtIds.length, unlistedTokens]
  )

  return {
    data: { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds: nsts }, // TODO: Consider adding balances instead of IDs?
    isLoading: isLoadingTokensByListing || isLoadingTokensByType
  }
}
