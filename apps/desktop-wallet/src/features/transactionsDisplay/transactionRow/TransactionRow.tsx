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

import { TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import DirectionCell from '@/features/transactionsDisplay/transactionRow/DirectionCell'
import FirstAddressColumnCell from '@/features/transactionsDisplay/transactionRow/FirstAddressColumnCell'
import FTAmounts from '@/features/transactionsDisplay/transactionRow/FTAmounts'
import IconLabelTimeCell from '@/features/transactionsDisplay/transactionRow/IconLabelTimeCell'
import OtherAmounts from '@/features/transactionsDisplay/transactionRow/OtherAmounts'
import SecondAddressColumnCell from '@/features/transactionsDisplay/transactionRow/SecondAddressColumnCell'
import TokenBadgesListCell from '@/features/transactionsDisplay/transactionRow/TokenBadgesListCell'
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
        <IconLabelTimeCell {...commonProps} />

        <TokenBadgesListCell tx={tx} refAddressHash={referenceAddress} compact={compact} />

        <DirectionalAddresses stackVertically={isInAddressDetailsModal}>
          {!isInAddressDetailsModal && <FirstAddressColumnCell tx={tx} refAddressHash={referenceAddress} />}
          <DirectionCell {...commonProps} />
          <SecondAddressColumnCell {...commonProps} />
        </DirectionalAddresses>

        <TableCellAmount aria-hidden="true">
          <AmountsList>
            <FTAmounts {...commonProps} />
            <OtherAmounts type="nfts" {...commonProps} />
            <OtherAmounts type="nsts" {...commonProps} />
          </AmountsList>
        </TableCellAmount>
      </TableRowStyled>
    )
  }
)

export default TransactionRow

const TableRowStyled = styled(TableRow)`
  display: flex;
  text-align: center;
  border-radius: 3px;
  white-space: nowrap;
  flex-grow: 1;
`

const DirectionalAddresses = styled.div<{ stackVertically?: boolean }>`
  display: flex;
  align-items: center;
  min-width: 35%;
  flex: 1;
  justify-content: flex-end;

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
