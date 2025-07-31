import { AddressHash, isConfirmedTx } from '@alephium/shared'
import { useTransactionInfoType2 } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { colord } from 'colord'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis, RefreshCcw, Repeat, Repeat2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

const useTransactionIconLabel2 = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash,
  view: 'address' | 'wallet'
) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType2(tx, addressHash, view)

  return isConfirmedTx(tx) && !tx.scriptExecutionOk
    ? {
        label: t('dApp operation'),
        Icon: Repeat2,
        iconColor: colord(theme.global.complementary).alpha(0.5).toRgbString(),
        iconBgColor: colord(theme.global.complementary).alpha(0.05).toRgbString()
      }
    : {
        label: {
          'address-self-transfer': t('Self transfer'),
          'address-group-transfer': t('Group transfer'),
          'wallet-self-transfer': t('Moved'),
          dApp: t('dApp call'),
          outgoing: t('Sent'),
          incoming: t('Received'),
          pending: t('Pending')
        }[infoType],
        Icon: {
          incoming: ArrowDown,
          outgoing: ArrowUp,
          move: ArrowLeftRight,
          moveGroup: RefreshCcw,
          pending: CircleEllipsis,
          dApp: Repeat
        }[infoType],
        iconColor: {
          in: theme.global.valid,
          out: theme.font.highlight,
          move: theme.font.secondary,
          moveGroup: theme.font.secondary,
          pending: theme.font.secondary,
          swap: theme.global.complementary
        }[infoType],
        iconBgColor: {
          in: colord(theme.global.valid).alpha(0.08).toRgbString(),
          out: colord(theme.font.highlight).alpha(0.08).toRgbString(),
          move: colord(theme.font.secondary).alpha(0.08).toRgbString(),
          moveGroup: colord(theme.font.secondary).alpha(0.08).toRgbString(),
          pending: colord(theme.font.secondary).alpha(0.08).toRgbString(),
          swap: colord(theme.global.complementary).alpha(0.08).toRgbString()
        }[infoType]
      }
}

export default useTransactionIconLabel
