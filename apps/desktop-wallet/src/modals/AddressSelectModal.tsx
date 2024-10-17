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

import { AddressHash } from '@alephium/shared'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import { useFilterAddressesByText } from '@/features/addressFiltering/addressFilteringHooks'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'

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
  const addresses = useAppSelector(selectAllAddresses)

  const [searchInput, setSearchInput] = useState('')
  const filteredAddresses = useFilterAddressesByText(searchInput.toLowerCase())

  const addressSelectOptions: SelectOption<AddressHash>[] = addressOptions.map((addressHash) => ({
    value: addressHash,
    label: addresses.find((address) => address.hash === addressHash)?.label ?? addressHash
  }))

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
      showOnly={filteredAddresses}
      setValue={handleAddressSelect}
      onClose={onClose}
      onSearchInput={setSearchInput}
      searchPlaceholder={t('Search for name or a hash...')}
      minWidth={620}
      optionRender={(option, isSelected) => <SelectOptionAddress addressHash={option.value} isSelected={isSelected} />}
      emptyListPlaceholder={emptyListPlaceholder || t('There are no available addresses.')}
      floatingOptions
    />
  )
}

export default AddressSelectModal
