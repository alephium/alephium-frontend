import { UseTransactionProps } from '@alephium/shared'
import { useTransactionInfoType } from '@alephium/shared-react'
import { colord } from 'colord'
import {
  ArrowBigDownDash,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  CircleEllipsis,
  RefreshCcw,
  Repeat,
  Repeat2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

const useTransactionIconLabel = (props: UseTransactionProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType(props)

  return {
    label: {
      incoming: t('Received'),
      outgoing: t('Sent'),
      pending: t('Pending'),
      dApp: t('dApp operation'),
      airdrop: t('Airdrop'),
      'dApp-failed': t('dApp operation'),
      'bidirectional-transfer': t('Swapped'),
      'wallet-self-transfer': t('Moved'),
      'address-self-transfer': t('Self transfer'),
      'address-group-transfer': t('Group transfer')
    }[infoType],
    connectingWord: {
      incoming: t('from'),
      outgoing: t('to'),
      pending: '',
      dApp: t('with'),
      airdrop: t('from'),
      'dApp-failed': t('with'),
      'bidirectional-transfer': t('with'),
      'wallet-self-transfer': '',
      'address-self-transfer': '',
      'address-group-transfer': ''
    }[infoType],
    Icon: {
      incoming: ArrowDown,
      outgoing: ArrowUp,
      pending: CircleEllipsis,
      dApp: Repeat,
      airdrop: ArrowBigDownDash,
      'dApp-failed': Repeat2,
      'bidirectional-transfer': Repeat,
      'wallet-self-transfer': ArrowLeftRight,
      'address-self-transfer': RefreshCcw,
      'address-group-transfer': RefreshCcw
    }[infoType],
    iconColor: {
      incoming: theme.global.valid,
      outgoing: theme.font.highlight,
      pending: theme.font.secondary,
      dApp: theme.global.complementary,
      airdrop: theme.global.valid,
      'dApp-failed': colord(theme.global.complementary).alpha(0.5).toRgbString(),
      'bidirectional-transfer': theme.global.complementary,
      'wallet-self-transfer': theme.font.secondary,
      'address-self-transfer': theme.font.secondary,
      'address-group-transfer': theme.font.secondary
    }[infoType],
    iconBgColor: {
      incoming: colord(theme.global.valid).alpha(0.08).toRgbString(),
      outgoing: colord(theme.font.highlight).alpha(0.08).toRgbString(),
      pending: colord(theme.font.secondary).alpha(0.08).toRgbString(),
      dApp: colord(theme.global.complementary).alpha(0.08).toRgbString(),
      airdrop: colord(theme.global.valid).alpha(0.08).toRgbString(),
      'dApp-failed': colord(theme.global.complementary).alpha(0.05).toRgbString(),
      'bidirectional-transfer': colord(theme.global.complementary).alpha(0.08).toRgbString(),
      'wallet-self-transfer': colord(theme.font.secondary).alpha(0.08).toRgbString(),
      'address-self-transfer': colord(theme.font.secondary).alpha(0.08).toRgbString(),
      'address-group-transfer': colord(theme.font.secondary).alpha(0.08).toRgbString()
    }[infoType]
  }
}

export default useTransactionIconLabel
