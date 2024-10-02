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

import useFetchAddressUpdatesSignal from '@/api/apiDataHooks/address/useFetchAddressUpdatesSignal'
import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'

interface UseAddressAlphBalancesProps extends SkipProp {
  addressHash: AddressHash
}

const useFetchAddressBalancesAlph = ({ addressHash, skip }: UseAddressAlphBalancesProps) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data: updatesSignal, isLoading: isLoadingUpdatesSignal } = useFetchAddressUpdatesSignal({ addressHash, skip })
  const { data, isLoading: isLoadingAlphBalances } = useQuery(
    addressAlphBalancesQuery({
      addressHash,
      networkId,
      latestTxHash: updatesSignal?.latestTx?.hash,
      previousTxHash: updatesSignal?.previousTx?.hash,
      skip: isLoadingUpdatesSignal || skip
    })
  )

  return {
    data: data?.balances,
    isLoading: isLoadingAlphBalances || isLoadingUpdatesSignal
  }
}

export default useFetchAddressBalancesAlph
