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

import { useIsFetching } from '@tanstack/react-query'
import { useCallback } from 'react'

import queryClient from '@/api/queryClient'
import { useUnsortedAddressesHashes } from '@/hooks/useAddresses'

const useRefreshBalances = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const isFetchingBalances =
    useIsFetching({
      queryKey: ['address'],
      predicate: (query) => {
        const secondSegment = query.queryKey[1]?.toString() ?? ''
        const thirdSegment = query.queryKey[2]?.toString() ?? ''

        return addressHashes.includes(secondSegment) && thirdSegment === 'balance'
      }
    }) > 0

  const refreshBalances = useCallback(() => {
    if (isFetchingBalances) return

    addressHashes.forEach((addressHash) => {
      queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'balance'] })
    })
  }, [addressHashes, isFetchingBalances])

  return {
    refreshBalances,
    isFetchingBalances
  }
}

export default useRefreshBalances
