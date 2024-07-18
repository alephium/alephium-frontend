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

import { AssetAmount } from '@alephium/shared'
import { TokenInfo } from '@alephium/token-list'
import { Optional } from '@alephium/web3'

export type AssetAmountInputType = AssetAmount & { amountInput?: string }

export type NewFungibleToken = ListedFungibleToken | UnlistedFungibleToken // TODO: Rename to FungibleToken when the one from shared is not needed anymore
export interface ListedFungibleToken extends TokenInfo {} // using interface instead of type to avoid seeing TokenInfo in IDE
export type UnlistedFungibleToken = Optional<ListedFungibleToken, 'logoURI' | 'description'> // TODO: Think about this again, maybe replace with FungibleTokenBasicMetadata?
