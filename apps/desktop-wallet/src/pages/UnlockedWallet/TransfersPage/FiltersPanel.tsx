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

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useSortedTokenIds from '@/api/apiDataHooks/utils/useSortedTokenIds'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import Button from '@/components/Button'
import MultiSelect from '@/components/Inputs/MultiSelect'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import SelectOptionWalletToken from '@/components/Inputs/SelectOptionWalletToken'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { Address } from '@/types/addresses'
import { TokenId } from '@/types/tokens'
import { directionOptions } from '@/utils/transactions'

interface FiltersPanelProps {
  selectedAddresses: Address[]
  setSelectedAddresses: (addresses: Address[]) => void
  selectedDirections: typeof directionOptions
  setSelectedDirections: (directions: typeof directionOptions) => void
  selectedTokensIds?: TokenId[]
  setSelectedTokensIds: (ids: TokenId[]) => void
  className?: string
}

const FiltersPanel = ({
  selectedAddresses,
  setSelectedAddresses,
  selectedDirections,
  setSelectedDirections,
  selectedTokensIds,
  setSelectedTokensIds,
  className
}: FiltersPanelProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)

  const { listedFts, unlistedFts, isLoading: isLoadingFts } = useFetchWalletFts()
  const {
    data: { nftIds, nstIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeAlph: true })
  const sortedTokenIds = useSortedTokenIds({ listedFts, unlistedFts, nftIds, nstIds })

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

  const getTokenName = (tokenId: TokenId) =>
    (listedFts.find(({ id }) => id === tokenId) ?? unlistedFts.find(({ id }) => id === tokenId))?.symbol ?? tokenId

  const renderAssetsSelectedValue = () => {
    if (!selectedTokensIds) return null

    if (selectedTokensIds.length === 0) return ''

    if (selectedTokensIds.length === sortedTokenIds.length) return t('All selected')

    return selectedTokensIds.map(getTokenName).join(', ')
  }
  const resetFilters = () => {
    setSelectedAddresses(addresses)
    setSelectedDirections(directionOptions)
    setSelectedTokensIds(sortedTokenIds)
  }

  useEffect(() => {
    if (!isLoadingTokensByType && !isLoadingFts && !selectedTokensIds) {
      setSelectedTokensIds(sortedTokenIds)
    }
  }, [isLoadingFts, isLoadingTokensByType, selectedTokensIds, setSelectedTokensIds, sortedTokenIds])

  return (
    <div className={className}>
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
            renderOption={(address, isSelected) => (
              <SelectOptionAddress addressHash={address.hash} isSelected={isSelected} />
            )}
            floatingOptions
          />
        </Tile>
        <Tile>
          <MultiSelect
            label={t('Assets')}
            modalTitle={t('Select assets')}
            options={sortedTokenIds}
            selectedOptions={selectedTokensIds ?? []}
            selectedOptionsSetter={setSelectedTokensIds}
            renderSelectedValue={renderAssetsSelectedValue}
            getOptionId={(tokenId) => tokenId}
            getOptionText={getTokenName}
            renderOption={(tokenId, isSelected) => (
              <SelectOptionWalletToken tokenId={tokenId} isSelected={isSelected} />
            )}
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
    </div>
  )
}

export default styled(FiltersPanel)`
  display: flex;
  flex: 1;
  border-color: ${({ theme }) => theme.border.primary};
  justify-content: space-between;
  z-index: 1;
`

const FilterTiles = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
`

const FilterTile = styled.div`
  padding: 5px 10px;
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
