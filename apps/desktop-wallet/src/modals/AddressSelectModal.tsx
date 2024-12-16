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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useFetchWalletBalancesAlphByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import useFetchWalletBalancesTokensByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import useFetchWalletNftsSearchStrings from '@/api/apiDataHooks/wallet/useFetchWalletNftsSearchStrings'
import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionAddress from '@/components/Inputs/SelectOptionAddress'
import { useFetchSortedAddressesHashes } from '@/hooks/useAddresses'
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
      minWidth={620}
      optionRender={(option, isSelected) => <SelectOptionAddress addressHash={option.value} isSelected={isSelected} />}
      emptyListPlaceholder={emptyListPlaceholder || t('There are no available addresses.')}
      floatingOptions
    />
  )
}

export default AddressSelectModal

// TODO: See how it can be DRY'ed with useFilterAddressesByText
const useAddressSelectOptions = (addressOptions: AddressHash[]) => {
  const addresses = useUnsortedAddresses()
  const { data: sortedAddressHashes } = useFetchSortedAddressesHashes()
  const { listedFts, unlistedFts } = useFetchWalletFts({ sort: false })
  const { data: nftsSearchStringsByNftId } = useFetchWalletNftsSearchStrings()
  const { data: addressesAlphBalances } = useFetchWalletBalancesAlphByAddress()
  const { data: addressesTokensBalances } = useFetchWalletBalancesTokensByAddress()

  return useMemo(
    () =>
      sortedAddressHashes
        .filter((hash) => addressOptions.includes(hash))
        .map((hash) => {
          const address = addresses.find((address) => address.hash === hash)
          const addressAlphBalances = addressesAlphBalances[hash]
          const addressHasAlphBalances = addressAlphBalances?.totalBalance !== '0'
          const addressTokensBalances = addressesTokensBalances[hash] ?? []
          const addressTokensSearchableString = addressTokensBalances
            .map(({ id }) => {
              const listedFt = listedFts.find((token) => token.id === id)

              if (listedFt) return `${listedFt.name.toLowerCase()} ${listedFt.symbol.toLowerCase()} ${id}`

              const unlistedFt = unlistedFts.find((token) => token.id === id)

              if (unlistedFt) return `${unlistedFt.name.toLowerCase()} ${unlistedFt.symbol.toLowerCase()} ${id}`

              const nftSearchString = nftsSearchStringsByNftId[id]

              if (nftSearchString) return nftSearchString.toLowerCase()

              return ''
            })
            .join(' ')

          return {
            value: hash,
            label: address?.label || hash,
            searchString: `${hash.toLowerCase()} ${address?.label?.toLowerCase() ?? ''} ${
              addressHasAlphBalances ? 'alephium alph' : ''
            } ${addressTokensSearchableString}`
          }
        }),
    [
      addressOptions,
      addresses,
      addressesAlphBalances,
      addressesTokensBalances,
      listedFts,
      nftsSearchStringsByNftId,
      sortedAddressHashes,
      unlistedFts
    ]
  )
}
