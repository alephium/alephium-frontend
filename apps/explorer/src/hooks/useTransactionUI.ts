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
import { RiArrowDownLine, RiArrowLeftRightLine, RiArrowUpLine, RiRepeat2Line } from 'react-icons/ri'
import { DefaultTheme } from 'styled-components'

import LoadingSpinner from '@/components/LoadingSpinner'
import i18next from '@/i18n'

interface TransactionUIProps {
  infoType: TransactionInfoType
  isFailedScriptTx: boolean
  isInContract: boolean
}

// Override badge if it's a failed script execution or is inside a contract.
// TODO: Better (better way to define infoType by looking at presence of script)
// Use script field in tx once available https://github.com/alephium/explorer-backend/issues/485

export const getTransactionUI = ({
  infoType,
  isFailedScriptTx,
  isInContract,
  theme
}: TransactionUIProps & { theme: DefaultTheme }) => {
  if (!isFailedScriptTx && !isInContract) {
    return {
      label: {
        in: i18next.t('Incoming transfer'),
        out: i18next.t('Outgoing transfer'),
        move: i18next.t('Self transfer'),
        pending: i18next.t('Pending'),
        swap: i18next.t('dApp operation')
      }[infoType],
      Icon: {
        in: RiArrowDownLine,
        out: RiArrowUpLine,
        move: RiArrowLeftRightLine,
        pending: LoadingSpinner,
        swap: RiRepeat2Line
      }[infoType],
      badgeColor: {
        in: theme.global.valid,
        out: theme.font.highlight,
        move: theme.font.secondary,
        pending: theme.font.secondary,
        swap: theme.global.complementary
      }[infoType],
      badgeBgColor: {
        in: colord(theme.global.valid).alpha(0.12).toRgbString(),
        out: colord(theme.font.highlight).alpha(0.12).toRgbString(),
        move: colord(theme.font.secondary).alpha(0.12).toRgbString(),
        pending: colord(theme.font.secondary).alpha(0.12).toRgbString(),
        swap: colord(theme.global.complementary).alpha(0.12).toRgbString()
      }[infoType],
      directionText: {
        move: i18next.t('inside'),
        out: i18next.t('to'),
        swap: i18next.t('with'),
        pending: '...',
        in: i18next.t('from')
      }[infoType]
    }
  } else if (isInContract) {
    return {
      label: i18next.t('Contract operation'),
      Icon: undefined,
      badgeColor: theme.font.secondary,
      badgeBgColor: theme.border.secondary,
      directionText: i18next.t('with')
    }
  } else if (isFailedScriptTx) {
    return {
      label: i18next.t('dApp operation'),
      Icon: RiRepeat2Line,
      badgeColor: colord(theme.global.complementary).alpha(0.5).toRgbString(),
      badgeBgColor: colord(theme.global.complementary).alpha(0.05).toRgbString(),
      directionText: i18next.t('with')
    }
  } else {
    return {
      label: '',
      Icon: undefined,
      badgeColor: 'transparent',
      badgeBgColor: 'transparent',
      directionText: ''
    }
  }
}
