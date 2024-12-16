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
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  max-width: 160px;
`

const AddressSubtitle = styled.span`
  font-family: 'Roboto Mono';
  font-size: 12px;
  color: ${({ theme }) => theme.font.tertiary};
`
