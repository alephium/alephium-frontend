import { colord } from 'colord'
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
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { appHeaderHeightPx } from '@/style/globalStyles'
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
  const addresses = useUnsortedAddresses()

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
