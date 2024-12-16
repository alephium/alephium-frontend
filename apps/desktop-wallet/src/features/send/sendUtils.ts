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
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, MIN_UTXO_SET_AMOUNT } from '@alephium/web3'

import { TokenApiBalances } from '@/types/tokens'

export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length)

  return {
    attoAlphAmount: (alphAmount + minAlphAmountRequirement).toString(),
    extraAlphForDust: minAlphAmountRequirement,
    tokens
  }
}

export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const shouldBuildSweepTransactions = (assetAmounts: AssetAmount[], tokensBalances: TokenApiBalances[]) =>
  assetAmounts.length === tokensBalances.length &&
  tokensBalances.every(({ id, totalBalance }) => {
    const assetAmount = assetAmounts.find((asset) => asset.id === id)

    return totalBalance === (assetAmount?.amount ?? 0).toString()
  })
