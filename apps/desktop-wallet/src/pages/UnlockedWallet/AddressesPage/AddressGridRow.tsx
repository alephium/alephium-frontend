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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesTokensPrices, useAddressesTokensTotalWorth } from '@/api/addressesTokensPricesDataHooks'
import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import AssetsBadgesList from '@/features/assetsLists/AssetsBadgesList'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAddressByHash, selectIsStateUninitialized } from '@/storage/addresses/addressesSelectors'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressGridRowProps {
  addressHash: AddressHash
  className?: string
}

const AddressGridRow = ({ addressHash, className }: AddressGridRowProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const { isLoading: isLoadingTokenPrices } = useAddressesTokensPrices()
  const { data: balanceInFiat } = useAddressesTokensTotalWorth(addressHash)

  const [isAddressDetailsModalOpen, setIsAddressDetailsModalOpen] = useState(false)

  if (!address) return null

  const openAddressDetailsModal = () => setIsAddressDetailsModalOpen(true)

  return (
    <>
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
            {stateUninitialized ? (
              <SkeletonLoader height="15.5px" />
            ) : (
              <SecondaryText>
                {address.lastUsed ? `${t('Last activity')} ${dayjs(address.lastUsed).fromNow()}` : t('Never used')}
              </SecondaryText>
            )}
          </Column>
        </AddressNameCell>
        <Cell>
          <SecondaryText>
            {t('Group')} {address.group}
          </SecondaryText>
        </Cell>
        <Cell>
          <AssetsBadgesListStyled addressHash={addressHash} simple />
        </Cell>
        <FiatAmountCell>
          {stateUninitialized || isLoadingTokenPrices ? (
            <SkeletonLoader height="18.5px" />
          ) : (
            <Amount value={balanceInFiat} isFiat suffix={CURRENCIES[fiatCurrency].symbol} />
          )}
        </FiatAmountCell>
      </GridRow>
      <ModalPortal>
        {isAddressDetailsModalOpen && (
          <AddressDetailsModal addressHash={addressHash} onClose={() => setIsAddressDetailsModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressGridRow

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

const SecondaryText = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
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

const AssetsBadgesListStyled = styled(AssetsBadgesList)`
  padding: 0px 16px;
  gap: var(--spacing-3);
`
