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
import { explorer } from '@alephium/web3'
import { useMemo } from 'react'

import useAddressesListedFTs from '@/api/apiDataHooks/useAddressesListedFTs'

// TODO: Delete in favor of new hooks
const useAddressesPricedFTs = (addressHash?: AddressHash) => {
  const { data: listedFts, isLoading: isLoadingListedFTs } = useAddressesListedFTs(addressHash)

  const listedFTsWithPrice = useMemo(
    () => listedFts.filter((token) => token.symbol in explorer.TokensWithPrice),
    [listedFts]
  )

  return {
    data: listedFTsWithPrice,
    isLoading: isLoadingListedFTs
  }
}

export default useAddressesPricedFTs
