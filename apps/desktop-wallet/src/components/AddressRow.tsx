import { AddressHash } from '@alephium/shared'
import { ReactNode } from 'react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import { TableRow } from '@/components/Table'

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
    <Row>
      <AddressColorIndicatorStyled addressHash={addressHash} />
      <Label>
        <AddressBadge addressHash={addressHash} hideColorIndication truncate appendHash displayHashUnder />
        <AddressSubtitle>{subtitle}</AddressSubtitle>
      </Label>
      {children}
    </Row>
  </TableRow>
)

export default AddressRow

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const AddressColorIndicatorStyled = styled(AddressColorIndicator)`
  margin-right: 15px;
`

const Label = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  max-width: 120px;
`

const AddressSubtitle = styled.span`
  font-family: 'Roboto Mono';
  font-size: 12px;
  color: ${({ theme }) => theme.font.tertiary};
`
