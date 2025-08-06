import { useTransactionDirection, useTransactionInfoType2 } from '@alephium/shared-react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import IOList from '@/components/IOList'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const SecondAddressColumnCell = ({ tx, referenceAddress, view }: TransactionRowSectionProps) => {
  const direction = useTransactionDirection(tx, referenceAddress)
  const infoType = useTransactionInfoType2({ tx, referenceAddress: referenceAddress, view })

  if ((infoType === 'address-group-transfer' || infoType === 'address-self-transfer') && view === 'address') return null

  return (
    <AddressCell>
      <DirectionalAddress>
        {direction !== 'in' || (direction === 'in' && view === 'address') ? (
          <IOList
            currentAddress={referenceAddress}
            isOut={direction === 'out'}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={tx.timestamp}
            truncate
            disableA11y
          />
        ) : (
          <AddressBadge addressHash={referenceAddress} truncate disableA11y withBorders />
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
