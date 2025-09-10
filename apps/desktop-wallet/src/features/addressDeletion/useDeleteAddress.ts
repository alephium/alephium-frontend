import { addressDeleted, AddressHash } from '@alephium/shared'
import { queryClient } from '@alephium/shared-react'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'

const useDeleteAddress = () => {
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const dispatch = useAppDispatch()
  const addressEntities = useAppSelector((s) => s.addresses.entities)

  const deleteAddress = (addressHash: AddressHash) => {
    const address = addressEntities[addressHash]

    if (!address || !activeWalletId) return

    try {
      addressMetadataStorage.deleteOne(activeWalletId, address.index, address.keyType)
      queryClient.removeQueries({ queryKey: ['address', addressHash] })
      dispatch(addressDeleted(address.hash))
    } catch (error) {
      console.error(error)
    }
  }

  return deleteAddress
}

export default useDeleteAddress
