import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { GROUPLESS_ADDRESS_KEY_TYPE } from '@alephium/shared'
import { newAddressesSaved, selectAllAddressByType, selectAllAddressIndexes } from '@alephium/shared/store'
import { Address, AddressHash } from '@alephium/shared/types'
import { useCallback, useEffect, useState } from 'react'

import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/walletMnemonic'
import { getRandomLabelColor } from '~/utils/colors'

interface UseMigrationDestinationAddressResult {
  destination: Address | undefined
  destinationHash: AddressHash | undefined
  grouplessAddresses: Address[]
  selectDestination: (addressHash: AddressHash) => void
  resolveDestinationAddressHash: () => Promise<AddressHash>
}

const useMigrationDestinationAddress = (): UseMigrationDestinationAddressResult => {
  const dispatch = useAppDispatch()
  const { grouplessAddresses } = useAppSelector(selectAllAddressByType)
  const { indexesOfGrouplessAddresses } = useAppSelector(selectAllAddressIndexes)
  const walletId = useAppSelector((s) => s.wallet.id)
  const persistAddressSettings = usePersistAddressSettings()

  const [selectedHash, setSelectedHash] = useState<AddressHash>()
  const [derivedAddress, setDerivedAddress] = useState<NonSensitiveAddressData>()

  const defaultGrouplessAddress = grouplessAddresses.find(({ isDefault }) => isDefault) ?? grouplessAddresses.at(0)
  const destination = grouplessAddresses.find(({ hash }) => hash === selectedHash) ?? defaultGrouplessAddress

  const deriveGrouplessAddress = useCallback(async () => {
    try {
      await initializeKeyringWithStoredWallet(walletId)

      return keyring.generateAndCacheAddress({
        skipAddressIndexes: indexesOfGrouplessAddresses,
        keyType: GROUPLESS_ADDRESS_KEY_TYPE
      })
    } finally {
      keyring.clear()
    }
  }, [indexesOfGrouplessAddresses, walletId])

  useEffect(() => {
    if (destination || derivedAddress) return

    deriveGrouplessAddress().then(setDerivedAddress).catch(console.error)
  }, [derivedAddress, deriveGrouplessAddress, destination])

  const resolveDestinationAddressHash = useCallback(async () => {
    if (destination) return destination.hash

    const generatedAddress = derivedAddress ?? (await deriveGrouplessAddress())
    const newAddress = { ...generatedAddress, label: '', color: getRandomLabelColor(), isDefault: false }

    await persistAddressSettings(newAddress)
    dispatch(newAddressesSaved([{ ...newAddress, isNew: true }]))

    return newAddress.hash
  }, [derivedAddress, deriveGrouplessAddress, destination, dispatch, persistAddressSettings])

  return {
    destination,
    destinationHash: destination?.hash ?? derivedAddress?.hash,
    grouplessAddresses,
    selectDestination: setSelectedHash,
    resolveDestinationAddressHash
  }
}

export default useMigrationDestinationAddress
