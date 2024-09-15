/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash, calculateAmountWorth } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQueries } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import useAddressAlphBalances from '@/api/apiDataHooks/address/useAddressAlphBalances'
import useAddressTokensByType from '@/api/apiDataHooks/address/useAddressTokensByType'
import useTokenPrices from '@/api/apiDataHooks/useTokenPrices'
import { mapCombineDefined } from '@/api/apiDataHooks/utils'
import { fungibleTokenMetadataQuery } from '@/api/queries/tokenQueries'

interface UseAddressFTsProps {
  addressHash: AddressHash
  sort?: boolean
}

const useAddressFTs = ({ addressHash, sort = true }: UseAddressFTsProps) => {
  const { data: addressAlphBalances, isLoading: isLoadingAlphBalances } = useAddressAlphBalances({ addressHash })
  const {
    data: { listedFTs, unlistedFTIds },
    isLoading: isLoadingTokensByType
  } = useAddressTokensByType(addressHash)

  const { data: unlistedFTs, isLoading: isLoadingUnlistedFTs } = useQueries({
    queries: unlistedFTIds.map((id) => fungibleTokenMetadataQuery({ id })),
    combine: mapCombineDefined
  })

  const { data: tokenPrices } = useTokenPrices({ skip: !sort })

  return {
    unlistedFTs: useMemo(
      () => (sort ? orderBy(unlistedFTs, ['name', 'id'], ['asc', 'asc']) : unlistedFTs),
      [sort, unlistedFTs]
    ),
    listedFTs: useMemo(
      () =>
        sort && addressAlphBalances?.balances
          ? orderBy(
              [...listedFTs, { ...ALPH, ...addressAlphBalances.balances }],
              [
                (token) => {
                  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

                  return tokenPrice !== undefined
                    ? calculateAmountWorth(token.totalBalance, tokenPrice, token.decimals)
                    : -1
                },
                'name',
                'id'
              ],
              ['desc', 'asc', 'asc']
            )
          : listedFTs,
      [sort, addressAlphBalances?.balances, listedFTs, tokenPrices]
    ),
    isLoading: isLoadingAlphBalances || isLoadingUnlistedFTs || isLoadingTokensByType
  }
}

export default useAddressFTs
