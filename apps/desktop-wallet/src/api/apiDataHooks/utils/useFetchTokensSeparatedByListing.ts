import { useMemo } from 'react'

import useFetchFtList from '@/api/apiDataHooks/utils/useFetchFtList'
import { ListedFT, UnlistedToken } from '@/types/tokens'

interface TokensByListing<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
  }
  isLoading: boolean
}

const useFetchTokensSeparatedByListing = <T extends UnlistedToken>(tokens: T[] = []): TokensByListing<T> => {
  const { data: ftList, isLoading } = useFetchFtList({ skip: tokens.length === 0 })

  const data = useMemo(() => {
    const initial = { listedFts: [] as (ListedFT & T)[], unlistedTokens: [] as (UnlistedToken & T)[] }

    if (!ftList) return initial

    return tokens.reduce((acc, token) => {
      const listedFT = ftList?.find((t) => t.id === token.id)

      if (listedFT) {
        acc.listedFts.push({ ...listedFT, ...token })
      } else {
        acc.unlistedTokens.push(token)
      }

      return acc
    }, initial)
  }, [ftList, tokens])

  return {
    data,
    isLoading
  }
}

export default useFetchTokensSeparatedByListing
