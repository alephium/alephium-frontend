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

import { NFTMetaData } from '@alephium/web3'
import { FungibleTokenMetadata, MaxSizeTokens } from '@alephium/web3/dist/src/api/api-explorer'

import { Asset } from './transactions'

export const TOKENS_QUERY_LIMIT: MaxSizeTokens = 80

// We want to convert the type of decimals from string to number because our RAL
// interface allows U256 but it doesn't make sense to have more than 2 billion
// decimal points, that would be a 2GB long string. Besides, the decimals type
// of TokenInfo in @alephium/token-list as well as of FungibleTokenMetaData in
// @alephium/web3 are also number.
//
// https://github.com/alephium/alephium-web3/blob/master/packages/web3/std/fungible_token_interface.ral#L7
// https://github.com/alephium/token-list/blob/master/lib/types.ts#L30
// https://github.com/alephium/alephium-web3/blob/master/packages/web3/src/api/types.ts#L296
export type FungibleTokenBasicMetadata = Omit<FungibleTokenMetadata, 'decimals'> & { decimals: number }

export type NFT = {
  id: Asset['id']
  collectionId: NFTMetaData['collectionId']
  name?: string
  description?: string
  image?: string
}

export type SyncUnknownTokensInfoResult = {
  tokens: FungibleTokenBasicMetadata[]
  nfts: NFT[]
}
