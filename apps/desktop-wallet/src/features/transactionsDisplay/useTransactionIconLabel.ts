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

import { AddressHash, isConfirmedTx } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { colord } from 'colord'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis, Repeat, Repeat2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

const useTransactionIconLabel = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType(tx, addressHash, isInAddressDetailsModal)

  return isConfirmedTx(tx) && !tx.scriptExecutionOk
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

export default useTransactionIconLabel
