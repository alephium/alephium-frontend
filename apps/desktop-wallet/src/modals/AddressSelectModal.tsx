import { AddressHash } from '@alephium/shared'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addressTokensSearchStringQuery, AddressTokensSearchStringQueryFnData } from '@/api/queries/addressQueries'
import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import { useAppSelector } from '@/hooks/redux'
import { useFetchSortedAddressesHashes } from '@/hooks/useAddresses'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

interface AddressSelectModalProps {
  title: string
  addressOptions: AddressHash[]
  onAddressSelect: (address: AddressHash) => void
  onClose: () => void
  defaultSelectedAddress?: AddressHash
  emptyListPlaceholder?: string
}

const AddressSelectModal = ({
  title,
  addressOptions,
  onAddressSelect,
  onClose,
  defaultSelectedAddress,
  emptyListPlaceholder
}: AddressSelectModalProps) => {
  const { t } = useTranslation()

  const addressSelectOptions: SelectOption<AddressHash>[] = useAddressSelectOptions(addressOptions)

  const defaultSelectedOption = addressSelectOptions.find((a) => a.value === defaultSelectedAddress)
  const [selectedOption, setSelectedOption] = useState(defaultSelectedOption)

  const handleAddressSelect = useCallback(
    (option: SelectOption<AddressHash>) => {
      setSelectedOption(option)
      onAddressSelect(option.value)
    },
    [onAddressSelect]
  )

  useEffect(() => {
    const selectedOptionIsNotPartOfOptions = !addressOptions.some((option) => option === selectedOption?.value)

    if (selectedOptionIsNotPartOfOptions) handleAddressSelect(addressSelectOptions[0])
  }, [addressSelectOptions, handleAddressSelect, addressOptions, selectedOption?.value])

  return (
    <SelectOptionsModal
      title={title}
      options={addressSelectOptions}
      selectedOption={selectedOption}
      setValue={handleAddressSelect}
      onClose={onClose}
      isSearchable
      optionRender={(option, isSelected) => <SelectOptionAddress addressHash={option.value} isSelected={isSelected} />}
      emptyListPlaceholder={emptyListPlaceholder || t('There are no available addresses.')}
      floatingOptions
    />
  )
}

export default AddressSelectModal

const useAddressSelectOptions = (addressOptions: AddressHash[]) => {
  const addresses = useUnsortedAddresses()
  const { data: sortedAddressHashes } = useFetchSortedAddressesHashes()
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data: addressesSearchStrings } = useQueries({
    queries: addressOptions.map((hash) => addressTokensSearchStringQuery({ addressHash: hash, networkId })),
    combine: combineAddressesSearchStrings
  })

  return useMemo(
    () =>
      sortedAddressHashes
        .filter((hash) => addressOptions.includes(hash))
        .map((hash) => {
          const label = addresses.find((address) => address.hash === hash)?.label || hash
          const searchString = label + (addressesSearchStrings[hash] ?? '')

          return {
            value: hash,
            label,
            searchString
          }
        }),
    [sortedAddressHashes, addressOptions, addresses, addressesSearchStrings]
  )
}

const combineAddressesSearchStrings = (results: UseQueryResult<AddressTokensSearchStringQueryFnData, Error>[]) => ({
  data: results.reduce(
    (acc, { data }) => {
      if (!data) return acc

      acc[data.addressHash] = data.searchString

      return acc
    },
    {} as Record<AddressHash, string>
  )
})
