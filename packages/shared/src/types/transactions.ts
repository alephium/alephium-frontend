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
import { Optional } from '@alephium/web3'
import { AddressBalance, Token } from '@alephium/web3/dist/src/api/api-explorer'

export type TokenBalances = AddressBalance & { id: Token['id'] }

// Same as TokenBalances, but amounts are in BigInt, useful for display purposes
export type TokenDisplayBalances = Omit<TokenBalances, 'balance' | 'lockedBalance'> & {
  balance: bigint
  lockedBalance: bigint
}

export type FungibleToken = TokenInfo & { verified?: boolean }

export type Asset = TokenDisplayBalances & Optional<FungibleToken, 'symbol' | 'name'>

export type AddressFungibleToken = FungibleToken & TokenDisplayBalances

export type VerifiedAddressFungibleToken = AddressFungibleToken & { verified: true }

export type AssetAmount = { id: Asset['id']; amount?: bigint }

export type TransactionInfoAsset = Optional<Omit<Asset, 'balance' | 'lockedBalance'>, 'decimals'> &
  Required<AssetAmount>

export type TransactionInfo = {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  lockTime?: Date
}

export type TransactionDirection = 'out' | 'in' | 'swap'

export type TransactionInfoType = TransactionDirection | 'move' | 'pending'

export type AmountDeltas = {
  alph: bigint
  tokens: {
    id: Token['id']
    amount: bigint
  }[]
}
