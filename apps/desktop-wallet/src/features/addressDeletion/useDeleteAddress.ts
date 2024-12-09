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

import queryClient from '@/api/queryClient'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { addressDeleted } from '@/storage/addresses/addressesActions'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'

const useDeleteAddress = () => {
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const dispatch = useAppDispatch()
  const addressEntities = useAppSelector((s) => s.addresses.entities)

  const deleteAddress = (addressHash: AddressHash) => {
    const address = addressEntities[addressHash]

    if (!address || !activeWalletId) return

    try {
      addressMetadataStorage.deleteOne(activeWalletId, address.index)
      queryClient.removeQueries({ queryKey: ['address', addressHash] })
      dispatch(addressDeleted(address.hash))
    } catch (error) {
      console.error(error)
    }
  }

  return deleteAddress
}

export default useDeleteAddress
