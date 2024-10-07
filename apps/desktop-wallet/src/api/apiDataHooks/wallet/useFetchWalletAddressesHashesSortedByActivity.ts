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

import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchWalletSortedActivityTimestamps from '@/api/apiDataHooks/wallet/useFetchWalletSortedActivityTimestamps'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'

const useFetchWalletAddressesHashesSortedByActivity = (props?: SkipProp) => {
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const { data: addressesActivityTimestamps, isLoading } = useFetchWalletSortedActivityTimestamps(props)

  const sortedAddressHashes = useMemo(
    () => addressesActivityTimestamps.map(({ addressHash }) => addressHash),
    [addressesActivityTimestamps]
  )

  return {
    data: !isLoading && !props?.skip ? sortedAddressHashes : allAddressHashes,
    isLoading
  }
}

export default useFetchWalletAddressesHashesSortedByActivity
