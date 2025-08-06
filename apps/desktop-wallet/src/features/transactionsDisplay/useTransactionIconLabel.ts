import { isConfirmedTx, UseTransactionProps } from '@alephium/shared'
import { useTransactionInfoType2 } from '@alephium/shared-react'
import { colord } from 'colord'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis, RefreshCcw, Repeat, Repeat2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

const useTransactionIconLabel = (props: UseTransactionProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType2(props)

  return isConfirmedTx(props.tx) && !props.tx.scriptExecutionOk
    ? {
        label: t('dApp operation'),
        Icon: Repeat2,
        iconColor: colord(theme.global.complementary).alpha(0.5).toRgbString(),
        iconBgColor: colord(theme.global.complementary).alpha(0.05).toRgbString()
      }
    : {
        label: {
          incoming: t('Received'),
          outgoing: t('Sent'),
          'wallet-self-transfer': t('Moved'),
          'address-self-transfer': t('Self transfer'),
          'address-group-transfer': t('Group transfer'),
          pending: t('Pending'),
          dApp: t('dApp operation')
        }[infoType],
        Icon: {
          incoming: ArrowDown,
          outgoing: ArrowUp,
          'wallet-self-transfer': ArrowLeftRight,
          'address-self-transfer': RefreshCcw,
          'address-group-transfer': RefreshCcw,
          pending: CircleEllipsis,
          dApp: Repeat
        }[infoType],
        iconColor: {
          incoming: theme.global.valid,
          outgoing: theme.font.highlight,
          'wallet-self-transfer': theme.font.secondary,
          'address-self-transfer': theme.font.secondary,
          'address-group-transfer': theme.font.secondary,
          pending: theme.font.secondary,
          dApp: theme.global.complementary
        }[infoType],
        iconBgColor: {
          incoming: colord(theme.global.valid).alpha(0.08).toRgbString(),
          outgoing: colord(theme.font.highlight).alpha(0.08).toRgbString(),
          'wallet-self-transfer': colord(theme.font.secondary).alpha(0.08).toRgbString(),
          'address-self-transfer': colord(theme.font.secondary).alpha(0.08).toRgbString(),
          'address-group-transfer': colord(theme.font.secondary).alpha(0.08).toRgbString(),
          pending: colord(theme.font.secondary).alpha(0.08).toRgbString(),
          dApp: colord(theme.global.complementary).alpha(0.08).toRgbString()
        }[infoType]
      }
}

export default useTransactionIconLabel
