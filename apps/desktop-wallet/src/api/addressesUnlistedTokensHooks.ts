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

import { AddressHash, throttledClient, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { chunk } from 'lodash'

import useAddressesUnlistedTokensByType from '@/api/apiDataHooks/useAddressesUnlistedTokensByType'
import { convertTokenDecimalsToNumber } from '@/api/utils'
import { isDefined } from '@/utils/misc'

export const useAddressesUnlistedNonStandardTokenIds = (addressHash?: AddressHash) => {
  const {
    data: { 'non-standard': unlistedNonStandardTokenIds },
    isLoading
  } = useAddressesUnlistedTokensByType(addressHash)

  return {
    data: unlistedNonStandardTokenIds,
    isLoading
  }
}

export const useAddressesUnlistedFTs = (addressHash?: AddressHash) => {
  const {
    data: { fungible: unlistedFungibleTokenIds },
    isLoading: isLoadingUnlistedTokenTypes
  } = useAddressesUnlistedTokensByType(addressHash)

  const { data, isLoading } = useQueries({
    queries: chunk(unlistedFungibleTokenIds, TOKENS_QUERY_LIMIT).map((ids) => ({
      queryKey: ['tokens', 'fungible', 'unlisted', ids],
      queryFn: () => throttledClient.explorer.tokens.postTokensFungibleMetadata(ids),
      staleTime: Infinity
    })),
    combine: (results) => ({
      data: results.flatMap(({ data }) => data && data.map(convertTokenDecimalsToNumber)).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoading || isLoadingUnlistedTokenTypes
  }
}
