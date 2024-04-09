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
import { AddressMetadata, client } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'

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

// const addressDiscoveryWorker = new Worker(new URL('../workers/addressDiscovery.ts', import.meta.url), {
//   type: 'module'
// })
// const deriveAddressesInGroupsWorker = new Worker(new URL('../workers/deriveAddressesInGroups.ts', import.meta.url), {
//   type: 'module'
// })
// const deriveAddressesFromIndexesWorker = new Worker(
//   new URL('../workers/deriveAddressesFromIndexes.ts', import.meta.url),
//   { type: 'module' }
// )

const useAddressGeneration = () => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  // const explorerApiHost = useAppSelector((s) => s.network.settings.explorerApiHost)

  const currentAddressIndexes = addresses.map(({ index }) => index)

  const generateAddress = ({ group }: GenerateAddressProps = {}): NonSensitiveAddressData =>
    keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes })

  const generateAndSaveOneAddressPerGroup = (
    { labelPrefix, labelColor, skipGroups = [] }: GenerateOneAddressPerGroupProps = { skipGroups: [] }
  ) => {
    const groups = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (_, group) => group).filter(
      (group) => !skipGroups.includes(group)
    )

    const onAddressesDerivedCallback = ({ data }: { data: (NonSensitiveAddressData & { group: number })[] }) => {
      const randomLabelColor = getRandomLabelColor()
      const addresses: AddressBase[] = data.map((address) => ({
        ...address,
        isDefault: false,
        label: labelPrefix ? `${labelPrefix} ${address.group}` : '',
        color: labelColor ?? randomLabelColor
      }))

      try {
        saveNewAddresses(addresses)
      } catch (e) {
        console.error(e)
      }
    }

    // deriveAddressesInGroupsWorker.onmessage = onAddressesDerivedCallback
    // deriveAddressesInGroupsWorker.postMessage({ groups, skipIndexes: currentAddressIndexes })

    // Moving the address derivation work from the web worker:
    const data = groups.map((group) => ({
      ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes }),
      group
    }))
    onAddressesDerivedCallback({ data })
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

    const onAddressesDerivedCallback = async ({ data }: { data: NonSensitiveAddressData[] }) => {
      const restoredAddresses: AddressBase[] = data.map((address) => ({
        ...address,
        ...(addressesMetadata.find((metadata) => metadata.index === address.index) as AddressMetadata)
      }))

      dispatch(addressesRestoredFromMetadata(restoredAddresses))
    }

    // deriveAddressesFromIndexesWorker.onmessage = onAddressesDerivedCallback
    // deriveAddressesFromIndexesWorker.postMessage({ indexesToDerive: addressesMetadata.map(({ index }) => index) })

    // Moving the address derivation work from the web worker:
    const data = addressesMetadata.map(({ index }) => keyring.generateAndCacheAddress({ addressIndex: index }))
    onAddressesDerivedCallback({ data })
  }

  const discoverAndSaveUsedAddresses = async ({
    skipIndexes,
    enableLoading = true
  }: DiscoverUsedAddressesProps = {}) => {
    const onAddressesDerivedCallback = ({ data }: { data: NonSensitiveAddressData[] }) => {
      const addresses: AddressBase[] = data.map((address) => ({
        ...address,
        isDefault: false,
        color: getRandomLabelColor()
      }))

      try {
        saveNewAddresses(addresses)
        dispatch(addressDiscoveryFinished(enableLoading))
      } catch (e) {
        console.error(e)
      }
    }

    // addressDiscoveryWorker.onmessage = onAddressesDerivedCallback

    dispatch(addressDiscoveryStarted(enableLoading))

    // addressDiscoveryWorker.postMessage({
    //   skipIndexes: skipIndexes && skipIndexes.length > 0 ? skipIndexes : currentAddressIndexes,
    //   clientUrl: explorerApiHost
    // })

    // Moving the address derivation work from the web worker:
    const data = await keyring.discoverAndCacheActiveAddresses(client.explorer, skipIndexes)
    onAddressesDerivedCallback({ data })
  }

  return {
    generateAddress,
    generateAndSaveOneAddressPerGroup,
    restoreAddressesFromMetadata,
    discoverAndSaveUsedAddresses
  }
}

export default useAddressGeneration
