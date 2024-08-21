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

import { FungibleTokenBasicMetadata, NFT } from '@alephium/shared'
import { TokenInfo } from '@alephium/token-list'

// For better code readability
export interface ListedFT extends TokenInfo {}
export interface UnlistedFT extends FungibleTokenBasicMetadata {}
export interface NonStandardToken {
  id: string
}

// For stricter typings in our components that handle display of multiple token types
export type TokenDisplay = ListedFTDisplay | UnlistedFTDisplay | NFTDisplay | NonStandardTokenDisplay

export type ListedFTDisplay = ListedFT & {
  type: 'listedFT'
  worth?: number
  balance?: bigint
  availableBalance?: bigint
}

export type UnlistedFTDisplay = UnlistedFT & {
  type: 'unlistedFT'
  balance?: bigint
  availableBalance?: bigint
}

export type NFTDisplay = NFT & {
  type: 'NFT'
}

export type NonStandardTokenDisplay = NonStandardToken & {
  type: 'nonStandardToken'
  balance?: bigint
  availableBalance?: bigint
}
