import { keyring } from '@alephium/keyring'
import { GROUPLESS_ADDRESS_KEY_TYPE } from '@alephium/shared'
import { newAddressesSaved, selectAllAddressByType, selectAllAddressIndexes } from '@alephium/shared/store'
import { Address, AddressHash } from '@alephium/shared/types'
import { useCallback, useState } from 'react'

import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/walletMnemonic'
import { getRandomLabelColor } from '~/utils/colors'

interface UseMigrationDestinationAddressResult {
  destination: Address | undefined
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

  const defaultGrouplessAddress = grouplessAddresses.find(({ isDefault }) => isDefault) ?? grouplessAddresses.at(0)
  const destination = grouplessAddresses.find(({ hash }) => hash === selectedHash) ?? defaultGrouplessAddress

  const resolveDestinationAddressHash = useCallback(async () => {
    if (destination) return destination.hash

    try {
      await initializeKeyringWithStoredWallet(walletId)

      const generatedAddress = keyring.generateAndCacheAddress({
        skipAddressIndexes: indexesOfGrouplessAddresses,
        keyType: GROUPLESS_ADDRESS_KEY_TYPE
      })
      const newAddress = { ...generatedAddress, label: '', color: getRandomLabelColor(), isDefault: false }

      await persistAddressSettings(newAddress)
      dispatch(newAddressesSaved([{ ...newAddress, isNew: true }]))

      return newAddress.hash
    } finally {
      keyring.clear()
    }
  }, [destination, dispatch, indexesOfGrouplessAddresses, persistAddressSettings, walletId])

  return { destination, grouplessAddresses, selectDestination: setSelectedHash, resolveDestinationAddressHash }
}

export default useMigrationDestinationAddress
