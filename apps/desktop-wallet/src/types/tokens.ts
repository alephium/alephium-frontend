import { FungibleTokenBasicMetadata, NFT, StringAlias } from '@alephium/shared'
import { TokenInfo } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'

// For better code readability
export interface ListedFT extends TokenInfo {}
export interface UnlistedFT extends FungibleTokenBasicMetadata {}
export interface NonStandardToken {
  id: string
}

// To represent a token that is not in the token list but we haven't discovered its type yet
export type UnlistedToken = { id: string }

// For stricter typings in our components that handle display of multiple token types
export type TokenDisplay = ListedFTDisplay | UnlistedFTDisplay | NFTDisplay | NonStandardTokenDisplay

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
  id: e.Token['id']
}

export type TokenId = e.Token['id'] & StringAlias
