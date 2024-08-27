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
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useAddressesUnlistedFTs } from '@/api/addressesUnlistedTokensHooks'
import useAddressesListedFTs from '@/api/apiDataHooks/useAddressesListedFTs'
import useAddressesTokensWorth from '@/api/apiDataHooks/useAddressesTokensWorth'
import { ListedFT, UnlistedFT } from '@/types/tokens'

// TODO: Merge with useAddressDisplayTokens?
const useAddressesSortedFungibleTokens = (addressHash?: AddressHash) => {
  const { data: addressesTokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth(addressHash)
  const { data: addressesListedFTs, isLoading: isLoadingListedFTs } = useAddressesListedFTs(addressHash)
  const { data: addressesUnlistedFTs, isLoading: isLoadingUnlistedFTs } = useAddressesUnlistedFTs(addressHash)

  const sortedTokens = useMemo(
    () => [
      ...orderBy(
        addressesListedFTs,
        [(t) => addressesTokensWorth[t.id] ?? -1, (t) => t.name.toLowerCase()],
        ['desc', 'asc']
      ),
      ...orderBy(addressesUnlistedFTs, [(t) => t.name.toLowerCase(), 'id'], ['asc', 'asc'])
    ],
    [addressesListedFTs, addressesTokensWorth, addressesUnlistedFTs]
  ) as (ListedFT | UnlistedFT)[]

  return {
    data: sortedTokens,
    isLoading: isLoadingTokensWorth || isLoadingListedFTs || isLoadingUnlistedFTs
  }
}

export default useAddressesSortedFungibleTokens
