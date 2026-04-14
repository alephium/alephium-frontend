import { ApiBalances, calculateTokenAmountWorth, ListedFT, TokenId } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { SkipProp } from '../../../api/apiDataHooks/apiDataHooksTypes'
import { combineDefined } from '../../../api/apiDataHooks/apiDataHooksUtils'
import { useFetchTokenPrices } from '../../../api/apiDataHooks/market'
import { fungibleTokenMetadataQuery } from '../../../api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '../../../network/useCurrentlyOnlineNetworkId'

interface UseSortFTsProps extends SkipProp {
  listedFts: (ListedFT & ApiBalances)[]
  unlistedFtIds: TokenId[]
}

const compareByNameThenId = (a: { name?: string; id: string }, b: { name?: string; id: string }) => {
  const nameA = a.name ?? ''
  const nameB = b.name ?? ''
  if (nameA !== nameB) return nameA < nameB ? -1 : 1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

const useFetchSortedFts = ({ listedFts, unlistedFtIds, skip }: UseSortFTsProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data: unlistedFts, isLoading: isLoadingUnlistedFTs } = useQueries({
    queries: unlistedFtIds.map((id) => fungibleTokenMetadataQuery({ id, networkId })),
    combine: combineDefined
  })

  const { data: tokenPrices } = useFetchTokenPrices()

  return {
    sortedUnlistedFts: useMemo(
      () => (!skip ? [...unlistedFts].sort(compareByNameThenId) : unlistedFts),
      [skip, unlistedFts]
    ),
    sortedListedFts: useMemo(
      () =>
        !skip
          ? [...listedFts].sort((a, b) => {
              const priceA = tokenPrices?.find((tp) => tp.symbol === a.symbol)?.price
              const priceB = tokenPrices?.find((tp) => tp.symbol === b.symbol)?.price
              const worthA =
                typeof priceA === 'number' ? calculateTokenAmountWorth(BigInt(a.totalBalance), priceA, a.decimals) : -1
              const worthB =
                typeof priceB === 'number' ? calculateTokenAmountWorth(BigInt(b.totalBalance), priceB, b.decimals) : -1
              if (worthA !== worthB) return worthB - worthA
              return compareByNameThenId(a, b)
            })
          : listedFts,
      [listedFts, skip, tokenPrices]
    ),
    isLoading: isLoadingUnlistedFTs
  }
}

export default useFetchSortedFts
