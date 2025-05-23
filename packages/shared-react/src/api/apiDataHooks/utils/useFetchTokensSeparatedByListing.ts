import { FtListMap, ListedFT, UnlistedToken } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ftListQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

interface TokensByListing<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
  }
  isLoading: boolean
}

export const useFetchTokensSeparatedByListing = <T extends UnlistedToken>(tokens: T[] = []): TokensByListing<T> => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data: ftList, isLoading } = useQuery(ftListQuery({ networkId }))

  const data = useMemo(() => separateTokensByListing(tokens, ftList), [ftList, tokens])

  return {
    data,
    isLoading
  }
}

export const separateTokensByListing = <T extends UnlistedToken>(
  tokens: T[],
  ftList: FtListMap | undefined
): TokensByListing<T>['data'] => {
  const initial = { listedFts: [] as (ListedFT & T)[], unlistedTokens: [] as (UnlistedToken & T)[] }

  if (!ftList) return initial

  return tokens.reduce((acc, token) => {
    const listedFT = ftList[token.id]

    if (listedFT) {
      acc.listedFts.push({ ...listedFT, ...token })
    } else {
      acc.unlistedTokens.push(token)
    }

    return acc
  }, initial)
}
