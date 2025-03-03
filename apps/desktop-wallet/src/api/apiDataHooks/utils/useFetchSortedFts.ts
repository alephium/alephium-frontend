import { calculateAmountWorth } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQueries } from '@tanstack/react-query'
import { isNumber, orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { fungibleTokenMetadataQuery } from '@/api/queries/tokenQueries'
import { ApiBalances, ListedFT, TokenId } from '@/types/tokens'

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

  const { data: tokenPrices } = useFetchTokenPrices({ skip })

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
                    ? calculateAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
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
