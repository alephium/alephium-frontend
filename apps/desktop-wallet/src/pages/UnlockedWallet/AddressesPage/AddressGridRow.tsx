/*
Copyright 2018 - 2023 The Alephium Authors
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

import { AddressHash, calculateAmountWorth } from '@alephium/shared'
import dayjs from 'dayjs'
import { chunk } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Amount from '@/components/Amount'
import AssetBadge from '@/components/AssetBadge'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import {
  makeSelectAddressesTokens,
  selectAddressByHash,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { selectIsTokensMetadataUninitialized } from '@/storage/assets/assetsSelectors'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { currencies } from '@/utils/currencies'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressGridRowProps {
  addressHash: AddressHash
  className?: string
}

const maxDisplayedAssets = 7 // Allow 2 rows by default

const AddressGridRow = ({ addressHash, className }: AddressGridRowProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectAddressesTokens = useMemo(makeSelectAddressesTokens, [])
  const assets = useAppSelector((s) => selectAddressesTokens(s, addressHash))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const isTokensMetadataUninitialized = useAppSelector(selectIsTokensMetadataUninitialized)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies[fiatCurrency].ticker)

  const [isAddressDetailsModalOpen, setIsAddressDetailsModalOpen] = useState(false)

  const assetsWithBalance = assets.filter((asset) => asset.balance > 0)
  const [displayedAssets, ...hiddenAssetsChunks] = chunk(assetsWithBalance, maxDisplayedAssets)
  const hiddenAssets = hiddenAssetsChunks.flat()

  if (!address) return null

  const fiatBalance = calculateAmountWorth(BigInt(address.balance), price ?? 0)

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
              <AddressBadge addressHash={address.hash} hideColorIndication truncate showFull disableA11y />
            </Label>
            {stateUninitialized ? (
              <SkeletonLoader height="15.5px" />
            ) : (
              <LastActivity>
                {address.lastUsed ? `${t('Last activity')} ${dayjs(address.lastUsed).fromNow()}` : t('Never used')}
              </LastActivity>
            )}
          </Column>
        </AddressNameCell>
        <Cell>
          {isTokensMetadataUninitialized || stateUninitialized ? (
            <SkeletonLoader height="33.5px" />
          ) : (
            <AssetLogos>
              {displayedAssets && displayedAssets.map(({ id }) => <AssetBadge key={id} assetId={id} simple />)}
              {hiddenAssets && hiddenAssets.length > 0 && (
                <span
                  data-tooltip-id="default"
                  data-tooltip-content={hiddenAssets.map(({ symbol }) => symbol || t('Unknown token')).join(', ')}
                >
                  +{hiddenAssets.length}
                </span>
              )}
            </AssetLogos>
          )}
        </Cell>
        <AmountCell>
          {stateUninitialized ? <SkeletonLoader height="18.5px" /> : <Amount value={BigInt(address.balance)} />}
        </AmountCell>
        <FiatAmountCell>
          {stateUninitialized || isPriceLoading ? (
            <SkeletonLoader height="18.5px" />
          ) : (
            <Amount value={fiatBalance} isFiat suffix={currencies[fiatCurrency].symbol} />
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
