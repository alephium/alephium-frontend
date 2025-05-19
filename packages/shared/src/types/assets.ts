import { TokenInfo } from '@alephium/token-list'
import {
  explorer as e,
  FungibleTokenMetaData as FungibleTokenMetaDataBase,
  NFTTokenUriMetaData,
  Optional
} from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

import { StringAlias } from '@/types/utils'

export type TokenBalances = e.AddressBalance & { id: e.Token['id'] }

// Same as AddressBalance, but amounts are in BigInt, useful for display purposes
export type DisplayBalances = {
  balance: bigint
  lockedBalance: bigint
}

// Same as TokenBalances, but amounts are in BigInt, useful for display purposes, replaces AddressTokenBalance
export type TokenDisplayBalances = Omit<TokenBalances, 'balance' | 'lockedBalance'> & DisplayBalances

export type FungibleToken = Optional<TokenInfo, 'logoURI' | 'description'> & { verified?: boolean }

export type Asset = TokenDisplayBalances &
  Optional<FungibleToken, 'symbol' | 'name'> & {
    worth?: number
  }

export type AddressFungibleToken = Asset & FungibleToken & TokenDisplayBalances

export type VerifiedAddressFungibleToken = Asset & AddressFungibleToken & { verified: true }

export type AssetAmount = { id: Asset['id']; amount?: bigint }

// We want to convert the type of decimals from string to number because our RAL
// interface allows U256 but it doesn't make sense to have more than 2 billion
// decimal points, that would be a 2GB long string. Besides, the decimals type
// of TokenInfo in @alephium/token-list as well as of FungibleTokenMetaData in
// @alephium/web3 are also number.
//
// https://github.com/alephium/alephium-web3/blob/master/packages/web3/std/fungible_token_interface.ral#L7
// https://github.com/alephium/token-list/blob/master/lib/types.ts#L30
// https://github.com/alephium/alephium-web3/blob/master/packages/web3/src/api/types.ts#L296
export type FungibleTokenBasicMetadata = Omit<e.FungibleTokenMetadata, 'decimals'> &
  Omit<FungibleTokenMetaDataBase, 'totalSupply'>

export enum NFTDataTypes {
  image = 'image',
  video = 'video',
  audio = 'audio',
  other = 'other'
}

export type NFTDataType = keyof typeof NFTDataTypes

export type NFT = NFTTokenUriMetaData & Omit<e.NFTMetadata, 'tokenUri'> & { dataType: NFTDataType }

export interface FungibleTokensState extends EntityState<FungibleToken> {
  loadingVerified: boolean
  loadingUnverified: boolean
  loadingTokenTypes: boolean
  status: 'initialized' | 'uninitialized' | 'initialization-failed'
  checkedUnknownTokenIds: FungibleToken['id'][]
}

export interface NFTsState extends EntityState<NFT> {
  loading: boolean
}

// For better code readability
export interface ListedFT extends TokenInfo {}
export interface UnlistedFT extends FungibleTokenBasicMetadata {}
export interface NonStandardToken {
  id: string
}

// To represent a token that is not in the token list but we haven't discovered its type yet
export type UnlistedToken = { id: TokenId }

// For stricter typings in our components that handle display of multiple token types
export type TokenDisplay = ListedFTDisplay | UnlistedFTDisplay | NFTDisplay | NonStandardTokenDisplay

export type Token = ListedFT | UnlistedFT | NFT | NonStandardToken

export type ListedFTDisplay = ApiBalances &
  ListedFT & {
    type: 'listedFT'
    worth?: number
  }

export type UnlistedFTDisplay = ApiBalances &
  UnlistedFT & {
    type: 'unlistedFT'
  }

export type NFTDisplay = NFT & {
  type: 'NFT'
}

export type NonStandardTokenDisplay = ApiBalances &
  NonStandardToken & {
    type: 'nonStandardToken'
  }

export type ApiBalances = {
  totalBalance: string
  lockedBalance: string
  availableBalance: string
}

export type TokenApiBalances = ApiBalances & {
  id: TokenId
}

export type TokenId = Token['id'] & StringAlias

export const isFT = (token: Token): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isListedFT = (token: Token): token is ListedFT => (token as ListedFT).logoURI !== undefined

export const isUnlistedFT = (token: Token) => isFT(token) && !isListedFT(token)

export const isNFT = (token: Token): token is NFT => (token as NFT).nftIndex !== undefined

export type FtListMap = Record<TokenId, TokenInfo | undefined>

export interface HiddenTokensState {
  hiddenTokensIds: Array<TokenId>
  loadedFromStorage: boolean
}
