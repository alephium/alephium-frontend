import { calculateAmountWorth } from '@alephium/shared'
import { isNumber, orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { ApiBalances, ListedFT, UnlistedFT } from '@/types/tokens'

interface UseSortFTsProps extends SkipProp {
  listedFts: (ListedFT & ApiBalances)[]
  unlistedFts: UnlistedFT[]
}

const useFetchSortFtsByWorth = ({ listedFts, unlistedFts, skip }: UseSortFTsProps) => {
  const { data: tokenPrices, isLoading } = useFetchTokenPrices({ skip })

  const sortedUnlistedFts = useMemo(
    () => (!skip ? orderBy(unlistedFts, ['name', 'id'], ['asc', 'asc']) : unlistedFts),
    [skip, unlistedFts]
  )

  const sortedListedFts = useMemo(
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
  )

  return {
    sortedUnlistedFts,
    sortedListedFts,
    isLoading
  }
}

export default useFetchSortFtsByWorth
