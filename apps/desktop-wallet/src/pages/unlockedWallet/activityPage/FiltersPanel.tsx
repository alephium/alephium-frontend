import { Address, TokenId } from '@alephium/shared'
import {
  useFetchWalletFtsSorted,
  useFetchWalletTokensByType,
  useSortedTokenIds,
  useUnsortedAddresses
} from '@alephium/shared-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import MultiSelect from '@/components/Inputs/MultiSelect'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import SelectOptionWalletToken from '@/components/Inputs/SelectOptionWalletToken'
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
  const addresses = useUnsortedAddresses()

  const { data: sortedFts, isLoading: isLoadingFts } = useFetchWalletFtsSorted()
  const {
    data: { nftIds, nstIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeHidden: false })
  const sortedTokenIds = useSortedTokenIds({ sortedFts, nftIds, nstIds })

  const renderAddressesSelectedValue = () =>
    selectedAddresses.length === 0
      ? ''
      : selectedAddresses.length === addresses.length
        ? t('All selected')
        : t('{{ number }} selected', { number: selectedAddresses.length })

  const renderDirectionsSelectedValue = () =>
    selectedDirections.length === 0
      ? ''
      : selectedDirections.length === directionOptions.length
        ? t('All selected')
        : selectedDirections.map((direction) => t(direction.label)).join(', ')

  const getTokenName = (tokenId: TokenId) => sortedFts.find(({ id }) => id === tokenId)?.symbol ?? tokenId

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
        {addresses.length > 1 && (
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
              renderOption={(address, isSelected) => <SelectOptionAddress addressHash={address.hash} />}
            />
          </Tile>
        )}
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
        <Button role="secondary" wide onClick={resetFilters} short>
          {t('Reset filters')}
        </Button>
      </Buttons>
    </div>
  )
}

export default styled(FiltersPanel)`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 20px;
`

const FilterTiles = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  flex-wrap: wrap;
`

const FilterTile = styled.div``

const Tile = styled(FilterTile)`
  flex: 1;
`

const Buttons = styled.div`
  display: flex;
  align-items: center;
  padding-left: 48px;
  flex-shrink: 0;
`
