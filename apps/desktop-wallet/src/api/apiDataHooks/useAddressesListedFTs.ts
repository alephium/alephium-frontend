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
import { useMemo } from 'react'

import useAddressesTokensBalances from '@/api/apiDataHooks/useAddressesTokensBalances'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { ListedFT } from '@/types/tokens'

const useAddressesListedFTs = (addressHash?: AddressHash) => {
  const { data: fungibleTokenList, isLoading: isLoadingFungibleTokenList } = useFungibleTokenList()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTokensBalances(addressHash)

  const listedFTs = useMemo(
    () =>
      Object.values(tokensBalances).reduce((acc, addressTokensBalances) => {
        addressTokensBalances?.map(({ id }) => {
          const listedFungibleToken = fungibleTokenList?.find((token) => token.id === id)
          const alreadyAddedToArray = acc.some((token) => token.id === listedFungibleToken?.id)

          if (listedFungibleToken && !alreadyAddedToArray) acc.push(listedFungibleToken)
        })
        return acc
      }, [] as ListedFT[]),
    [fungibleTokenList, tokensBalances]
  )

  return {
    data: listedFTs,
    isLoading: isLoadingFungibleTokenList || isLoadingTokensBalances
  }
}

export default useAddressesListedFTs
