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
import { useQuery } from '@tanstack/react-query'

import useFetchAddressLastTransaction from '@/api/apiDataHooks/address/useFetchAddressLastTransaction'
import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'

interface UseAddressAlphBalancesProps extends SkipProp {
  addressHash: AddressHash
}

const useFetchAddressBalancesAlph = ({ addressHash, skip }: UseAddressAlphBalancesProps) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const queryProps = { addressHash, networkId }

  const { data: detectedNewTxs, isLoading: isLoadingTxHashes } = useFetchAddressLastTransaction({ addressHash })

  const { data, isLoading: isLoadingAlphBalances } = useQuery(
    addressAlphBalancesQuery({
      ...queryProps,
      latestTxHash: detectedNewTxs?.latestTx?.hash,
      previousTxHash: detectedNewTxs?.previousTx?.hash,
      skip: isLoadingTxHashes || skip
    })
  )

  return {
    data: data?.balances,
    isLoading: isLoadingAlphBalances || isLoadingTxHashes
  }
}

export default useFetchAddressBalancesAlph
