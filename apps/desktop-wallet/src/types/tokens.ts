import { FungibleTokenBasicMetadata, NFT, StringAlias } from '@alephium/shared'
import { TokenInfo } from '@alephium/token-list'

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
