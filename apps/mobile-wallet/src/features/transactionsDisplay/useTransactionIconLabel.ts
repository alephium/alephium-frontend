import { UseTransactionProps } from '@alephium/shared/types'
import { useTransactionInfoType } from '@alephium/shared-react'
import { LucideIconName } from '@react-native-vector-icons/lucide/static'
import { colord } from 'colord'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

const useTransactionIconLabel = (props: UseTransactionProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType(props)

  return {
    label: {
      incoming: t('Received'),
      outgoing: t('Sent'),
      pending: t('Pending'),
      dApp: t('dApp'),
      airdrop: t('Airdrop'),
      'dApp-failed': t('dApp'),
      'bidirectional-transfer': t('Swapped'),
      'wallet-self-transfer': t('Moved'),
      'address-self-transfer': t('Self transfer'),
      'address-group-transfer': t('Group transfer'),
      simulated: ''
    }[infoType],
    iconName: {
      incoming: 'arrow-down' as LucideIconName,
      outgoing: 'arrow-up' as LucideIconName,
      pending: 'circle-ellipsis' as LucideIconName,
      dApp: 'repeat' as LucideIconName,
      airdrop: 'arrow-big-down-dash' as LucideIconName,
      'dApp-failed': 'repeat' as LucideIconName,
      'bidirectional-transfer': 'repeat' as LucideIconName,
      'wallet-self-transfer': 'arrow-left-right' as LucideIconName,
      'address-self-transfer': 'refresh-ccw' as LucideIconName,
      'address-group-transfer': 'refresh-ccw' as LucideIconName,
      simulated: 'repeat' as LucideIconName
    }[infoType],
    iconColor: {
      incoming: theme.global.receive,
      outgoing: theme.global.send,
      pending: theme.font.secondary,
      dApp: theme.global.complementary,
      airdrop: theme.global.valid,
      'dApp-failed': colord(theme.global.complementary).alpha(0.5).toRgbString(),
      'bidirectional-transfer': theme.global.complementary,
      'wallet-self-transfer': theme.font.secondary,
      'address-self-transfer': theme.font.secondary,
      'address-group-transfer': theme.font.secondary,
      simulated: theme.global.complementary
    }[infoType],
    iconBgColor: {
      incoming: colord(theme.global.valid).alpha(0.08).toRgbString(),
      outgoing: colord(theme.global.send).alpha(0.11).toRgbString(),
      pending: colord(theme.font.secondary).alpha(0.11).toRgbString(),
      dApp: colord(theme.global.complementary).alpha(0.11).toRgbString(),
      airdrop: colord(theme.global.valid).alpha(0.08).toRgbString(),
      'dApp-failed': colord(theme.global.complementary).alpha(0.05).toRgbString(),
      'bidirectional-transfer': colord(theme.global.complementary).alpha(0.11).toRgbString(),
      'wallet-self-transfer': colord(theme.font.secondary).alpha(0.11).toRgbString(),
      'address-self-transfer': colord(theme.font.secondary).alpha(0.11).toRgbString(),
      'address-group-transfer': colord(theme.font.secondary).alpha(0.11).toRgbString(),
      simulated: colord(theme.global.complementary).alpha(0.11).toRgbString()
    }[infoType]
  }
}

export default useTransactionIconLabel
