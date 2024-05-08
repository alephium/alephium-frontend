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

import { addressesQueries, AddressHash, CURRENCIES } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { chunk } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesGroupedAssets, useAddressesWorth } from '@/api/apiHooks'
import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Amount from '@/components/Amount'
import AssetBadge from '@/components/AssetBadge'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressGridRowProps {
  addressHash: AddressHash
  className?: string
}

const maxDisplayedAssets = 7 // Allow 2 rows by default

const AddressGridRow = ({ addressHash, className }: AddressGridRowProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  const { data: addressAlphBalance, isPending: isAddressAlphBalancePending } = useQuery(
    addressesQueries.balances.getAddressAlphBalances(addressHash)
  )

  const { data: addressesGroupedAssetsData, isPending: addressAssetsPending } = useAddressesGroupedAssets([addressHash])
  const addressGroupedAssets = addressesGroupedAssetsData?.[0].assets

  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const { data: balanceInFiat, isPending: addressWorthPending } = useAddressesWorth([addressHash])
  const addressBalanceInFiat = balanceInFiat?.[0].worth

  const [isAddressDetailsModalOpen, setIsAddressDetailsModalOpen] = useState(false)

  const assetsWithBalance = addressGroupedAssets?.fungible.filter((asset) => asset.balance > 0)
  const [displayedAssets, ...hiddenAssetsChunks] = chunk(assetsWithBalance, maxDisplayedAssets)
  const hiddenAssets = hiddenAssetsChunks.flat()

  const isPending = addressAssetsPending || addressWorthPending

  if (!address) return null

  const hiddenAssetsSymbols = hiddenAssets.filter(({ symbol }) => !!symbol).map(({ symbol }) => symbol)
  const nbOfUnknownHiddenAssets = hiddenAssets.filter(({ symbol }) => !symbol).length
  const hiddenAssetsTooltipText = [
    ...hiddenAssetsSymbols,
    nbOfUnknownHiddenAssets > 0
      ? nbOfUnknownHiddenAssets === 1
        ? `1 ${t('Unknown token')} `
        : `${nbOfUnknownHiddenAssets} ${t('Unknown tokens')}`
      : []
  ].join(', ')

  const openAddressDetailsModal = () => setIsAddressDetailsModalOpen(true)

  return (
    <>
      <GridRow
        key={address.hash}
        onClick={openAddressDetailsModal}
        onKeyDown={(e) => onEnterOrSpace(e, openAddressDetailsModal)}
        className={className}
        role="row"
        tabIndex={0}
      >
        <AddressNameCell>
          <AddressColorIndicator addressHash={address.hash} size={16} />
          <Column>
            <Label>
              <AddressBadge addressHash={address.hash} hideColorIndication truncate disableA11y />
            </Label>
            <LastActivity>
              {address.lastUsed ? `${t('Last activity')} ${dayjs(address.lastUsed).fromNow()}` : t('Never used')}
            </LastActivity>
          </Column>
        </AddressNameCell>
        <Cell>
          {isPending ? (
            <SkeletonLoader height="33.5px" />
          ) : (
            <AssetLogos>
              {displayedAssets && displayedAssets.map(({ id }) => <AssetBadge key={id} assetId={id} simple />)}
              {hiddenAssets && hiddenAssets.length > 0 && (
                <span data-tooltip-id="default" data-tooltip-content={hiddenAssetsTooltipText}>
                  +{hiddenAssets.length}
                </span>
              )}
            </AssetLogos>
          )}
        </Cell>
        <AmountCell>
          {isAddressAlphBalancePending ? (
            <SkeletonLoader height="18.5px" />
          ) : (
            addressAlphBalance && <Amount value={BigInt(addressAlphBalance.balance)} />
          )}
        </AmountCell>
        <FiatAmountCell>
          {isPending ? (
            <SkeletonLoader height="18.5px" />
          ) : (
            <Amount value={addressBalanceInFiat} isFiat suffix={CURRENCIES[fiatCurrency].symbol} />
          )}
        </FiatAmountCell>
      </GridRow>
      <ModalPortal>
        {isAddressDetailsModalOpen && (
          <AddressDetailsModal addressHash={address.hash} onClose={() => setIsAddressDetailsModalOpen(false)} />
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

const LastActivity = styled.div`
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

const AssetLogos = styled.div`
  padding: 0px 16px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
`
