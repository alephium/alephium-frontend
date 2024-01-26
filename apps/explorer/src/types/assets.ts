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

import { TokenInfo } from '@alephium/token-list'
import { FungibleTokenMetaData, NFTMetaData } from '@alephium/web3'

import client from '@/api/client'

export type AssetType = Awaited<ReturnType<typeof client.node.guessStdTokenType>>

export type AssetBase = { id: string; type: AssetType }

export type FungibleTokenMetadata = Omit<FungibleTokenMetaData, 'totalSupply'> & { id: string; verified: boolean }

export type VerifiedFungibleTokenMetadata = TokenInfo & { type: 'fungible'; verified: true }

export type UnverifiedFungibleTokenMetadata = TokenInfo & { type: 'fungible'; verified: false }

export type UnverifiedNFTMetadata = NFTMetaData & { id: string; type: 'non-fungible'; verified: false }

export type UnverifiedNFTMetadataWithFile = UnverifiedNFTMetadata & { file: NFTFile }

export type NumericTokenBalance = { balance: bigint; lockedBalance: bigint }

export type NFTFile = {
  assetId: string
  name?: string
  description?: string
  image?: string
}

export type AssetPriceResponse = { [tokenId: string]: { [currency: string]: number } }

export const isFungibleTokenMetadata = (
  meta: Partial<FungibleTokenMetaData> | Partial<NFTMetaData>
): meta is FungibleTokenMetaData => (meta as FungibleTokenMetaData).name !== undefined

export const isNFTMetadata = (meta: Partial<FungibleTokenMetaData> | Partial<NFTMetaData>): meta is NFTMetaData =>
  (meta as NFTMetaData).collectionId !== undefined
