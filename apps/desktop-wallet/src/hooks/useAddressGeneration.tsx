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

import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { AddressMetadata } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'

import { discoverAndCacheActiveAddresses } from '@/api/addresses'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  addressDiscoveryFinished,
  addressDiscoveryStarted,
  addressesRestoredFromMetadata,
  addressRestorationStarted
} from '@/storage/addresses/addressesActions'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { AddressBase } from '@/types/addresses'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

interface GenerateAddressProps {
  group?: number
}

interface DiscoverUsedAddressesProps {
  walletId?: string
  skipIndexes?: number[]
  enableLoading?: boolean
}

interface GenerateOneAddressPerGroupProps {
  labelPrefix?: string
  labelColor?: string
  skipGroups?: number[]
}

const useAddressGeneration = () => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)

  const currentAddressIndexes = addresses.map(({ index }) => index)

  const generateAddress = (group?: GenerateAddressProps['group']): NonSensitiveAddressData =>
    keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes })

  const generateAndSaveOneAddressPerGroup = (
    { labelPrefix, labelColor, skipGroups = [] }: GenerateOneAddressPerGroupProps = { skipGroups: [] }
  ) => {
    const groups = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (_, group) => group).filter(
      (group) => !skipGroups.includes(group)
    )
    const randomLabelColor = getRandomLabelColor()

    try {
      const addresses: AddressBase[] = groups.map((group) => ({
        ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes }),
        isDefault: false,
        label: labelPrefix ? `${labelPrefix} ${group}` : '',
        color: labelColor ?? randomLabelColor
      }))

      saveNewAddresses(addresses)
    } catch (e) {
      console.error(e)
    }
  }

  const restoreAddressesFromMetadata = async (walletId: StoredEncryptedWallet['id']) => {
    const addressesMetadata: AddressMetadata[] = addressMetadataStorage.load(walletId)

    // When no metadata found (ie, upgrading from a version older then v1.2.0) initialize with default address
    if (addressesMetadata.length === 0) {
      const initialAddressSettings = getInitialAddressSettings()
      addressMetadataStorage.storeOne(walletId, { index: 0, settings: initialAddressSettings })
      addressesMetadata.push({ index: 0, ...initialAddressSettings })
    }

    dispatch(addressRestorationStarted())

    try {
      const addresses = addressesMetadata.map(({ index }) => ({
        ...keyring.generateAndCacheAddress({ addressIndex: index }),
        ...(addressesMetadata.find((metadata) => metadata.index === index) as AddressMetadata)
      }))

      dispatch(addressesRestoredFromMetadata(addresses))
    } catch (e) {
      console.error(e)
    }
  }

  const discoverAndSaveUsedAddresses = async ({
    skipIndexes,
    enableLoading = true
  }: DiscoverUsedAddressesProps = {}) => {
    dispatch(addressDiscoveryStarted(enableLoading))

    try {
      const derivedAddresses = await discoverAndCacheActiveAddresses(skipIndexes)
      const newAddresses = derivedAddresses.map((address) => ({
        ...address,
        isDefault: false,
        color: getRandomLabelColor()
      }))

      saveNewAddresses(newAddresses)
      dispatch(addressDiscoveryFinished(enableLoading))
    } catch (e) {
      console.error(e)
    }
  }

  return {
    generateAddress,
    generateAndSaveOneAddressPerGroup,
    restoreAddressesFromMetadata,
    discoverAndSaveUsedAddresses
  }
}

export default useAddressGeneration
