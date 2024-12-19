/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import IOList from '@/components/IOList'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'

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
