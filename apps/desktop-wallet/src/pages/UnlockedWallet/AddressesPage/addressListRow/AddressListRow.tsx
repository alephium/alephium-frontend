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
      <Cell>
        <AddressColorIndicator addressHash={addressHash} size={14} />
      </Cell>
      <Cell>
        <Column>
          <Label>
            <AddressBadge addressHash={addressHash} hideColorIndication truncate disableA11y />
          </Label>
          <AddressLastActivity addressHash={addressHash} />
        </Column>
      </Cell>
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
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
  display: flex;
  max-width: 150px;
`

const Cell = styled.div`
  padding: 14px 0;
  align-items: center;
  display: flex;
`

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 1fr;
  margin: 5px 0;
  padding: 0 15px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: var(--radius-big);

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

const AmountCell = styled(Cell)`
  text-align: right;
  font-size: 13px;
  color: ${({ theme }) => theme.font.secondary};
  justify-content: flex-end;
`

const FiatAmountCell = styled(AmountCell)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 13px;
`

const AddressTokensBadgesListStyled = styled(AddressTokensBadgesList)`
  padding: 0px 16px;
  gap: var(--spacing-3);
`
