import { useTransactionDirection } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import AddressBadge from '@/components/AddressBadge'
import HiddenLabel from '@/components/HiddenLabel'
import IOList from '@/components/IOList'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const FirstAddressColumnCell = ({ tx, referenceAddress }: TransactionRowSectionProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, referenceAddress)

  return (
    <AddressCell alignRight>
      <HiddenLabel text={direction === 'swap' ? t('between') : t('from')} />

      {direction === 'in' ? (
        <IOList
          currentAddress={referenceAddress}
          isOut={false}
          outputs={tx.outputs}
          inputs={tx.inputs}
          timestamp={tx.timestamp}
          truncate
          disableA11y
        />
      ) : (
        <AddressBadge addressHash={referenceAddress} truncate disableA11y withBorders />
      )}
    </AddressCell>
  )
}

export default FirstAddressColumnCell
