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

import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useFetchWalletActivityTimestamps } from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactions'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

const useFetchWalletAddressesSortedByActivity = () => {
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const { data, isLoading } = useFetchWalletActivityTimestamps()

  const sortedAddressHashes = useMemo(
    () =>
      orderBy(
        data,
        ({ addressHash, latestTxTimestamp }) =>
          addressHash === defaultAddressHash ? undefined : latestTxTimestamp ?? 0,
        'desc'
      ).map(({ addressHash }) => addressHash),
    [data, defaultAddressHash]
  )

  return {
    data: !isLoading ? sortedAddressHashes : allAddressHashes,
    isLoading
  }
}

export default useFetchWalletAddressesSortedByActivity
