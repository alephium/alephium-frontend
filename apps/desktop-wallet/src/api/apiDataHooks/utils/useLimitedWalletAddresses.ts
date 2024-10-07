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

import { ADDRESSES_QUERY_LIMIT } from '@alephium/shared'
import { useMemo } from 'react'

import useFetchWalletAddressesHashesSortedByActivity from '@/api/apiDataHooks/wallet/useFetchWalletAddressesHashesSortedByActivity'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'

const useLimitedWalletAddresses = () => {
  const allAddressHashes = useAppSelector(selectAllAddressHashes)

  const exceedsAddressLimit = allAddressHashes.length > ADDRESSES_QUERY_LIMIT
  const { data: allAddressHashesSorted, isLoading: isLoadingSortedAddresses } =
    useFetchWalletAddressesHashesSortedByActivity({
      skip: !exceedsAddressLimit
    })

  return {
    isLimited: exceedsAddressLimit,
    addressHashes: useMemo(
      () =>
        exceedsAddressLimit
          ? !isLoadingSortedAddresses
            ? allAddressHashesSorted.slice(0, ADDRESSES_QUERY_LIMIT)
            : []
          : allAddressHashes,
      [allAddressHashes, allAddressHashesSorted, exceedsAddressLimit, isLoadingSortedAddresses]
    )
  }
}

export default useLimitedWalletAddresses
