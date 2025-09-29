import { TransactionInfoType2 } from '@alephium/shared'
import dayjs from 'dayjs'

import { SelectOption } from '@/components/Inputs/Select'
import i18n from '@/features/localization/i18n'
import { TranslationKey } from '@/features/localization/i18next'
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
    value: 'sent'
  },
  {
    label: 'Received',
    value: 'received'
  },
  {
    label: 'Moved',
    value: 'moved'
  },
  {
    label: 'Swapped',
    value: 'swapped'
  },
  {
    label: 'dApp operation',
    value: 'dApp'
  }
]

export const infoTypeToDirection = (infoType: TransactionInfoType2): Direction =>
  ({
    incoming: 'received',
    airdrop: 'received',
    outgoing: 'sent',
    pending: 'sent',
    dApp: 'dApp',
    'dApp-failed': 'dApp',
    'bidirectional-transfer': 'swapped',
    'wallet-self-transfer': 'moved',
    'address-self-transfer': 'moved',
    'address-group-transfer': 'moved',
    simulated: 'dApp'
  })[infoType] as Direction
