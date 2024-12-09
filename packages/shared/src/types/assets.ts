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
import {
  explorer as e,
  FungibleTokenMetaData as FungibleTokenMetaDataBase,
  NFTTokenUriMetaData,
  Optional
} from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

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

export type AddressFungibleToken = FungibleToken & TokenDisplayBalances

export type VerifiedAddressFungibleToken = AddressFungibleToken & { verified: true }

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

export type NFT = NFTTokenUriMetaData & Omit<e.NFTMetadata, 'tokenUri'>

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
