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

import Badge from '@/components/Badge'
import { TransactionDetailsModalSectionProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const TransactionType = ({ tx, addressHash }: TransactionDetailsModalSectionProps) => {
  const { label, Icon, iconColor } = useTransactionIconLabel(tx, addressHash)

  return (
    <TransactionTypeStyled short color={iconColor}>
      <Icon size={14} color={iconColor} />
      {label}
    </TransactionTypeStyled>
  )
}

export default TransactionType

const TransactionTypeStyled = styled(Badge)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
`