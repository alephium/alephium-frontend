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

import { useAddressesListedFungibleTokens } from '@/api/addressesListedFungibleTokensDataHooks'
import { useAddressesTokensWorth } from '@/api/addressesTokensPricesDataHooks'
import { useAddressesUnlistedFungibleTokens } from '@/api/addressesUnlistedTokensHooks'

const useAddressesSortedFungibleTokens = (addressHash?: AddressHash) => {
  const { data: addressesTokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth(addressHash)
  const { data: addressesListedFungibleTokens, isLoading: isLoadingListedFungibleTokens } =
    useAddressesListedFungibleTokens(addressHash)
  const { data: addressesUnlistedFungibleTokens, isLoading: isLoadingUnlistedFungibleTokens } =
    useAddressesUnlistedFungibleTokens(addressHash)

  const sortedTokens = useMemo(
    () => [
      ...orderBy(
        addressesListedFungibleTokens,
        [(t) => addressesTokensWorth[t.id] ?? -1, (t) => t.name.toLowerCase()],
        ['desc', 'asc']
      ),
      ...orderBy(addressesUnlistedFungibleTokens, [(t) => t.name.toLowerCase(), 'id'], ['asc', 'asc'])
    ],
    [addressesListedFungibleTokens, addressesTokensWorth, addressesUnlistedFungibleTokens]
  )

  return {
    data: sortedTokens,
    isLoading: isLoadingTokensWorth || isLoadingListedFungibleTokens || isLoadingUnlistedFungibleTokens
  }
}

export default useAddressesSortedFungibleTokens
