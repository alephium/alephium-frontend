import { useMemo } from 'react'

import useFetchFtList from '@/api/apiDataHooks/utils/useFetchFtList'
import { FtListMap, ListedFT, UnlistedToken } from '@/types/tokens'

interface TokensByListing<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
  }
  isLoading: boolean
}

const useFetchTokensSeparatedByListing = <T extends UnlistedToken>(tokens: T[] = []): TokensByListing<T> => {
  const { data: ftList, isLoading } = useFetchFtList({ skip: tokens.length === 0 })

  const data = useMemo(() => separateTokensByListing(tokens, ftList), [ftList, tokens])

  return {
    data,
    isLoading
  }
}

export default useFetchTokensSeparatedByListing

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
