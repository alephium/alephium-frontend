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

import { assetsQueries } from '@/api/assets/assetsQueries'
import { combineQueriesResult } from '@/api/utils'
import { Asset, NetworkName } from '@/types'

export const useGetAssetsMetadata = (assetIds: Asset['id'][], networkName: NetworkName) => {
  const { data: tokenListResult, isPending: isTokenListPending } = useQuery(
    assetsQueries.tokenList.getTokenList(networkName)
  )

  const tokensInTokenList = tokenListResult?.tokens.filter((token) => assetIds.includes(token.id)) || []
  const nonListedAssetIds = assetIds.filter((id) => !tokensInTokenList.map((t) => t.id).includes(id))

  const { data: genericInfoOfNonListedAssets, isPending: isGenericInfoPending } = useQueries({
    queries: nonListedAssetIds.map((id) => assetsQueries.generic.getTokenGenericInfo(id)),
    combine: combineQueriesResult
  })

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

  const { data: fungibleTokensMetadata, isPending: isFungibleTokensMetadataPending } = useQueries({
    queries:
      groupedTokenIdsOfNonListedAssets[explorer.TokenStdInterfaceId.Fungible]?.map((id) =>
        assetsQueries.fungibleTokens.getFungibleTokenMetadata(id)
      ) || [],
    combine: combineQueriesResult
  })

  const { data: nftTokensMetadata, isPending: isNftTokensMetadataPending } = useQueries({
    queries:
      groupedTokenIdsOfNonListedAssets[explorer.TokenStdInterfaceId.NonFungible]?.map((id) =>
        assetsQueries.nfts.getNftMetadata(id)
      ) || [],
    combine: combineQueriesResult
  })

  const unknownTokensIds =
    genericInfoOfNonListedAssets
      ?.filter((i) => groupedTokenIdsOfNonListedAssets?.[explorer.TokenStdInterfaceId.NonStandard]?.includes(i.token))
      .map((u) => ({ id: u.token })) || []

  const isPending =
    isTokenListPending || isGenericInfoPending || isFungibleTokensMetadataPending || isNftTokensMetadataPending

  return {
    data: {
      groupedKnown: {
        listed: tokensInTokenList,
        fungible: fungibleTokensMetadata,
        nft: nftTokensMetadata
      },
      flattenKnown: [...tokensInTokenList, ...fungibleTokensMetadata, ...nftTokensMetadata],
      unknown: unknownTokensIds
    },
    isPending
  }
}

// TODO: get list from backend (enum?)
// See: https://github.com/alephium/explorer-backend/issues/512
export const TOKENS_WITH_PRICE = ['ALPH', 'USDT', 'USDC', 'DAI', 'WBTC', 'WETH', 'AYIN']
export const useTokensWithAvailablePrice = () => TOKENS_WITH_PRICE
