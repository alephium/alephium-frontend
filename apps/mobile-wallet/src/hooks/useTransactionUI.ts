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

import { TransactionInfoType } from '@alephium/shared'
import { colord } from 'colord'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis, Repeat, Repeat2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

interface TransactionUIProps {
  infoType: TransactionInfoType
  isFailedScriptTx: boolean
}

export const useTransactionUI = ({ infoType, isFailedScriptTx }: TransactionUIProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return isFailedScriptTx
    ? {
        label: t('dApp'),
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
          swap: t('dApp')
        }[infoType],
        Icon: {
          in: ArrowDown,
          out: ArrowUp,
          move: ArrowLeftRight,
          pending: CircleEllipsis,
          swap: Repeat
        }[infoType],
        iconColor: {
          in: theme.global.receive,
          out: theme.global.send,
          move: theme.font.secondary,
          pending: theme.font.secondary,
          swap: theme.global.complementary
        }[infoType],
        iconBgColor: {
          in: colord(theme.global.receive).alpha(0.11).toRgbString(),
          out: colord(theme.global.send).alpha(0.11).toRgbString(),
          move: colord(theme.font.secondary).alpha(0.11).toRgbString(),
          pending: colord(theme.font.secondary).alpha(0.11).toRgbString(),
          swap: colord(theme.global.complementary).alpha(0.11).toRgbString()
        }[infoType]
      }
}
