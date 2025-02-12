import { useTranslation } from 'react-i18next'

import AddressBadge from '@/components/AddressBadge'
import HiddenLabel from '@/components/HiddenLabel'
import IOList from '@/components/IOList'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'

const FirstAddressColumnCell = ({ tx, refAddressHash }: TransactionRowSectionProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, refAddressHash)

  return (
    <AddressCell alignRight>
      <HiddenLabel text={direction === 'swap' ? t('between') : t('from')} />

      {direction === 'in' ? (
        <IOList
          currentAddress={refAddressHash}
          isOut={false}
          outputs={tx.outputs}
          inputs={tx.inputs}
          timestamp={tx.timestamp}
          truncate
          disableA11y
        />
      ) : (
        <AddressBadge addressHash={refAddressHash} truncate disableA11y withBorders />
      )}
    </AddressCell>
  )
}

export default FirstAddressColumnCell
