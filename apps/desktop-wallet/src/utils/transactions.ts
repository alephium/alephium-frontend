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
  AssetAmount,
  calcTxAmountsDeltaForAddress,
  convertToNegative,
  hasPositiveAndNegativeAmounts,
  isConsolidationTx,
  isInternalTx,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { AssetOutput, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { colord } from 'colord'
import dayjs from 'dayjs'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis, Repeat, Repeat2 } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { SelectOption } from '@/components/Inputs/Select'
import { useAppSelector } from '@/hooks/redux'
import i18n from '@/i18n'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { store } from '@/storage/store'
import { TranslationKey } from '@/types/i18next'
import { Direction, PendingTransaction, TransactionTimePeriod } from '@/types/transactions'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const isPendingTx = (tx: Transaction | PendingTransaction): tx is PendingTransaction =>
  (tx as PendingTransaction).status === 'pending'

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

export const calcPendingTxAmountsDelta = (tx: PendingTransaction) => ({
  alphAmount: tx.amount ? convertToNegative(BigInt(tx.amount)) : BigInt(0),
  tokenAmounts: tx.tokens
    ? tx.tokens.map((token) => ({ ...token, amount: convertToNegative(BigInt(token.amount)) }))
    : []
})

export const useTransactionAmountDeltas = (tx: Transaction | PendingTransaction, addressHash: AddressHash) =>
  useMemo(() => getTransactionAmountDeltas(tx, addressHash), [addressHash, tx])

export const getTransactionAmountDeltas = (tx: Transaction | PendingTransaction, addressHash: AddressHash) =>
  isPendingTx(tx) ? calcPendingTxAmountsDelta(tx) : calcTxAmountsDeltaForAddress(tx, addressHash)

export const useTransactionDirection = (
  tx: Transaction | PendingTransaction,
  addressHash: AddressHash
): TransactionDirection => {
  const internalAddresses = useAppSelector(selectAllAddressHashes)

  return useMemo(() => {
    if (isPendingTx(tx)) {
      if (internalAddresses.includes(tx.toAddress)) {
        if (addressHash === tx.fromAddress) {
          return 'out'
        } else {
          return 'in'
        }
      } else {
        return 'out'
      }
    } else if (isConsolidationTx(tx)) {
      return 'out'
    } else {
      const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

      if (hasPositiveAndNegativeAmounts(alphAmount, tokenAmounts)) {
        return 'swap'
      } else {
        // tokenAmounts is checked in the swap condition
        if (alphAmount < 0) {
          return 'out'
        } else {
          return 'in'
        }
      }
    }
  }, [addressHash, internalAddresses, tx])
}

export const useTransactionInfoType = (
  tx: Transaction | PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType =>
  useMemo(
    () => getTransactionInfoType(tx, addressHash, isInAddressDetailsModal),
    [addressHash, isInAddressDetailsModal, tx]
  )

export const getTransactionInfoType = (
  tx: Transaction | PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  const state = store.getState()
  const internalAddresses = state.addresses.ids as AddressHash[]

  if (isPendingTx(tx)) {
    return 'pending'
  } else if (isConsolidationTx(tx)) {
    return 'move'
  } else {
    const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

    if (hasPositiveAndNegativeAmounts(alphAmount, tokenAmounts)) {
      return 'swap'
    } else {
      const isInternalTransfer = isInternalTx(tx, internalAddresses)
      const alphAmountReduced = alphAmount < 0 // tokenAmounts is checked in the swap condition

      if (
        (isInternalTransfer && isInAddressDetailsModal && alphAmountReduced) ||
        (isInternalTransfer && !isInAddressDetailsModal)
      ) {
        return 'move'
      } else {
        if (alphAmountReduced) {
          return 'out'
        } else {
          return 'in'
        }
      }
    }
  }
}

export const useTransactionLockTime = (tx: Transaction | PendingTransaction) =>
  useMemo(() => {
    if (isPendingTx(tx)) {
      if (tx.lockTime) return new Date(tx.lockTime)
    } else {
      if (tx.outputs) {
        // TODO: The current algorithm finds lock time of ANY output that is the furthest in the future. But this is not
        // a good representation of a transaction lock time. Some of the transaction outputs might be locked, some might
        // not. We only care to see if the same outputs that are used to calculate the transaction delta amouts are also
        // locked. The algorithm needs to be rewored. See https://github.com/alephium/alephium-frontend/issues/550
        const latestLockTime = (tx.outputs as AssetOutput[]).reduce(
          (acc, output) => (acc > new Date(output.lockTime ?? 0) ? acc : new Date(output.lockTime ?? 0)),
          new Date(0)
        )

        return latestLockTime.toISOString() === new Date(0).toISOString() ? undefined : latestLockTime
      }
    }
  }, [tx])

export const useTransactionIconLabel = (
  tx: Transaction | PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType(tx, addressHash, isInAddressDetailsModal)

  return !isPendingTx(tx) && !tx.scriptExecutionOk
    ? {
        label: t('dApp operation'),
        Icon: Repeat2,
        iconColor: colord(theme.global.complementary).alpha(0.5).toRgbString(),
        iconBgColor: colord(theme.global.complementary).alpha(0.05).toRgbString()
      }
    : {
        label: {
          in: t('Received'),
          out: t('Sent'),
          move: t('Moved'),
          pending: t('Pending'),
          swap: t('dApp operation')
        }[infoType],
        Icon: {
          in: ArrowDown,
          out: ArrowUp,
          move: ArrowLeftRight,
          pending: CircleEllipsis,
          swap: Repeat
        }[infoType],
        iconColor: {
          in: theme.global.valid,
          out: theme.font.highlight,
          move: theme.font.secondary,
          pending: theme.font.secondary,
          swap: theme.global.complementary
        }[infoType],
        iconBgColor: {
          in: colord(theme.global.valid).alpha(0.08).toRgbString(),
          out: colord(theme.font.highlight).alpha(0.08).toRgbString(),
          move: colord(theme.font.secondary).alpha(0.08).toRgbString(),
          pending: colord(theme.font.secondary).alpha(0.08).toRgbString(),
          swap: colord(theme.global.complementary).alpha(0.08).toRgbString()
        }[infoType]
      }
}
