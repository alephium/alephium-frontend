import { TokenInfo } from '@alephium/token-list'
import { NFTTokenUriMetaData } from '@alephium/web3'
import { FungibleTokenMetadata, NFTMetadata as NFTMetadataBase } from '@alephium/web3/api/explorer'

import client from '@/api/client'

export type AssetType = Awaited<ReturnType<typeof client.node.guessStdTokenType>>

export type AssetBase = { id: string; type: AssetType }

type FungibleTokenMetadataBase = Omit<FungibleTokenMetadata, 'totalSupply' | 'decimals'> & {
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

type NFTMetadata = NFTMetadataBase & { type: 'non-fungible'; file?: NFTFile; verified: boolean }

export type NFTMetadataWithFile = Omit<NFTMetadata, 'file'> & { file: NFTFile }

export type UnverifiedNFTMetadata = NFTMetadata & { file?: NFTFile; verified: false }

type NFTFile = NFTTokenUriMetaData & {
  assetId: string
}
