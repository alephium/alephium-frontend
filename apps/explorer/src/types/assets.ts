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
import { NFTTokenUriMetaData } from '@alephium/web3'
import { FungibleTokenMetadata, NFTMetadata as NFTMetadataBase } from '@alephium/web3/dist/src/api/api-explorer'

import client from '@/api/client'

export type AssetType = Awaited<ReturnType<typeof client.node.guessStdTokenType>>

export type AssetBase = { id: string; type: AssetType }

export type FungibleTokenMetadataBase = Omit<FungibleTokenMetadata, 'totalSupply' | 'decimals'> & {
  verified: boolean
  decimals: number
  worth?: number
  logoURI?: string
}

export type VerifiedFungibleTokenMetadata = TokenInfo & {
  type: 'fungible'
  verified: true
}

export type UnverifiedFungibleTokenMetadata = FungibleTokenMetadataBase & { type: 'fungible'; verified: false }

export type NFTMetadata = NFTMetadataBase & { type: 'non-fungible'; file?: NFTFile; verified: boolean }

export type NFTMetadataWithFile = Omit<NFTMetadata, 'file'> & { file: NFTFile }

export type UnverifiedNFTMetadata = NFTMetadata & { file?: NFTFile; verified: false }

export type UnverifiedNFTMetadataWithFile = UnverifiedNFTMetadata & { file: NFTFile }

export type NumericTokenBalance = { balance: bigint; lockedBalance: bigint }

export type NFTFile = NFTTokenUriMetaData & {
  assetId: string
}

export type AssetPriceResponse = { [tokenId: string]: { [currency: string]: number } }

export const isFungibleTokenMetadata = (
  meta: Partial<FungibleTokenMetadataBase> | Partial<NFTMetadata>
): meta is FungibleTokenMetadataBase => (meta as FungibleTokenMetadataBase).name !== undefined

export const isNFTMetadata = (meta: Partial<FungibleTokenMetadataBase> | Partial<NFTMetadata>): meta is NFTMetadata =>
  (meta as NFTMetadata).collectionId !== undefined
