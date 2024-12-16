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

import { findTransactionReferenceAddress } from '@alephium/shared'
import { memo } from 'react'
import styled, { css } from 'styled-components'

import { TableCell, TableRow } from '@/components/Table'
import DirectionCell from '@/features/transactionsDisplay/transactionRow/DirectionCell'
import DirectionIconCell from '@/features/transactionsDisplay/transactionRow/DirectionIconCell'
import FirstAddressColumnCell from '@/features/transactionsDisplay/transactionRow/FirstAddressColumnCell'
import FTAmounts from '@/features/transactionsDisplay/transactionRow/FTAmounts'
import OtherAmounts from '@/features/transactionsDisplay/transactionRow/OtherAmounts'
import SecondAddressColumnCell from '@/features/transactionsDisplay/transactionRow/SecondAddressColumnCell'
import TimestampCell from '@/features/transactionsDisplay/transactionRow/TimestampCell'
import { TransactionRowProps } from '@/features/transactionsDisplay/transactionRow/types'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

const TransactionRow = memo(
  ({ tx, refAddressHash, isInAddressDetailsModal, compact, ...props }: TransactionRowProps) => {
    const allAddressHashes = useUnsortedAddressesHashes()
    const referenceAddress = refAddressHash ?? findTransactionReferenceAddress(allAddressHashes, tx)

    if (!referenceAddress) return null

    const commonProps = { tx, refAddressHash: referenceAddress, isInAddressDetailsModal }

    return (
      <TableRowStyled role="row" tabIndex={0} {...props}>
        <DirectionIconCell {...commonProps} />

        <TimestampCell {...commonProps} />

        <DirectionalAddresses stackVertically={isInAddressDetailsModal}>
          {!isInAddressDetailsModal && <FirstAddressColumnCell tx={tx} refAddressHash={referenceAddress} />}
          <DirectionCell {...commonProps} />
          <SecondAddressColumnCell {...commonProps} />
        </DirectionalAddresses>

        <TableCell aria-hidden="true" align="right">
          <AmountsList>
            <FTAmounts {...commonProps} />
            <OtherAmounts type="nfts" {...commonProps} />
            <OtherAmounts type="nsts" {...commonProps} />
          </AmountsList>
        </TableCell>
      </TableRowStyled>
    )
  }
)

export default TransactionRow

const TableRowStyled = styled(TableRow)`
  display: flex;
  text-align: center;
  white-space: nowrap;
  flex-grow: 1;
  align-items: stretch;
`

const DirectionalAddresses = styled(TableCell)<{ stackVertically?: boolean }>`
  display: flex;

  ${({ stackVertically }) =>
    stackVertically &&
    css`
      flex-direction: column;
      align-items: flex-start;
      width: 20%;
      gap: 5px;
    `}
`

const AmountsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
`
