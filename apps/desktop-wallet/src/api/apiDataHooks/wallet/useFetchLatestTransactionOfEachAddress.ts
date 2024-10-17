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

import { useQueries } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { flatMapCombine } from '@/api/apiDataHooks/apiDataHooksUtils'
import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/settings/networkSelectors'

const useFetchLatestTransactionOfEachAddress = (props?: SkipProp) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data, isLoading } = useQueries({
    queries: !props?.skip
      ? allAddressHashes.map((addressHash) => addressLatestTransactionQuery({ addressHash, networkId }))
      : [],
    combine: flatMapCombine
  })

  return {
    data,
    isLoading
  }
}

export default useFetchLatestTransactionOfEachAddress
