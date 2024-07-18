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

import { AddressHash, client } from '@alephium/shared'
import { queryOptions } from '@tanstack/react-query'

interface AddressBalanceQueryProps {
  addressHash: AddressHash
  networkId: number
  latestTxHash?: string
}

// Adding latestTxHash in queryKey ensures that we'll refetch when new txs arrive.
// Adding networkId in queryKey ensures that switching the network we get different data.
// TODO: Should we add explorerBackendUrl instead?
export const addressBalanceQuery = ({ addressHash, networkId, latestTxHash }: AddressBalanceQueryProps) =>
  queryOptions({
    queryKey: ['address', 'balance', { addressHash, latestTxHash, networkId }],
    queryFn: () => client.explorer.addresses.getAddressesAddressBalance(addressHash),
    staleTime: Infinity
  })
