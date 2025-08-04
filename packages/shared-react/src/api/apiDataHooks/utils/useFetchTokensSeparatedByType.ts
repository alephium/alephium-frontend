import { ListedFT, TokenId, UnlistedToken } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useFetchTokensSeparatedByListing } from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'
import { useSharedSelector } from '@/redux'

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
  const explorerStatus = useSharedSelector((s) => s.network.explorerStatus)

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
      explorerStatus === 'offline' && nftIds.length === 0 && nstIds.length === 0 && unlistedFtIds.length === 0
        ? unlistedTokens.map(({ id }) => id)
        : nstIds,
    [explorerStatus, nftIds.length, nstIds, unlistedFtIds.length, unlistedTokens]
  )

  return {
    data: { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds: nsts }, // TODO: Consider adding balances instead of IDs?
    isLoading: isLoadingTokensByListing || isLoadingTokensByType
  }
}
