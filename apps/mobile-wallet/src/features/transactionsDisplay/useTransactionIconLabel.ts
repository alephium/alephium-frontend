import { AddressHash, isConfirmedTx, SentTransaction } from '@alephium/shared'
import { useTransactionInfoType } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { colord } from 'colord'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis, Repeat, Repeat2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

const useTransactionIconLabel = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  addressHash: AddressHash
) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const infoType = useTransactionInfoType(tx, addressHash)

  return isConfirmedTx(tx) && !tx.scriptExecutionOk
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

export default useTransactionIconLabel
