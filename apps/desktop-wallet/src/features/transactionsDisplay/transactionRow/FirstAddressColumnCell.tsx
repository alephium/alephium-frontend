import { useTransactionDirection } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import HiddenLabel from '@/components/HiddenLabel'
import { TransactionOriginAddressesList } from '@/features/transactionsDisplay/transactionDetailsModal/InputsOutputsLists'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const FirstAddressColumnCell = ({ tx, referenceAddress }: TransactionRowSectionProps) => (
  <AddressCell alignRight>
    <DirectionHiddenLabel tx={tx} referenceAddress={referenceAddress} />
    <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" hideLink />
  </AddressCell>
)

export default FirstAddressColumnCell

const DirectionHiddenLabel = ({
  tx,
  referenceAddress
}: Pick<TransactionRowSectionProps, 'tx' | 'referenceAddress'>) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, referenceAddress)

  return <HiddenLabel text={direction === 'swap' ? t('between') : t('from')} />
}
