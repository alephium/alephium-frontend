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
