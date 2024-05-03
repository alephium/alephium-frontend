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

import {
  AddressHash,
  AddressTransaction,
  AssetAmount,
  calcTxAmountsDeltaForAddress,
  getDirection,
  isConsolidationTx,
  isInternalTx,
  isMempoolTx,
  isSwap,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, explorer, MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import dayjs from 'dayjs'

import { useAddressesFlattenKnownFungibleTokens } from '@/api/apiHooks'
import { SelectOption } from '@/components/Inputs/Select'
import i18n from '@/i18n'
import { store } from '@/storage/store'
import { TranslationKey } from '@/types/i18next'
import { Direction, TransactionInfo, TransactionTimePeriod } from '@/types/transactions'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

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

const now = dayjs()
const currentYear = now.year()
const today = now.format('DD/MM/YYYY')

export const timePeriodsOptions: SelectOption<TransactionTimePeriod>[] = [
  {
    value: '24h',
    label: i18n.t('Last 24h')
  },
  {
    value: '1w',
    label: i18n.t('Last week')
  },
  {
    value: '1m',
    label: i18n.t('Last month')
  },
  {
    value: '6m',
    label: i18n.t('Last 6 months')
  },
  {
    value: '12m',
    label: `${i18n.t('Last 12 months')}
    (${now.subtract(1, 'year').format('DD/MM/YYYY')}
    - ${today})`
  },
  {
    value: 'previousYear',
    label: `${i18n.t('Previous year')}
    (01/01/${currentYear - 1} - 31/12/${currentYear - 1})`
  },
  {
    value: 'thisYear',
    label: `${i18n.t('This year')} (01/01/${currentYear - 1} - ${today})`
  }
]

export const directionOptions: {
  value: Direction
  label: TranslationKey
}[] = [
  {
    label: 'Sent',
    value: 'out'
  },
  {
    label: 'Received',
    value: 'in'
  },
  {
    label: 'Moved',
    value: 'move'
  },
  {
    label: 'Swapped',
    value: 'swap'
  }
]

export const useTransactionInfo = (tx: AddressTransaction, showInternalInflows?: boolean): TransactionInfo => {
  const state = store.getState()
  const fungibleTokens = useAddressesFlattenKnownFungibleTokens()
  const internalAddresses = state.addresses.ids as AddressHash[]

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let lockTime: Date | undefined
  let tokens: Required<AssetAmount>[] = []

  if (isMempoolTx(tx)) {
    const pendingTxAmountsDelta = calcTxAmountsDeltaForAddress(tx, tx.internalAddressHash)
    amount = pendingTxAmountsDelta.alph
    tokens = pendingTxAmountsDelta.tokens
  } else {
    const txAmountsDelta = calcTxAmountsDeltaForAddress(
      tx,
      tx.internalAddressHashes.inputAddresses?.[0] || tx.internalAddressHashes.outputAddresses?.[0] || ''
    )
    amount = txAmountsDelta.alph
    tokens = txAmountsDelta.tokens
  }

  tokens = tokens.map((token) => ({ ...token, amount: token.amount }))

  if (isConsolidationTx(tx)) {
    direction = 'out'
    infoType = 'move'
  } else if (isSwap(amount, tokens)) {
    direction = 'swap'
    infoType = 'swap'
  } else if (isMempoolTx(tx)) {
    direction = getDirection(tx, tx.internalAddressHash)
    infoType = direction
  } else {
    const isInternalTransfer = isInternalTx(tx, internalAddresses)
    direction = getDirection(tx, tx.internalAddressHashes.inputAddresses[0])
    infoType =
      (isInternalTransfer && showInternalInflows && direction === 'out') || (isInternalTransfer && !showInternalInflows)
        ? 'move'
        : direction
  }

  lockTime = (tx.outputs ?? []).reduce(
    (a, b) =>
      a > new Date((b as explorer.AssetOutput).lockTime ?? 0) ? a : new Date((b as explorer.AssetOutput).lockTime ?? 0),
    new Date(0)
  )
  lockTime = lockTime.toISOString() === new Date(0).toISOString() ? undefined : lockTime

  const tokenAssets = [...tokens.map((token) => ({ ...token, ...fungibleTokens.find((t) => t.id === token.id) }))]
  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...tokenAssets] : tokenAssets

  return {
    assets,
    direction,
    infoType,
    lockTime
  }
}
