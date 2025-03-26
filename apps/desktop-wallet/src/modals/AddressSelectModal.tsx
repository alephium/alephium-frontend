import { AddressHash } from '@alephium/shared'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import useAddressesSearchStrings from '@/features/addressFiltering/useFetchAddressesSearchStrings'
import { useFetchAddressesHashesSortedByLastUse } from '@/hooks/useAddresses'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'

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

    if (selectedOptionIsNotPartOfOptions) {
      const firstOption = addressSelectOptions.at(0)

      if (firstOption) {
        handleAddressSelect(firstOption)
      }
    }
  }, [addressSelectOptions, handleAddressSelect, addressOptions, selectedOption?.value])

  return (
    <SelectOptionsModal
      title={title}
      options={addressSelectOptions}
      selectedOption={selectedOption}
      setValue={handleAddressSelect}
      onClose={onClose}
      isSearchable={addressSelectOptions.length > 1}
      optionRender={(option) => <SelectOptionAddress addressHash={option.value} />}
      emptyListPlaceholder={emptyListPlaceholder || t('There are no available addresses.')}
    />
  )
}

export default AddressSelectModal

const useAddressSelectOptions = (addressOptions: AddressHash[]) => {
  const addresses = useUnsortedAddresses()
  const { data: sortedAddressHashes } = useFetchAddressesHashesSortedByLastUse()
  const { data: addressesSearchStrings } = useAddressesSearchStrings(addressOptions)

  return useMemo(
    () =>
      sortedAddressHashes
        .filter((hash) => addressOptions.includes(hash))
        .map((hash) => {
          const label = addresses.find((address) => address.hash === hash)?.label || hash

          return {
            value: hash,
            label,
            searchString: addressesSearchStrings[hash]
          }
        }),
    [sortedAddressHashes, addressOptions, addresses, addressesSearchStrings]
  )
}
