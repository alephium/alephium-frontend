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

import { Asset, NFT, tokenIsFungible } from '@alephium/shared'
import { colord } from 'colord'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesFlattenAssets, useAddressesWithSomeBalance } from '@/api/apiHooks'
import Button from '@/components/Button'
import MultiSelect from '@/components/Inputs/MultiSelect'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import SelectOptionAsset from '@/components/Inputs/SelectOptionAsset'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { Address } from '@/types/addresses'
import { directionOptions } from '@/utils/transactions'

interface FiltersPanelProps {
  selectedAddresses: Address[]
  setSelectedAddresses: (addresses: Address[]) => void
  selectedDirections: typeof directionOptions
  setSelectedDirections: (directions: typeof directionOptions) => void
  selectedAssets?: (Asset | NFT)[]
  setSelectedAssets: (assets: (Asset | NFT)[]) => void
  className?: string
}

const FiltersPanel = ({
  selectedAddresses,
  setSelectedAddresses,
  selectedDirections,
  setSelectedDirections,
  selectedAssets,
  setSelectedAssets,
  className
}: FiltersPanelProps) => {
  const { t } = useTranslation()
  const { data: addresses } = useAddressesWithSomeBalance()
  const { data: assets, isPending } = useAddressesFlattenAssets(selectedAddresses.map((address) => address.hash))

  const renderAddressesSelectedValue = () =>
    selectedAddresses.length === 0
      ? ''
      : selectedAddresses.length === 1
        ? selectedAddresses[0].label || selectedAddresses[0].hash
        : selectedAddresses.length === addresses.length
          ? t('All selected')
          : t('{{ number }} selected', { number: selectedAddresses.length })

  const renderDirectionsSelectedValue = () =>
    selectedDirections.length === 0
      ? ''
      : selectedDirections.length === directionOptions.length
        ? t('All selected')
        : selectedDirections.map((direction) => t(direction.label)).join(', ')

  const renderAssetsSelectedValue = () =>
    !selectedAssets
      ? null
      : selectedAssets.length === 0
        ? ''
        : selectedAssets.length === assets.length
          ? t('All selected')
          : selectedAssets.map((asset) => (tokenIsFungible(asset) ? asset.symbol : asset.id)).join(', ')

  const resetFilters = () => {
    setSelectedAddresses(addresses)
    setSelectedDirections(directionOptions)
    setSelectedAssets(assets)
  }

  useEffect(() => {
    if (!isPending && !selectedAssets) {
      setSelectedAssets(assets)
    }
  }, [assets, isPending, selectedAssets, setSelectedAssets])

  return (
    <UnlockedWalletPanel className={className}>
      <FilterTiles>
        <Tile>
          <MultiSelect
            label={t('Addresses')}
            modalTitle={t('Select addresses')}
            options={addresses}
            selectedOptions={selectedAddresses}
            selectedOptionsSetter={setSelectedAddresses}
            renderSelectedValue={renderAddressesSelectedValue}
            getOptionId={(address) => address.hash}
            getOptionText={(address) => address.label || address.hash}
            renderOption={(address, isSelected) => <SelectOptionAddress address={address} isSelected={isSelected} />}
            floatingOptions
          />
        </Tile>
        <Tile>
          <MultiSelect
            label={t('Assets')}
            modalTitle={t('Select assets')}
            options={assets}
            selectedOptions={selectedAssets ?? []}
            selectedOptionsSetter={setSelectedAssets}
            renderSelectedValue={renderAssetsSelectedValue}
            getOptionId={(asset) => asset.id}
            getOptionText={(asset) => asset.name ?? (asset as Asset).symbol ?? asset.id}
            renderOption={(asset, isSelected) => <SelectOptionAsset asset={asset} hideAmount isSelected={isSelected} />}
          />
        </Tile>
        <Tile>
          <MultiSelect
            label={t('Directions')}
            modalTitle={t('Select directions')}
            options={directionOptions}
            selectedOptions={selectedDirections}
            selectedOptionsSetter={setSelectedDirections}
            renderSelectedValue={renderDirectionsSelectedValue}
            getOptionId={(direction) => direction.value.toString()}
            getOptionText={(direction) => t(direction.label)}
          />
        </Tile>
      </FilterTiles>
      <Buttons>
        <Button role="secondary" short onClick={resetFilters}>
          {t('Reset filters')}
        </Button>
      </Buttons>
    </UnlockedWalletPanel>
  )
}

export default styled(FiltersPanel)`
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.border.primary};
  display: flex;
  position: sticky;
  justify-content: space-between;
  top: ${appHeaderHeightPx}px;
  background-color: ${({ theme }) => colord(theme.bg.secondary).alpha(0.9).toHex()};
  backdrop-filter: blur(10px);
  z-index: 1;
`

const FilterTiles = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
`

const FilterTile = styled.div`
  padding: 10px;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
`

const Tile = styled(FilterTile)`
  min-width: 200px;
  flex: 1;
`

const Buttons = styled.div`
  display: flex;
  align-items: center;
  padding-left: 48px;
  flex-shrink: 0;
`
