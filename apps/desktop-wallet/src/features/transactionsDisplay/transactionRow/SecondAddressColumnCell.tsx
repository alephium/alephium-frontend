import { useTransactionDirection } from '@alephium/shared-react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import IOList from '@/components/IOList'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const SecondAddressColumnCell = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const direction = useTransactionDirection(tx, refAddressHash)

  return (
    <AddressCell>
      <DirectionalAddress>
        {direction !== 'in' || (direction === 'in' && isInAddressDetailsModal) ? (
          <IOList
            currentAddress={refAddressHash}
            isOut={direction === 'out'}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={tx.timestamp}
            truncate
            disableA11y
          />
        ) : (
          <AddressBadge addressHash={refAddressHash} truncate disableA11y withBorders />
        )}
      </DirectionalAddress>
    </AddressCell>
  )
}

export default SecondAddressColumnCell

const DirectionalAddress = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--spacing-4);
  max-width: 100%;
  min-width: 0;
`
