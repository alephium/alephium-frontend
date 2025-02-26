import { AddressHash } from '@alephium/shared'
import { memo } from 'react'
import styled, { css } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import GridRow from '@/components/GridRow'
import AddressTokensBadgesList from '@/features/assetsLists/AddressTokensBadgesList'
import { FTAddressAmountCell } from '@/features/assetsLists/tokenBalanceRow/FTAmountCells'
import { FTAddressWorthCell } from '@/features/assetsLists/tokenBalanceRow/FTWorthCell'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import AddressGroup from '@/pages/unlockedWallet/addressesPage/addressListRow/AddressGroup'
import AddressLastActivity from '@/pages/unlockedWallet/addressesPage/addressListRow/AddressLastActivity'
import AddressWorth from '@/pages/unlockedWallet/addressesPage/addressListRow/AddressWorth'
import { TokenId } from '@/types/tokens'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressListRowProps {
  addressHash: AddressHash
  className?: string
  tokenId?: TokenId
  isLast?: boolean
}

const AddressListRow = memo(({ addressHash, tokenId, className, isLast }: AddressListRowProps) => {
  const dispatch = useAppDispatch()

  const openAddressDetailsModal = () => dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))

  return (
    <GridRowStyled
      key={addressHash}
      onClick={openAddressDetailsModal}
      onKeyDown={(e) => onEnterOrSpace(e, openAddressDetailsModal)}
      className={className}
      role="row"
      tabIndex={0}
    >
      <Cell noBorder={isLast}>
        <AddressColorIndicator addressHash={addressHash} size={10} />
      </Cell>
      <Cell noBorder={isLast}>
        <Column>
          <Label>
            <AddressBadge addressHash={addressHash} hideColorIndication truncate disableA11y />
          </Label>
          <AddressLastActivity addressHash={addressHash} />
        </Column>
      </Cell>
      <Cell noBorder={isLast}>
        <AddressGroup addressHash={addressHash} />
      </Cell>

      {tokenId ? (
        <FTAddressAmountCell tokenId={tokenId} addressHash={addressHash} />
      ) : (
        <Cell noBorder={isLast}>
          <AddressTokensBadgesListStyled addressHash={addressHash} />
        </Cell>
      )}

      {tokenId ? (
        <FTAddressWorthCell tokenId={tokenId} addressHash={addressHash} noBorder={isLast} />
      ) : (
        <FiatAmountCell noBorder={isLast}>
          <AddressWorth addressHash={addressHash} />
        </FiatAmountCell>
      )}
    </GridRowStyled>
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
  min-width: 0;
  padding-right: var(--spacing-4);
`

const Cell = styled.div<{ noBorder?: boolean }>`
  padding: 14px 0;
  display: flex;
  align-items: center;

  &:not(:first-child) {
    ${({ noBorder }) =>
      !noBorder &&
      css`
        border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
      `}
  }
`

const GridRowStyled = styled(GridRow)`
  grid-template-columns: 40px minmax(0, 1fr) 1fr 1fr 1fr;
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
