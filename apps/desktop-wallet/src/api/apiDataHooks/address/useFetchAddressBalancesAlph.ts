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

import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/settings/networkSelectors'

const useFetchAddressBalancesAlph = ({ addressHash, skip }: UseFetchAddressProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data, isLoading } = useQuery(addressAlphBalancesQuery({ addressHash, networkId, skip }))

  return {
    data: data?.balances,
    isLoading
  }
}

export default useFetchAddressBalancesAlph
