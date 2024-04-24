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

import { explorer } from '@alephium/web3'
import { TokenStdInterfaceId } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries, useQuery } from '@tanstack/react-query'

import { getFungibleTokenMetadataQuery, getTokenListQuery } from '@/api/assets/fungibleTokensApi'
import { getTokenGenericInfoQuery } from '@/api/assets/genericAssetsApi'
import { useGetNftsMetadataQuery } from '@/api/assets/nftsApi'
import { combineQueriesResult } from '@/api/useCombinedQueries'
import { Asset, NetworkName } from '@/types'

export const useGetTokenList = (networkName: NetworkName) => useQuery(getTokenListQuery(networkName))

export const useGetAssetsMetadata = (assetIds: Asset['id'][], networkName: NetworkName) => {
  const { data: tokenListResult } = useGetTokenList(networkName)
  const tokensInTokenList = tokenListResult?.tokens.filter((token) => assetIds.includes(token.id)) || []

  // TODO: Solve this context issue. Should it go to shared-react?... Should we use the queryClient directly?
  const genericInfoOfNonListedAssets = useQueries({
    queries: assetIds.map((id) => getTokenGenericInfoQuery(id)),
    combine: combineQueriesResult
  }).data

  const groupedTokenIdsOfNonListedAssets = genericInfoOfNonListedAssets.reduce(
    (acc, item) => {
      const key = (item?.stdInterfaceId || explorer.TokenStdInterfaceId.NonStandard) as TokenStdInterfaceId

      return {
        ...acc,
        [key]: [...(acc[key] || []), item?.token]
      }
    },
    {} as Record<TokenStdInterfaceId, string[] | undefined>
  )

  const fungibleTokensMetadata = useQueries({
    queries:
      groupedTokenIdsOfNonListedAssets[explorer.TokenStdInterfaceId.Fungible]?.map((id) =>
        getFungibleTokenMetadataQuery(id)
      ) || [],
    combine: combineQueriesResult
  }).data

  const nftTokensMetadata =
    useGetNftsMetadataQuery(groupedTokenIdsOfNonListedAssets?.[explorer.TokenStdInterfaceId.NonFungible] || [])?.data ||
    []

  const unknownTokensIds =
    genericInfoOfNonListedAssets
      ?.filter((i) => groupedTokenIdsOfNonListedAssets?.[explorer.TokenStdInterfaceId.NonStandard]?.includes(i.token))
      .map((u) => ({ id: u.token })) || []

  return {
    groupedKnown: {
      listed: tokensInTokenList,
      fungible: fungibleTokensMetadata,
      nft: nftTokensMetadata
    },
    flattenKnown: [...tokensInTokenList, ...fungibleTokensMetadata, ...nftTokensMetadata],
    unknown: unknownTokensIds
  }
}

// TODO: get list from backend (enum?)
// See: https://github.com/alephium/explorer-backend/issues/512
export const TOKENS_WITH_PRICE = ['ALPH', 'USDT', 'USDC', 'DAI', 'WBTC', 'WETH', 'AYIN']
export const useTokensWithAvailablePrice = () => TOKENS_WITH_PRICE
