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

import { AddressHash, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { chunk } from 'lodash'

import useAddressesListedFTs from '@/api/apiDataHooks/useAddressesListedFTs'
import { combineIsLoading } from '@/api/apiDataHooks/utils'
import { tokenTypesQuery, TokenTypesQueryFnData } from '@/api/queries/tokenQueries'

interface AddressesUnlistedTokenTypes {
  data: TokenTypesQueryFnData
  isLoading: boolean
}

const useAddressesUnlistedTokensByType = (addressHash?: AddressHash): AddressesUnlistedTokenTypes => {
  const { unknownTypeTokenIds, isLoading: isLoadingUnknownTypeTokens } = useAddressesListedFTs(addressHash)

  const { data: tokensByType, isLoading: isLoadingTokensTypes } = useQueries({
    queries: chunk(unknownTypeTokenIds, TOKENS_QUERY_LIMIT).map(tokenTypesQuery),
    combine
  })

  return {
    data: tokensByType,
    isLoading: isLoadingUnknownTypeTokens || isLoadingTokensTypes
  }
}

export default useAddressesUnlistedTokensByType

const combine = (results: UseQueryResult<TokenTypesQueryFnData>[]) => ({
  data: results.reduce(
    (tokenIdsByTypeMerged, { data: tokenIdsByTypeChunk }) => {
      if (!tokenIdsByTypeChunk) return tokenIdsByTypeMerged

      const { fungible, ['non-fungible']: nonFungible, ['non-standard']: nonStandard } = tokenIdsByTypeChunk

      tokenIdsByTypeMerged.fungible = tokenIdsByTypeMerged.fungible.concat(fungible)
      tokenIdsByTypeMerged['non-fungible'] = tokenIdsByTypeMerged['non-fungible'].concat(nonFungible)
      tokenIdsByTypeMerged['non-standard'] = tokenIdsByTypeMerged['non-standard'].concat(nonStandard)

      return tokenIdsByTypeMerged
    },
    {
      [explorer.TokenStdInterfaceId.Fungible]: [],
      [explorer.TokenStdInterfaceId.NonFungible]: [],
      [explorer.TokenStdInterfaceId.NonStandard]: []
    } as AddressesUnlistedTokenTypes['data']
  ),
  ...combineIsLoading(results)
})
