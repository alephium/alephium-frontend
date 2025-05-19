import { ApiBalances, calculateTokenAmountWorth, ListedFT, TokenId } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { isNumber, orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchTokenPrices } from '@/api/apiDataHooks/market'
import { fungibleTokenMetadataQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'

interface UseSortFTsProps extends SkipProp {
  listedFts: (ListedFT & ApiBalances)[]
  unlistedFtIds: TokenId[]
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
      () => (!skip ? orderBy(unlistedFts, ['name', 'id'], ['asc', 'asc']) : unlistedFts),
      [skip, unlistedFts]
    ),
    sortedListedFts: useMemo(
      () =>
        !skip
          ? orderBy(
              listedFts,
              [
                (token) => {
                  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

                  return isNumber(tokenPrice)
                    ? calculateTokenAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
                    : -1
                },
                'name',
                'id'
              ],
              ['desc', 'asc', 'asc']
            )
          : listedFts,
      [listedFts, skip, tokenPrices]
    ),
    isLoading: isLoadingUnlistedFTs
  }
}

export default useFetchSortedFts
