import { AddressHash } from '@alephium/shared'
import { ReactNode } from 'react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import { TableCell, TableRow } from '@/components/Table'

interface AddressRowProps {
  addressHash: AddressHash
  onClick?: (addressHash: AddressHash) => void
  className?: string
  subtitle?: string
  children?: ReactNode
}

const AddressRow = ({ addressHash, onClick, children, className, subtitle }: AddressRowProps) => (
  <TableRow
    key={addressHash}
    role="row"
    tabIndex={0}
    onClick={() => onClick && onClick(addressHash)}
    onKeyDown={() => onClick && onClick(addressHash)}
    className={className}
  >
    <TableCell>
      <AddressColorIndicatorStyled addressHash={addressHash} />
      <Label>
        <AddressBadge addressHash={addressHash} hideColorIndication truncate appendHash displayHashUnder />
        <AddressSubtitle>{subtitle}</AddressSubtitle>
      </Label>
    </TableCell>
    {children && <TableCell>{children}</TableCell>}
  </TableRow>
)

export default AddressRow

const AddressColorIndicatorStyled = styled(AddressColorIndicator)`
  margin-right: 15px;
`

const Label = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
  max-width: 160px;
`

const AddressSubtitle = styled.span`
  font-family: 'Roboto Mono';
  font-size: 12px;
  color: ${({ theme }) => theme.font.tertiary};
`
