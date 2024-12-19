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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
        <AddressBadgeStyled addressHash={refAddressHash} truncate disableA11y withBorders />
      )}
    </AddressCell>
  )
}

export default FirstAddressColumnCell

const AddressBadgeStyled = styled(AddressBadge)``
