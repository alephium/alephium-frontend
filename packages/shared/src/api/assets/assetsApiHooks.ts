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

import { difference } from 'lodash'

import { useGetFungibleTokensMetadataQuery, useGetTokenListQuery } from '@/api/assets/fungibleTokensApi'
import { useGetAssetsGenericInfoQuery } from '@/api/assets/genericAssetsApi'
import { useGetNftsMetadataQuery } from '@/api/assets/nftsApi'
import { Asset, NetworkName } from '@/types'

export const useGetAssetsMetadata = (assetIds: Asset['id'][], networkName: NetworkName) => {
  const tokenList = useGetTokenListQuery(networkName).data?.tokens
  const tokensInTokenList = tokenList?.filter((token) => assetIds.includes(token.id)) || []

  const genericInfoOfRemainingAssets =
    useGetAssetsGenericInfoQuery(difference(assetIds, tokensInTokenList?.map((t) => t.id))).data || []

  const fungibleTokensMetadata =
    useGetFungibleTokensMetadataQuery(
      genericInfoOfRemainingAssets.filter((t) => t.stdInterfaceId === 'fungible').map((t) => t.token)
    )?.data || []

  const nftTokensMetadata =
    useGetNftsMetadataQuery(
      genericInfoOfRemainingAssets.filter((t) => t.stdInterfaceId === 'non-fungible').map((t) => t.token)
    )?.data || []

  return [...tokensInTokenList, ...fungibleTokensMetadata, ...nftTokensMetadata]
}

// TODO: get list from backend (enum?)
// See: https://github.com/alephium/explorer-backend/issues/512
export const TOKENS_WITH_PRICE = ['ALPH', 'USDT', 'USDC', 'DAI', 'WBTC', 'WETH', 'AYIN']
export const useTokensWithAvailablePrice = () => TOKENS_WITH_PRICE
