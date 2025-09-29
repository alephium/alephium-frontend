import { findTransactionReferenceAddress } from '@alephium/shared'
import { useUnsortedAddressesHashes } from '@alephium/shared-react'
import { memo } from 'react'
import styled, { css } from 'styled-components'

import GridRow from '@/components/GridRow'
import { TableCell } from '@/components/Table'
import DirectionCell from '@/features/transactionsDisplay/transactionRow/DirectionCell'
import DirectionIconCell from '@/features/transactionsDisplay/transactionRow/DirectionIconCell'
import FirstAddressColumnCell from '@/features/transactionsDisplay/transactionRow/FirstAddressColumnCell'
import FTAmounts from '@/features/transactionsDisplay/transactionRow/FTAmounts'
import OtherAmounts from '@/features/transactionsDisplay/transactionRow/OtherAmounts'
import SecondAddressColumnCell from '@/features/transactionsDisplay/transactionRow/SecondAddressColumnCell'
import TimestampCell from '@/features/transactionsDisplay/transactionRow/TimestampCell'
import { TransactionRowProps } from '@/features/transactionsDisplay/transactionRow/types'

const TransactionRow = memo(({ tx, referenceAddress: refAddress, view, compact, ...props }: TransactionRowProps) => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const referenceAddress = refAddress ?? findTransactionReferenceAddress(allAddressHashes, tx)

  if (!referenceAddress) return null

  const commonProps = { tx, referenceAddress: referenceAddress, view }

  return (
    <GridRowStyled {...props}>
      <DirectionIconCell {...commonProps} />

      <TimestampCell {...commonProps} />

      <DirectionalAddresses stackVertically={view === 'address'} fixedWidth="30%">
        {view === 'wallet' && <FirstAddressColumnCell {...commonProps} />}
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
    </GridRowStyled>
  )
})

export default TransactionRow

const DirectionalAddresses = styled(TableCell)<{ stackVertically?: boolean }>`
  gap: 10px;

  ${({ stackVertically }) =>
    stackVertically &&
    css`
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 5px;
    `}
`

const AmountsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`

const GridRowStyled = styled(GridRow)`
  grid-template-columns: 50px 1fr 1fr 1fr;
`
