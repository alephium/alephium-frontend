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

import dayjs from 'dayjs'

import { SelectOption } from '@/components/Inputs/Select'
import i18n from '@/i18n'
import { TranslationKey } from '@/types/i18next'
import { Direction, TransactionTimePeriod } from '@/types/transactions'

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
