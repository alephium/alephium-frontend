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
import { memo } from 'react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import AddressTokensBadgesList from '@/features/assetsLists/AddressTokensBadgesList'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import AddressGroup from '@/pages/UnlockedWallet/AddressesPage/addressListRow/AddressGroup'
import AddressLastActivity from '@/pages/UnlockedWallet/AddressesPage/addressListRow/AddressLastActivity'
import AddressWorth from '@/pages/UnlockedWallet/AddressesPage/addressListRow/AddressWorth'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressListRowProps {
  addressHash: AddressHash
  className?: string
}

const AddressListRow = memo(({ addressHash, className }: AddressListRowProps) => {
  const dispatch = useAppDispatch()

  const openAddressDetailsModal = () => dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))

  return (
    <GridRow
      key={addressHash}
      onClick={openAddressDetailsModal}
      onKeyDown={(e) => onEnterOrSpace(e, openAddressDetailsModal)}
      className={className}
      role="row"
      tabIndex={0}
    >
      <AddressNameCell>
        <AddressColorIndicator addressHash={addressHash} size={16} />
        <Column>
          <Label>
            <AddressBadge addressHash={addressHash} hideColorIndication truncate disableA11y />
          </Label>
          <AddressLastActivity addressHash={addressHash} />
        </Column>
      </AddressNameCell>
      <Cell>
        <AddressGroup addressHash={addressHash} />
      </Cell>
      <Cell>
        <AddressTokensBadgesListStyled addressHash={addressHash} />
      </Cell>
      <FiatAmountCell>
        <AddressWorth addressHash={addressHash} />
      </FiatAmountCell>
    </GridRow>
  )
})

export default AddressListRow

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`

const Label = styled.div`
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  display: flex;
  max-width: 150px;
`

const Cell = styled.div`
  padding: 20px 20px;
  align-items: center;
  display: flex;
  background-color: ${({ theme }) => theme.bg.primary};
`

const GridRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }

  &:hover ${Cell} {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const AmountCell = styled(Cell)`
  text-align: right;
  font-size: 15px;
  color: ${({ theme }) => theme.font.secondary};
  justify-content: flex-end;
`

const FiatAmountCell = styled(AmountCell)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 15px;
`

const AddressNameCell = styled(Cell)`
  gap: 20px;
  cursor: pointer;
`

const AddressTokensBadgesListStyled = styled(AddressTokensBadgesList)`
  padding: 0px 16px;
  gap: var(--spacing-3);
`
