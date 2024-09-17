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

import useFetchAddressAlphBalances from '@/api/apiDataHooks/address/useFetchAddressAlphBalances'
import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchSortedFts from '@/api/apiDataHooks/useFetchSortedFts'

interface UseAddressFTsProps {
  addressHash: AddressHash
  sort?: boolean
}

const useFetchAddressFts = ({ addressHash, sort = true }: UseAddressFTsProps) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressAlphBalances({ addressHash })
  const {
    data: { listedFTs, unlistedFTIds },
    isLoading: isLoadingTokensByType
  } = useFetchAddressTokensByType(addressHash)

  const { sortedListedFTs, sortedUnlistedFTs, isLoading } = useFetchSortedFts({
    listedFTs,
    unlistedFTIds,
    alphBalances,
    skip: !sort
  })

  return {
    listedFTs: sortedListedFTs,
    unlistedFTs: sortedUnlistedFTs,
    isLoading: isLoading || isLoadingTokensByType || isLoadingAlphBalances
  }
}

export default useFetchAddressFts
